import json
import boto3
from app.config import AWS_REGION, NOVA_MODEL_ID

bedrock_runtime = boto3.client("bedrock-runtime", region_name=AWS_REGION)

def invoke_nova(prompt: str) -> dict:
    body = {
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }

    response = bedrock_runtime.invoke_model(
        modelId=NOVA_MODEL_ID,
        body=json.dumps(body),
        contentType="application/json",
        accept="application/json"
    )

    raw = response["body"].read().decode("utf-8")
    return json.loads(raw)