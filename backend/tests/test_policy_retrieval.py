from unittest.mock import patch
from app.agents.policy_retrieval_agent import policy_retrieval


mock_kb_result = {
    "policy_context": (
        "Source: s3://company-policies/data-protection.pdf\n"
        "Personal data must be encrypted at rest and in transit.\n\n---\n\n"
        "Source: s3://company-policies/access-control.pdf\n"
        "Access to sensitive records must follow least privilege."
    ),
    "citations": [
        {
            "source": "s3://company-policies/data-protection.pdf",
            "score": 0.95,
            "excerpt": "Personal data must be encrypted at rest and in transit."
        },
        {
            "source": "s3://company-policies/access-control.pdf",
            "score": 0.91,
            "excerpt": "Access to sensitive records must follow least privilege."
        }
    ]
}


@patch("app.agents.policy_retrieval_agent.retrieve_policy_context")
def test_policy_retrieval_returns_expected_structure(mock_retrieve):
    mock_retrieve.return_value = mock_kb_result

    query = """
    The system stores customer personal data including names, email addresses,
    and payment information. Employees can access records through a web dashboard.
    """

    result = policy_retrieval(query)

    assert "policy_context" in result
    assert "citations" in result
    assert isinstance(result["citations"], list)
    assert len(result["citations"]) == 2
    assert "encrypted" in result["policy_context"]
    assert result["citations"][0]["source"] == "s3://company-policies/data-protection.pdf"


@patch("app.agents.policy_retrieval_agent.retrieve_policy_context")
def test_policy_retrieval_calls_kb_with_query(mock_retrieve):
    mock_retrieve.return_value = mock_kb_result

    query = "Sensitive customer information is stored in a shared database."
    policy_retrieval(query)

    mock_retrieve.assert_called_once_with(query, top_k=5)