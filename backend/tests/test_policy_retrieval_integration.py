from app.agents.policy_retrieval_agent import policy_retrieval


def _print_result(test_name: str, result: dict):
    print("\n" + "=" * 80)
    print(f"{test_name}")
    print("=" * 80)

    print("\n=== POLICY CONTEXT ===\n")
    print(result["policy_context"][:3000] if result["policy_context"] else "No policy context returned.")

    print("\n=== CITATIONS ===\n")
    if not result["citations"]:
        print("No citations returned.")
        return

    for i, citation in enumerate(result["citations"], start=1):
        score = citation.get("score")
        score_text = f"{score:.3f}" if isinstance(score, (int, float)) else str(score)

        print(f"\nCitation {i}")
        print(f"Source: {citation.get('source')}")
        print(f"Score: {score_text}")
        print("Excerpt:")
        print(citation.get("excerpt", "")[:500])
        print("-" * 60)


def test_policy_retrieval_contract_splitting():
    query = """
    A procurement with a total value of $135,000 is divided into three smaller
    contracts under $50,000 each to avoid open competitive procurement thresholds
    and approval requirements.
    """

    result = policy_retrieval(query)
    _print_result("Focused Threshold Avoidance Test", result)

    assert "policy_context" in result
    assert "citations" in result
    assert isinstance(result["citations"], list)
    assert len(result["citations"]) > 0
    assert result["policy_context"].strip() != ""


def test_policy_retrieval_compound_procurement_violation():
    query = """
    A department needs to procure IT consulting services for a new internal
    case management system. The total estimated value is about $140,000,
    but the manager splits the work into three separate contracts under
    $50,000 each so the team can avoid an open competitive process and
    faster approvals.

    The same consultant is selected for all three contracts because they
    are already known to the manager. The IT team is not asked to review
    or approve the procurement before it starts.

    The consultant had previously given the manager free event tickets
    and dinner. No conflict of interest declaration or business case is submitted.
    """

    result = policy_retrieval(query)
    _print_result("Compound Procurement Violation Scenario", result)

    assert "policy_context" in result
    assert "citations" in result
    assert isinstance(result["citations"], list)
    assert len(result["citations"]) > 0
    assert result["policy_context"].strip() != ""