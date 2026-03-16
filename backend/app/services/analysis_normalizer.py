from __future__ import annotations

import hashlib
from typing import Any, Dict, Iterable, List, Optional


RISK_PRIORITY = {"high": 3, "medium": 2, "low": 1}


def _normalize_text(value: Any, fallback: str = "") -> str:
    if value is None:
        return fallback
    text = str(value).strip()
    return " ".join(text.split()) or fallback


def _normalize_risk_level(value: Any) -> str:
    risk = _normalize_text(value, "low").lower()
    return risk if risk in RISK_PRIORITY else "low"


def _truncate_sentences(text: str, max_sentences: int = 2, max_chars: int = 220) -> str:
    cleaned = _normalize_text(text)
    if not cleaned:
        return ""

    sentence_breaks = []
    for delimiter in [". ", "! ", "? "]:
        if delimiter in cleaned:
            sentence_breaks = cleaned.replace("! ", ". ").replace("? ", ". ").split(". ")
            break

    if sentence_breaks:
        trimmed = ". ".join(part.strip(" .") for part in sentence_breaks[:max_sentences] if part.strip())
        if cleaned.endswith((".", "!", "?")):
            trimmed = trimmed.rstrip(".") + "."
    else:
        trimmed = cleaned

    if len(trimmed) <= max_chars:
        return trimmed
    return trimmed[: max_chars - 3].rstrip() + "..."


def _confidence_score(issue: Dict[str, Any]) -> float:
    score = 0.45

    if _normalize_text(issue.get("policy_reference")):
        score += 0.15
    if _normalize_text(issue.get("evidence")):
        score += 0.15
    if _normalize_text(issue.get("explanation")):
        score += 0.1
    if _normalize_text(issue.get("recommended_action")):
        score += 0.05

    citation = issue.get("citation") or {}
    if citation.get("page_number"):
        score += 0.05
    if _normalize_text(citation.get("document_name")):
        score += 0.03
    if _normalize_text(citation.get("relevant_excerpt")):
        score += 0.02

    return round(min(score, 0.98), 2)


def _issue_key(title: str, policy_reference: str, evidence: str) -> str:
    normalized = f"{title.lower()}|{policy_reference.lower()}|{evidence.lower()[:160]}"
    return hashlib.md5(normalized.encode("utf-8")).hexdigest()


def _merge_issue(existing: Dict[str, Any], candidate: Dict[str, Any]) -> Dict[str, Any]:
    existing_risk = RISK_PRIORITY.get(existing["risk_level"], 1)
    candidate_risk = RISK_PRIORITY.get(candidate["risk_level"], 1)

    if candidate_risk > existing_risk:
        merged = {**existing, **candidate}
    else:
        merged = {**candidate, **existing}

    for field in ["evidence", "explanation", "recommended_action", "policy_reference", "title"]:
        merged[field] = max(
            [_normalize_text(existing.get(field)), _normalize_text(candidate.get(field))],
            key=len,
        )

    existing_citation = existing.get("citation") or {}
    candidate_citation = candidate.get("citation") or {}
    merged["citation"] = {
        "document_name": candidate_citation.get("document_name") or existing_citation.get("document_name"),
        "page_number": candidate_citation.get("page_number") or existing_citation.get("page_number"),
        "relevant_excerpt": candidate_citation.get("relevant_excerpt") or existing_citation.get("relevant_excerpt"),
    }
    merged["risk_level"] = candidate["risk_level"] if candidate_risk >= existing_risk else existing["risk_level"]
    merged["confidence_score"] = max(existing.get("confidence_score", 0), candidate.get("confidence_score", 0))
    return merged


def _normalize_issue(issue: Dict[str, Any], index: int) -> Dict[str, Any]:
    citation = issue.get("citation") or {}
    evidence = _normalize_text(
        issue.get("evidence") or citation.get("relevant_excerpt") or issue.get("excerpt"),
        "No direct evidence excerpt was provided.",
    )
    title = _normalize_text(issue.get("title") or issue.get("issue"), f"Issue {index + 1}")
    normalized = {
        "id": issue.get("id") or f"issue-{index + 1}",
        "title": title,
        "risk_level": _normalize_risk_level(issue.get("risk_level")),
        "policy_reference": _normalize_text(issue.get("policy_reference"), "General policy guidance"),
        "evidence": _truncate_sentences(evidence, max_sentences=2, max_chars=260),
        "explanation": _truncate_sentences(issue.get("explanation"), max_sentences=2, max_chars=220),
        "recommended_action": _truncate_sentences(
            issue.get("recommended_action") or issue.get("suggested_fix"),
            max_sentences=2,
            max_chars=220,
        ),
        "citation": {
            "document_name": _normalize_text(citation.get("document_name"), "Source document"),
            "page_number": citation.get("page_number"),
            "relevant_excerpt": _truncate_sentences(citation.get("relevant_excerpt") or evidence, max_chars=260),
        },
    }
    normalized["confidence_score"] = _confidence_score(normalized)
    normalized["id"] = issue.get("id") or _issue_key(
        normalized["title"],
        normalized["policy_reference"],
        normalized["evidence"],
    )[:12]
    return normalized


def _overall_risk(issues: Iterable[Dict[str, Any]]) -> str:
    highest = "low"
    for issue in issues:
        risk = issue.get("risk_level", "low")
        if RISK_PRIORITY.get(risk, 1) > RISK_PRIORITY.get(highest, 1):
            highest = risk
    return highest


def normalize_analysis_result(
    analysis_result: Dict[str, Any],
    filename: Optional[str] = None,
    pipeline_steps: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    raw_issues = analysis_result.get("issues", []) or []
    deduplicated: Dict[str, Dict[str, Any]] = {}

    for index, raw_issue in enumerate(raw_issues):
        normalized_issue = _normalize_issue(raw_issue, index)
        dedupe_key = _issue_key(
            normalized_issue["title"],
            normalized_issue["policy_reference"],
            normalized_issue["evidence"],
        )
        if dedupe_key in deduplicated:
            deduplicated[dedupe_key] = _merge_issue(deduplicated[dedupe_key], normalized_issue)
        else:
            deduplicated[dedupe_key] = normalized_issue

    issues: List[Dict[str, Any]] = sorted(
        deduplicated.values(),
        key=lambda item: (-RISK_PRIORITY.get(item["risk_level"], 1), item["title"].lower()),
    )

    risk_counts = {"high": 0, "medium": 0, "low": 0}
    for issue in issues:
        risk_counts[issue["risk_level"]] += 1

    referenced_policies = sorted(
        {
            issue["policy_reference"]
            for issue in issues
            if _normalize_text(issue.get("policy_reference")) and issue["policy_reference"] != "General policy guidance"
        }
    )

    compliance_score = analysis_result.get("compliance_score")
    if not isinstance(compliance_score, int):
        if issues:
            compliance_score = max(20, 100 - (risk_counts["high"] * 25 + risk_counts["medium"] * 12 + risk_counts["low"] * 5))
        else:
            compliance_score = 100

    summary = _truncate_sentences(
        analysis_result.get("summary")
        or f"Analyzed {filename or 'document'} and found {len(issues)} compliance issue(s).",
        max_sentences=2,
        max_chars=240,
    )

    return {
        "summary": summary,
        "compliance_score": compliance_score,
        "overall_risk": _overall_risk(issues),
        "risk_counts": risk_counts,
        "policies_referenced_count": len(referenced_policies),
        "issues_count": len(issues),
        "issues": issues,
        "referenced_policies": referenced_policies,
        "pipeline_steps": pipeline_steps or [],
    }
