import boto3
from app.config import AWS_REGION, KNOWLEDGE_BASE_ID

bedrock_agent_runtime = boto3.client("bedrock-agent-runtime", region_name=AWS_REGION)

def retrieve_policy_context(query: str, top_k: int = 5) -> str:
    response = bedrock_agent_runtime.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": query},
        retrievalConfiguration={
            "vectorSearchConfiguration": {
                "numberOfResults": top_k
            }
        }
    )

    results = response.get("retrievalResults", [])
    chunks = []

    for item in results:
        content = item.get("content", {})
        text = content.get("text", "")
        location = item.get("location", {})
        source = location.get("s3Location", {}).get("uri", "unknown-source")
        if text:
            chunks.append(f"Source: {source}\n{text}")

    return "\n\n---\n\n".join(chunks)