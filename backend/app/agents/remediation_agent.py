from app.services.nova_service import invoke_nova
import json

def remediation_agent(document_text: str, issues: list) -> dict:
    prompt = f"""
You are a remediation assistant.
Given the document and identified compliance issues, provide fixes.

Document:
{document_text}

Issues:
{json.dumps(issues, indent=2)}

Return JSON with:
- fixes: array of strings
"""
    response = invoke_nova(prompt)

    try:
        text_output = response["output"]["message"]["content"][0]["text"]
        return json.loads(text_output)
    except Exception:
        return {"fixes": []}