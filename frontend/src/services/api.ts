export interface IssueCitation {
  document_name?: string;
  page_number?: number | null;
  relevant_excerpt?: string;
}

export interface ComplianceIssue {
  id: string;
  title: string;
  risk_level: "high" | "medium" | "low" | string;
  policy_reference: string;
  evidence: string;
  explanation: string;
  recommended_action: string;
  confidence_score: number;
  citation: IssueCitation;
}

export interface ComplianceResult {
  analysis_id?: number;
  summary: string;
  compliance_score: number;
  overall_risk: "high" | "medium" | "low" | string;
  risk_counts: {
    high: number;
    medium: number;
    low: number;
  };
  policies_referenced_count: number;
  issues_count: number;
  issues: ComplianceIssue[];
  referenced_policies: string[];
  pipeline_steps: Array<{
    id: string;
    label: string;
    status: string;
    detail: string;
  }>;
}

export interface AnalysisHistoryItem {
  id: number;
  filename: string;
  summary: string;
  compliance_score: number;
  overall_risk: string;
  review_status: "pending" | "approved" | "needs_changes" | "rejected" | string;
  review_note?: string | null;
  raw_result_json: ComplianceResult;
  created_at: string;
}

interface AnalyzeResponse {
  status: string;
  filename: string;
  analysis_id: number;
  result: ComplianceResult;
}

interface AnalysisHistoryResponse {
  status: string;
  items: AnalysisHistoryItem[];
}

interface AnalysisHistoryItemResponse {
  status: string;
  item: AnalysisHistoryItem;
}

const getApiUrl = (): string => {
  return import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/";
};

export const analyzeDocument = async (file: File): Promise<ComplianceResult> => {
  const formData = new FormData();
  formData.append("file", file);

  const apiUrl = getApiUrl();
  const endpoint = `${apiUrl}/api/analyze`;

  console.log("Analyzing document at:", endpoint);

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData?.detail || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(`Analysis failed: ${errorMessage}`);
  }

  const data: AnalyzeResponse | ComplianceResult = await response.json();
  
  // Check if response is wrapped with result property
  if ("result" in data && "status" in data) {
    const typed = data as AnalyzeResponse;
    return {
      ...typed.result,
      analysis_id: typed.analysis_id,
    };
  }
  
  // Otherwise assume it's already ComplianceResult
  return data as ComplianceResult;
};

export const fetchAnalyses = async (): Promise<AnalysisHistoryItem[]> => {
  const response = await fetch(`${getApiUrl()}/api/analyses`);

  if (!response.ok) {
    throw new Error(`Failed to load analyses: HTTP ${response.status}`);
  }

  const data: AnalysisHistoryResponse = await response.json();
  return data.items;
};

export const fetchAnalysisById = async (id: number): Promise<AnalysisHistoryItem> => {
  const response = await fetch(`${getApiUrl()}/api/analyses/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to load analysis ${id}: HTTP ${response.status}`);
  }

  const data: AnalysisHistoryItemResponse = await response.json();
  return data.item;
};

export const updateAnalysisReview = async (
  id: number,
  reviewStatus: "pending" | "approved" | "needs_changes" | "rejected",
  reviewNote?: string,
): Promise<AnalysisHistoryItem> => {
  const response = await fetch(`${getApiUrl()}/api/analyses/${id}/review`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      review_status: reviewStatus,
      review_note: reviewNote || null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.detail || `Failed to update review: HTTP ${response.status}`);
  }

  const data: AnalysisHistoryItemResponse = await response.json();
  return data.item;
};
