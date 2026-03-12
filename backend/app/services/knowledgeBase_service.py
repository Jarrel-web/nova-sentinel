import boto3
import os
from app.config import AWS_REGION, KNOWLEDGE_BASE_ID

bedrock_agent_runtime = boto3.client(
    "bedrock-agent-runtime",
    region_name=AWS_REGION,
)

def extract_document_metadata(s3_uri: str, location: dict) -> dict:
    """
    Extract document name and page number from S3 URI and location metadata.
    
    Args:
        s3_uri: S3 URI (e.g., s3://bucket/path/to/document.pdf)
        location: Location metadata from retrieval result
    
    Returns:
        Dict with document_name and page_number
    """
    # Extract document name from S3 URI
    document_name = "unknown"
    if s3_uri and "s3://" in s3_uri:
        document_name = os.path.basename(s3_uri)
    
    # Extract page number from location metadata if available
    page_number = None
    if location:
        # Check for PDF metadata
        pdf_location = location.get("pdfLocation")
        if pdf_location:
            page_number = pdf_location.get("pageNumber")
    
    return {
        "document_name": document_name,
        "page_number": page_number,
        "s3_uri": s3_uri
    }

def retrieve_policy_context(query: str, top_k: int = 5) -> dict:
    response = bedrock_agent_runtime.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": query},
        retrievalConfiguration={
            "vectorSearchConfiguration": {
                "numberOfResults": top_k
            }
        }
    )

    retrieval_results = response.get("retrievalResults", [])

    chunks = []
    citations = []
    policies = []

    for item in retrieval_results:
        text = item.get("content", {}).get("text", "")
        score = item.get("score")
        location = item.get("location", {})
        s3_uri = location.get("s3Location", {}).get("uri", "unknown-source")

        if text:
            # Extract document metadata
            metadata = extract_document_metadata(s3_uri, location)
            
            # Create citation entry
            citation = {
                "document_name": metadata["document_name"],
                "page_number": metadata["page_number"],
                "s3_uri": metadata["s3_uri"],
                "score": score,
                "excerpt": text[:400]
            }
            citations.append(citation)
            
            # Create policy entry with full metadata
            policies.append({
                "content": text,
                "citation": citation,
                "score": score
            })
            
            # Build context string with citation info
            citation_str = f"Source: {metadata['document_name']}"
            if metadata["page_number"]:
                citation_str += f" (Page {metadata['page_number']})"
            citation_str += f"\nDocument URI: {s3_uri}\n"
            
            chunks.append(f"{citation_str}\n{text}")

    return {
        "policy_context": "\n\n---\n\n".join(chunks),
        "citations": citations,
        "policies": policies
    }