from unittest.mock import patch
from app.agents.compliance_analysis_agent import compliance_analysis


mock_valid_response = {
    "output": {
        "message": {
            "content": [
                {
                    "text": """
{
  "summary": "The document has several procurement compliance issues.",
  "compliance_score": 42,
  "issues": [
    {
      "issue": "Contract splitting to avoid threshold requirements",
      "severity": "high"
    },
    {
      "issue": "Conflict of interest was not declared",
      "severity": "high"
    }
  ]
}
                    """
                }
            ]
        }
    }
}


mock_json_fenced_response = {
    "output": {
        "message": {
            "content": [
                {
                    "text": """```json
{
  "summary": "The document is partially non-compliant.",
  "compliance_score": 55,
  "issues": [
    {
      "issue": "Missing IT review",
      "severity": "medium"
    }
  ]
}
```"""
                }
            ]
        }
    }
}


mock_plain_fenced_response = {
    "output": {
        "message": {
            "content": [
                {
                    "text": """```
{
  "summary": "The document contains one major issue.",
  "compliance_score": 60,
  "issues": [
    {
      "issue": "Late bid accepted",
      "severity": "high"
    }
  ]
}
```"""
                }
            ]
        }
    }
}


mock_invalid_json_response = {
    "output": {
        "message": {
            "content": [
                {
                    "text": "This is not valid JSON output."
                }
            ]
        }
    }
}


mock_bad_shape_response = {
    "unexpected": "structure"
}


@patch("app.agents.compliance_analysis_agent.invoke_nova")
def test_compliance_analysis_parses_valid_json(mock_invoke_nova):
    mock_invoke_nova.return_value = mock_valid_response

    result = compliance_analysis(
        document_text="A procurement was split into 3 contracts.",
        policy_context="Procurement must not be split to avoid thresholds."
    )

    assert result["summary"] == "The document has several procurement compliance issues."
    assert result["compliance_score"] == 42
    assert isinstance(result["issues"], list)
    assert len(result["issues"]) == 2
    assert result["issues"][0]["issue"] == "Contract splitting to avoid threshold requirements"


@patch("app.agents.compliance_analysis_agent.invoke_nova")
def test_compliance_analysis_parses_json_with_json_code_fence(mock_invoke_nova):
    mock_invoke_nova.return_value = mock_json_fenced_response

    result = compliance_analysis(
        document_text="IT software was purchased without review.",
        policy_context="IT purchases above threshold require IT review."
    )

    assert result["summary"] == "The document is partially non-compliant."
    assert result["compliance_score"] == 55
    assert len(result["issues"]) == 1
    assert result["issues"][0]["issue"] == "Missing IT review"


@patch("app.agents.compliance_analysis_agent.invoke_nova")
def test_compliance_analysis_parses_json_with_plain_code_fence(mock_invoke_nova):
    mock_invoke_nova.return_value = mock_plain_fenced_response

    result = compliance_analysis(
        document_text="A late bid was accepted.",
        policy_context="Late bids must not be accepted."
    )

    assert result["summary"] == "The document contains one major issue."
    assert result["compliance_score"] == 60
    assert len(result["issues"]) == 1
    assert result["issues"][0]["issue"] == "Late bid accepted"


@patch("app.agents.compliance_analysis_agent.invoke_nova")
def test_compliance_analysis_returns_fallback_on_invalid_json(mock_invoke_nova):
    mock_invoke_nova.return_value = mock_invalid_json_response

    result = compliance_analysis(
        document_text="Some procurement scenario text.",
        policy_context="Relevant policy context."
    )

    assert "Could not parse model output cleanly" in result["summary"]
    assert result["compliance_score"] is None
    assert result["issues"] == []


@patch("app.agents.compliance_analysis_agent.invoke_nova")
def test_compliance_analysis_returns_fallback_on_bad_response_shape(mock_invoke_nova):
    mock_invoke_nova.return_value = mock_bad_shape_response

    result = compliance_analysis(
        document_text="Some procurement scenario text.",
        policy_context="Relevant policy context."
    )

    assert "Could not parse model output cleanly" in result["summary"]
    assert result["compliance_score"] is None
    assert result["issues"] == []