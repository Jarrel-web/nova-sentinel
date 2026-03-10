from app.agents.document_intake_agent import document_intake
from app.agents.policy_retrieval_agent import policy_retrieval
from app.agents.compliance_analysis_agent import compliance_analysis


def _print_section(title: str, content):
    print("\n" + "=" * 80)
    print(title)
    print("=" * 80)
    print(content)


def test_pipeline_realistic_procurement_violation():
    # Realistic scenario aligned with the uploaded procurement policies
    document_text = """
    A department needs IT consulting services for a new internal case management system.
    The total estimated value is approximately $140,000, but the manager divides the work
    into three separate contracts under $50,000 each so the team can avoid an open
    competitive procurement process and obtain faster approvals.

    The same consultant is selected for all three contracts because the manager already
    knows and trusts the consultant. No invitational or open competitive process is run.

    The IT team is not asked to review or approve the procurement before it begins,
    even though the work involves software and technology advisory services.

    The consultant had previously provided the manager with free event tickets and dinner.
    No conflict of interest declaration is submitted, and no non-competitive business case
    is prepared.

    Work begins immediately after a verbal agreement and email confirmation, but the formal
    written contract is only signed several weeks later.
    """

    # Step 1: Document intake
    intake_result = document_intake(document_text)
    _print_section("INTAKE RESULT", intake_result)

    assert intake_result["status"] == "success"
    assert intake_result["cleaned_length"] > 0
    assert intake_result["num_chunks"] > 0
    assert "cleaned_text" in intake_result

    # Step 2: Policy retrieval from KB
    policy_result = policy_retrieval(intake_result["cleaned_text"])
    _print_section("POLICY RETRIEVAL RESULT", policy_result)

    assert "policy_context" in policy_result
    assert "citations" in policy_result
    assert isinstance(policy_result["citations"], list)
    assert len(policy_result["citations"]) > 0
    assert policy_result["policy_context"].strip() != ""

    # Step 3: Compliance analysis with the model
    analysis_result = compliance_analysis(
        document_text=intake_result["cleaned_text"],
        policy_context=policy_result["policy_context"]
    )
    _print_section("COMPLIANCE ANALYSIS RESULT", analysis_result)

    assert isinstance(analysis_result, dict)
    assert "summary" in analysis_result
    assert "compliance_score" in analysis_result
    assert "issues" in analysis_result
    assert isinstance(analysis_result["issues"], list)

    # For this scenario, we expect the model to find issues
    assert analysis_result["summary"] is not None
    assert analysis_result["summary"] != ""
    assert len(analysis_result["issues"]) > 0

    # Flexible issue checks so the test isn't too brittle to wording differences
    combined_issue_text = " ".join(
        str(issue).lower() for issue in analysis_result["issues"]
    )

    expected_keywords = [
        "conflict",
        "gift",
        "consult",
        "competitive",
        "split",
        "threshold",
        "it",
        "approval",
        "contract"
    ]

    assert any(keyword in combined_issue_text for keyword in expected_keywords)

    # Optional softer score expectation:
    # if a numeric score is returned, it should indicate not-fully-compliant behavior
    if isinstance(analysis_result["compliance_score"], (int, float)):
        assert analysis_result["compliance_score"] < 80

    recommended_actions = [
    {
        "issue": issue.get("issue"),
        "risk_level": issue.get("risk_level"),
        "action": issue.get("suggested_fix"),
    }
    for issue in analysis_result.get("issues", [])
    if issue.get("suggested_fix")
    ]

    _print_section("RECOMMENDED ACTIONS", recommended_actions)

    assert isinstance(recommended_actions, list)