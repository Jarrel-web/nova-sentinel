import json
import boto3
from app.config import AWS_REGION, NOVA_MODEL_ID

bedrock_runtime = boto3.client("bedrock-runtime", region_name=AWS_REGION)

def invoke_nova(prompt: str) -> dict:
    response = bedrock_runtime.converse(
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