import json
from typing import Optional
from app.services.nova_service import invoke_nova
from app.utils.prompts import COMPLIANCE_ANALYSIS_PROMPT

def compliance_analysis(document_text: str, policy_context: str, policies: Optional[list] = None) -> dict:
    """
    Analyze document for compliance issues against policies.
    
    Args:
        document_text: The document to analyze
        policy_context: Formatted policy context string with citations
        policies: Optional list of policy dicts with metadata for enrichment
    
    Returns:
        Dict with summary, compliance_score, and issues with citations
    """
    prompt = COMPLIANCE_ANALYSIS_PROMPT.format(
        policy_context=policy_context,
        document_text=document_text
    )

    response = invoke_nova(prompt)

    try:
        text_output = response["output"]["message"]["content"][0]["text"].strip()
        print("Raw model output:", text_output)  # Debugging line
        # Remove markdown fences if model accidentally adds them
        if text_output.startswith("```json"):
            text_output = text_output.removeprefix("```json").removesuffix("```").strip()
        elif text_output.startswith("```"):
            text_output = text_output.removeprefix("```").removesuffix("```").strip()

        parsed = json.loads(text_output)

        # Validate and enhance issue citations
        issues = parsed.get("issues", [])
        for issue in issues:
            # Ensure citation structure exists
            if "citation" not in issue:
                issue["citation"] = {
                    "document_name": "unknown",
                    "page_number": None,
                    "relevant_excerpt": ""
                }

        return {
            "summary": parsed.get("summary", ""),
            "compliance_score": parsed.get("compliance_score"),
            "issues": issues
        }

    except Exception as e:
        return {
            "summary": f"Could not parse model output cleanly: {str(e)}",
            "compliance_score": None,
            "issues": []
        }