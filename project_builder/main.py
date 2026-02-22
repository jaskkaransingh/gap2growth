from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import shutil
from dotenv import load_dotenv
from loaders import RepoLoader
from rag_pipeline import RAGPipeline
from chains import get_qa_chain
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="GitHub Repository RAG Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state for the RAG system
rag_pipeline = RAGPipeline()
current_vector_store = None
qa_chain = None

class IngestRequest(BaseModel):
    repo_url: str

class AskRequest(BaseModel):
    question: str

@app.post("/ingest")
async def ingest_repo(request: IngestRequest):
    global current_vector_store, qa_chain
    print(f"--- INGESTION START: {request.repo_url} ---")
    
    loader = RepoLoader(request.repo_url)
    try:
        print("Cloning repo...")
        temp_dir = loader.clone_repo()
        print("Loading code...")
        documents = loader.load_code()
        
        if not documents:
            print("No documents found!")
            raise HTTPException(status_code=400, detail="No source code files found in the repository.")
        
        print("Processing documents (Embedding & FAISS)...")
        current_vector_store = rag_pipeline.process_documents(documents)
        print("Building QA chain...")
        qa_chain = get_qa_chain(current_vector_store)
        
        # Cleanup cloned repo (non-blocking)
        try:
            print("Cleaning up repo loader...")
            loader.cleanup()
        except Exception as cleanup_error:
            print(f"Cleanup warning: {cleanup_error}")
        
        print(f"--- INGESTION SUCCESS ---")
        return {"message": f"Successfully ingested {len(documents)} files from {request.repo_url}"}
    
    except Exception as e:
        print(f"!!! INGESTION ERROR !!! -> {e}")
        loader.cleanup()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
async def ask_question(request: AskRequest):
    global qa_chain
    
    if not qa_chain:
        raise HTTPException(status_code=400, detail="No repository ingested yet. Please call /ingest first.")
    
    try:
        response = qa_chain.invoke({"query": request.question})
        return {
            "answer": response["result"],
            "sources": [doc.metadata.get("source") for doc in response["source_documents"]]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
