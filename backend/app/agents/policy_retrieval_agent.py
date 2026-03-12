from typing import Dict, Any
from app.services.knowledgeBase_service import retrieve_policy_context

def policy_retrieval(document_summary: str) -> Dict[str, Any]:
    """
    Retrieve relevant policies and citations for a document.
    
    Args:
        document_summary: Cleaned document text to search for relevant policies
    
    Returns:
        Dict containing:
        - policy_context: Formatted string with all policy chunks and citations
        - citations: List of citation metadata (document_name, page_number, score, excerpt)
        - policies: List of policy dicts with full metadata for enrichment
    """
    return retrieve_policy_context(document_summary, top_k=5)