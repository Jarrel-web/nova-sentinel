export interface ComplianceResult {
  summary: string;
  compliance_score: number;
  risk_overview: {
    high: number;
    medium: number;
    low: number;
  };
  top_issues: Array<{
    title: string;
    risk_level: string;
    policy_reference: string;
    source_document: string;
    page_number?: number;
    evidence: string;
    why_it_matters: string;
    recommended_action: string;
  }>;
  all_issues_count: number;
}

interface AnalyzeResponse {
  status: string;
  filename: string;
  result: ComplianceResult;
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
    return (data as AnalyzeResponse).result;
  }
  
  // Otherwise assume it's already ComplianceResult
  return data as ComplianceResult;
};
