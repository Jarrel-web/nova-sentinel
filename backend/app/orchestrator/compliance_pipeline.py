from app.agents.document_intake_agent import document_intake
from app.agents.policy_retrieval_agent import policy_retrieval
from app.agents.compliance_analysis_agent import compliance_analysis

def run_compliance_pipeline(document_text: str) -> dict:
    document_summary = document_intake(document_text)
    policy_context = policy_retrieval(document_summary)
    analysis_result = compliance_analysis(document_text, policy_context)

    analysis_result["retrieved_policy_context"] = policy_context
    return analysis_result