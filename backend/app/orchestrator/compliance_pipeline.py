from app.agents.document_intake_agent import document_intake
from app.agents.policy_retrieval_agent import policy_retrieval
from app.agents.compliance_analysis_agent import compliance_analysis

def run_compliance_pipeline(document_text: str) -> dict:
    document_summary = document_intake(document_text)

    policy_data = policy_retrieval(document_summary["cleaned_text"])
    policy_context = policy_data["policy_context"]
    citations = policy_data["citations"]

    analysis_result = compliance_analysis(document_text, policy_context)

    analysis_result["citations"] = citations
    recommended_actions = [
    {
        "issue": issue["issue"],
        "action": issue["suggested_fix"],
        "risk_level": issue["risk_level"]
    }
    for issue in analysis_result.get("issues", [])
    if issue.get("suggested_fix")
    ]
    final_result = {
    "summary": analysis_result.get("summary"),
    "compliance_score": analysis_result.get("compliance_score"),
    "issues": analysis_result.get("issues", []),
    "recommended_actions": recommended_actions
    }
    return final_result