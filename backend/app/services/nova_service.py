import boto3
from app.config import AWS_REGION, NOVA_MODEL_ID

_bedrock_runtime = None


def _get_bedrock_runtime():
    global _bedrock_runtime
    if _bedrock_runtime is None:
        _bedrock_runtime = boto3.client("bedrock-runtime", region_name=AWS_REGION)
    return _bedrock_runtime

def invoke_nova(prompt: str) -> dict:
    if not NOVA_MODEL_ID:
        raise ValueError("NOVA_MODEL_ID is not configured.")

    response = _get_bedrock_runtime().converse(
        modelId=NOVA_MODEL_ID,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        inferenceConfig={
            "maxTokens": 1200,
            "temperature": 0.1,
            "topP": 0.9
        }
    )

    return response
