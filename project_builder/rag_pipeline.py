from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os
from dotenv import load_dotenv

load_dotenv()

class RAGPipeline:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            add_start_index=True,
            separators=["\n\n", "\n", ".", " ", ""]
        )
        self.vector_store = None
        self._embeddings = None

    @property
    def embeddings(self):
        if self._embeddings is None:
            print("Initializing HuggingFace local embeddings...")
            try:
                self._embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
                print("HuggingFace embeddings initialized locally.")
            except Exception as e:
                print(f"Failed to initialize local embeddings: {e}")
                raise
        return self._embeddings

    def process_documents(self, documents):
        """Splits documents and creates a FAISS vector store."""
        print(f"Splitting {len(documents)} documents...")
        texts = self.text_splitter.split_documents(documents)
        print(f"Created {len(texts)} chunks.")
        
        print(f"Creating vector store for {len(texts)} chunks using HuggingFace embeddings...")
        try:
            self.vector_store = FAISS.from_documents(texts, self.embeddings)
            print("Vector store created successfully.")
            return self.vector_store
        except Exception as e:
            print(f"FAILED to create vector store: {e}")
            raise

    def save_vector_store(self, path="faiss_index"):
        if self.vector_store:
            self.vector_store.save_local(path)

    def load_vector_store(self, path="faiss_index"):
        if os.path.exists(path):
            self.vector_store = FAISS.load_local(path, self.embeddings, allow_dangerous_deserialization=True)
            return self.vector_store
        return None
