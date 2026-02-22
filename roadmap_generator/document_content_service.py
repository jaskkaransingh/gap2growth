import os
import re

# We wrap the vectorstore imports because older pydantic/chromadb versions
# clash on Windows and prevent the entire FastAPI app from booting.
try:
    from langchain_community.vectorstores import FAISS
    from langchain_nomic import NomicEmbeddings
    VECTOR_DB_AVAILABLE = True
except Exception as e:
    print(f"Warning: Vector DB imports failed. Document processing disabled. Error: {e}")
    VECTOR_DB_AVAILABLE = False

VECTOR_DB_DIR = "vectorstore/faiss_indices"

def validate_collection_name(name: str) -> bool:
    pattern = r'^[a-zA-Z0-9._-]{3,512}$'
    return bool(re.match(pattern, name))

def get_document_chunks(document_id: str, k: int = 15) -> list[str]:
    if not VECTOR_DB_AVAILABLE:
        print("Vector processing is disabled due to dependency conflicts.")
        return []

    if not validate_collection_name(document_id):
        raise ValueError(f"Invalid collection name: {document_id}")

    index_path = os.path.join(VECTOR_DB_DIR, document_id)
    if not os.path.exists(index_path):
        return []

    try:
        vector_db = FAISS.load_local(
            index_path,
            NomicEmbeddings(model="nomic-embed-text-v1.5"),
            allow_dangerous_deserialization=True
        )
        docs = vector_db.similarity_search(
            "core concepts and key ideas of the document",
            k=k
        )
        return [doc.page_content for doc in docs]
    except Exception as e:
        print(f"FAISS search failed: {e}")
        return []

