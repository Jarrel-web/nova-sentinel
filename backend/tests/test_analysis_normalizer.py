from app.services.analysis_normalizer import normalize_analysis_result


def test_normalize_analysis_result_deduplicates_and_enriches():
    raw_result = {
        "summary": "Policy and contract issues were detected in the draft document.",
        "issues": [
            {
                "issue": "Missing approval for vendor engagement",
                "risk_level": "high",
                "policy_reference": "Procurement Policy 4.2",
                "explanation": "The draft starts work before approval is documented. This creates an approval gap.",
                "suggested_fix": "Pause work and obtain formal approval before continuing.",
                "citation": {
                    "document_name": "Policy Handbook",
                    "page_number": 7,
                    "relevant_excerpt": "Vendor work begins before formal approval."
                },
            },
            {
                "issue": "Missing approval for vendor engagement",
                "risk_level": "medium",
                "policy_reference": "Procurement Policy 4.2",
                "explanation": "Approval evidence is missing from the submitted packet.",
                "suggested_fix": "Attach the approval memo.",
                "citation": {
                    "document_name": "Policy Handbook",
                    "page_number": 7,
                    "relevant_excerpt": "Vendor work begins before formal approval."
                },
            },
        ],
    }

    normalized = normalize_analysis_result(raw_result, filename="draft.pdf")

    assert normalized["issues_count"] == 1
    assert normalized["risk_counts"] == {"high": 1, "medium": 0, "low": 0}
    assert normalized["overall_risk"] == "high"
    assert normalized["policies_referenced_count"] == 1
    assert normalized["referenced_policies"] == ["Procurement Policy 4.2"]

    issue = normalized["issues"][0]
    assert issue["title"] == "Missing approval for vendor engagement"
    assert issue["confidence_score"] > 0.5
    assert issue["citation"]["page_number"] == 7
