from app.services.knowledgeBase_service import retrieve_policy_context

def policy_retrieval(document_summary: str) -> str:
    return retrieve_policy_context(document_summary, top_k=5)