from app.agents.document_intake_agent import document_intake
from app.agents.policy_retrieval_agent import policy_retrieval
from app.agents.compliance_analysis_agent import compliance_analysis
from app.services.analysis_normalizer import normalize_analysis_result


def run_compliance_pipeline(document_text: str, filename: str | None = None) -> dict:
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

    pipeline_steps = [
        {
            "id": "intake",
            "label": "Document intake",
            "status": "completed",
            "detail": f"Prepared {document_summary.get('num_chunks', 0)} chunk(s) for downstream analysis.",
        },
        {
            "id": "policy-retrieval",
            "label": "Policy retrieval",
            "status": "completed",
            "detail": f"Matched {len(policies)} policy source(s) and {len(citations)} citation(s).",
        },
        {
            "id": "analysis",
            "label": "AI compliance analysis",
            "status": "completed",
            "detail": f"Generated {len(analysis_result.get('issues', []))} raw issue candidate(s).",
        },
        {
            "id": "normalization",
            "label": "Result normalization",
            "status": "completed",
            "detail": "Deduplicated overlapping findings and prepared explainable issue cards.",
        },
    ]

    return normalize_analysis_result(analysis_result, filename=filename, pipeline_steps=pipeline_steps)
