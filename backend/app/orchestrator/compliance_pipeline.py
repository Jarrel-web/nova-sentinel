from app.agents.document_intake_agent import document_intake
from app.agents.policy_retrieval_agent import policy_retrieval
from app.agents.compliance_analysis_agent import compliance_analysis

def run_compliance_pipeline(document_text: str) -> dict:
    """
    Run complete compliance analysis pipeline.
    
    Flow:
    1. Clean and process document
    2. Retrieve relevant policies and citations
    3. Analyze document against policies
    4. Return enriched results with citations and actions
    
    Args:
        document_text: Raw document text to analyze
    
    Returns:
        Dict with summary, compliance_score, risk_overview, top_issues, and issue count
    """
    # Step 1: Document intake - clean and chunk
    document_summary = document_intake(document_text)
    cleaned_text = document_summary["cleaned_text"]

    # Step 2: Policy retrieval - get relevant policies with citations
    policy_data = policy_retrieval(cleaned_text)
    policy_context = policy_data["policy_context"]
    citations = policy_data["citations"]
    policies = policy_data.get("policies", [])

    # Step 3: Compliance analysis - analyze against policies with citation data
    analysis_result = compliance_analysis(document_text, policy_context, policies)

    # Step 4: Calculate risk overview
    issues = analysis_result.get("issues", [])
    risk_counts = {"high": 0, "medium": 0, "low": 0}
    for issue in issues:
        risk_level = issue.get("risk_level", "").lower()
        if risk_level in risk_counts:
            risk_counts[risk_level] += 1

    # Step 5: Transform issues to top_issues format
    top_issues = []
    for issue in issues:
        citation = issue.get("citation", {})
        top_issue = {
            "title": issue.get("issue"),
            "risk_level": issue.get("risk_level"),
            "policy_reference": issue.get("policy_reference"),
            "source_document": citation.get("document_name"),
            "page_number": citation.get("page_number"),
            "evidence": citation.get("relevant_excerpt", ""),
            "why_it_matters": issue.get("explanation"),
            "recommended_action": issue.get("suggested_fix")
        }
        top_issues.append(top_issue)

    # Step 6: Assemble final result
    final_result = {
        "summary": analysis_result.get("summary"),
        "compliance_score": analysis_result.get("compliance_score"),
        "risk_overview": {
            "high": risk_counts["high"],
            "medium": risk_counts["medium"],
            "low": risk_counts["low"]
        },
        "top_issues": top_issues,
        "all_issues_count": len(issues)
    }
    return final_result