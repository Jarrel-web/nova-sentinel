from pydantic import BaseModel
from typing import List, Optional

class ComplianceIssue(BaseModel):
    issue: str
    risk_level: str
    policy_reference: str
    explanation: str
    suggested_fix: str

class ComplianceResponse(BaseModel):
    summary: str
    compliance_score: Optional[int] = None
    issues: List[ComplianceIssue]