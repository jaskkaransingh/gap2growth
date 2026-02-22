# GitHub RAG Postman Examples

## 1. Health Check
**Method:** GET  
**URL:** `http://localhost:8006/health`

## 2. Ingest Repository
**Method:** POST  
**URL:** `http://localhost:8006/ingest`  
**Body (JSON):**
```json
{
    "repo_url": "https://github.com/fastapi/fastapi"
}
```

## 3. Ask Question
**Method:** POST  
**URL:** `http://localhost:8006/ask`  
**Body (JSON):**
```json
{
    "question": "How does the dependency injection system work in this project?"
}
```

## 4. Error Handling (No context)
**Method:** POST  
**URL:** `http://localhost:8006/ask`  
**Body (JSON):**
```json
{
    "question": "What is the weather today?"
}
```
**Expected Result:** "Not found in repository context."
