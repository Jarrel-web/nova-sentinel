from app.agents.compliance_analysis_agent import compliance_analysis


def _print_result(test_name: str, result: dict):
    print("\n" + "=" * 80)
    print(f"{test_name}")
    print("=" * 80)

    print("\n=== SUMMARY ===\n")
    print(result.get("summary"))

    print("\n=== COMPLIANCE SCORE ===\n")
    print(result.get("compliance_score"))

    print("\n=== ISSUES ===\n")
    issues = result.get("issues", [])
    if not issues:
        print("No issues returned.")
        return

    for i, issue in enumerate(issues, start=1):
        print(f"Issue {i}:")
        if isinstance(issue, dict):
            for key, value in issue.items():
                print(f"  {key}: {value}")
        else:
            print(f"  {issue}")
        print("-" * 60)


def test_compliance_analysis_realistic_procurement_violation():
    document_text = """
    A department needs IT consulting services for a new internal case management system.
    The total estimated value is about $140,000, but the manager splits the work into
    three separate contracts under $50,000 each so the team can avoid an open competitive
    process and faster approvals.

    The same consultant is selected for all three contracts because they are already known
    to the manager. The IT team is not asked to review or approve the procurement before
    it starts.

    The consultant had previously given the manager free event tickets and dinner.
    No conflict of interest declaration or business case is submitted.
    """

    policy_context = """
    Procurement value must not be divided or reduced to avoid approval thresholds or
    competitive procurement requirements.

    Consulting services must be procured through the appropriate competitive process,
    and non-competitive procurement requires proper justification and approval.

    IT-related procurements above the required threshold must be reviewed and approved
    by the IT function before procurement begins.

    Employees involved in procurement must avoid conflicts of interest, gifts, favours,
    and preferential treatment toward suppliers. Any conflict must be disclosed.
    """

    result = compliance_analysis(document_text=document_text, policy_context=policy_context)
    _print_result("Realistic Procurement Violation Scenario", result)

    assert isinstance(result, dict)
    assert "summary" in result
    assert "compliance_score" in result
    assert "issues" in result
    assert isinstance(result["issues"], list)

    # Integration-friendly assertions: strong enough to validate output shape,
    # but not so strict that normal model wording differences break the test.
    assert result["summary"] is not None
    assert result["summary"] != ""

    # If the model returns a score, it should be a number-like value or None.
    assert (
        result["compliance_score"] is None
        or isinstance(result["compliance_score"], (int, float))
    )

    # For this scenario, we expect at least one issue to be detected.
    assert len(result["issues"]) > 0