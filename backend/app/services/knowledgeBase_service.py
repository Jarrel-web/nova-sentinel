import boto3
from app.config import AWS_REGION, KNOWLEDGE_BASE_ID

bedrock_agent_runtime = boto3.client(
    "bedrock-agent-runtime",
    region_name=AWS_REGION,
)

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

    for item in retrieval_results:
        text = item.get("content", {}).get("text", "")
        score = item.get("score")
        location = item.get("location", {})
        s3_uri = location.get("s3Location", {}).get("uri", "unknown-source")

        if text:
            chunks.append(f"Source: {s3_uri}\n{text}")
            citations.append({
                "source": s3_uri,
                "score": score,
                "excerpt": text[:400]
            })

    return {
        "policy_context": "\n\n---\n\n".join(chunks),
        "citations": citations
    }