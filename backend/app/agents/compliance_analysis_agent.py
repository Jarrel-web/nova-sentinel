import json
from app.services.nova_service import invoke_nova
from app.utils.prompts import COMPLIANCE_ANALYSIS_PROMPT

def compliance_analysis(document_text: str, policy_context: str) -> dict:
    prompt = COMPLIANCE_ANALYSIS_PROMPT.format(
        policy_context=policy_context,
        document_text=document_text
    )

    response = invoke_nova(prompt)

    # Depending on model output shape, you may need to adjust extraction.
    # This is a placeholder pattern.
    try:
        text_output = response["output"]["message"]["content"][0]["text"]
        return json.loads(text_output)
    except Exception:
        return {
            "summary": "Could not parse model output cleanly.",
            "compliance_score": None,
            "issues": []
        }