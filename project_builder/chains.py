from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
import os
from dotenv import load_dotenv

load_dotenv()

class ManualRAGChain:
    def __init__(self, vector_store, llm, prompt):
        self.retriever = vector_store.as_retriever(search_kwargs={"k": 5})
        self.llm = llm
        self.prompt = prompt
        
        # Build the chain using LCEL (LangChain Expression Language)
        # This bypasses the need for langchain.chains.RetrievalQA
        self.chain = (
            {"context": self.retriever | self._format_docs, "question": RunnablePassthrough()}
            | self.prompt
            | self.llm
            | StrOutputParser()
        )

    def _format_docs(self, docs):
        self.last_docs = docs # Store for source tracking
        return "\n\n".join(doc.page_content for doc in docs)

    def invoke(self, inputs):
        # inputs is expected to be {"query": "..."} to match existing main.py logic
        query = inputs.get("query") or inputs.get("question")
        result = self.chain.invoke(query)
        return {
            "result": result,
            "source_documents": self.last_docs
        }

def get_qa_chain(vector_store):
    """Creates a manual RetrievalQA chain using the provided vector store."""
    
    llm = ChatOpenAI(
        model=os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3-8b-instruct"),
        openai_api_key=os.getenv("OPENROUTER_API_KEY"),
        openai_api_base=os.getenv("BASE_URL"),
    )

    template = """
    You are an expert software engineer assistant. Answer the question based ONLY on the provided code context.
    If the answer is not in the context, respond with: "Not found in repository context."
    
    Context:
    {context}
    
    Question: 
    {question}
    
    Technical, concise, and developer-focused answer:
    """

    prompt = PromptTemplate.from_template(template)

    return ManualRAGChain(vector_store, llm, prompt)
