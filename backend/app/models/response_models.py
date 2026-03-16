from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class IssueCitation(BaseModel):
    document_name: Optional[str] = None
    page_number: Optional[int] = None
    relevant_excerpt: Optional[str] = None


class NormalizedIssue(BaseModel):
    id: str
    title: str
    risk_level: str
    policy_reference: str
    evidence: str
    explanation: str
    recommended_action: str
    confidence_score: float
    citation: IssueCitation = Field(default_factory=IssueCitation)


class ComplianceResponse(BaseModel):
    summary: str
    compliance_score: int = 0
    overall_risk: str = "low"
    risk_counts: Dict[str, int] = Field(default_factory=lambda: {"high": 0, "medium": 0, "low": 0})
    policies_referenced_count: int = 0
    issues_count: int = 0
    issues: List[NormalizedIssue] = Field(default_factory=list)
    referenced_policies: List[str] = Field(default_factory=list)
    pipeline_steps: List[Dict[str, Any]] = Field(default_factory=list)


class AnalysisHistoryItem(BaseModel):
    id: int
    filename: str
    summary: str
    compliance_score: int = 0
    overall_risk: str = "low"
    review_status: str = "pending"
    review_note: Optional[str] = None
    raw_result_json: Dict[str, Any]
    created_at: datetime


class AnalysisReviewUpdate(BaseModel):
    review_status: str
    review_note: Optional[str] = None
