import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Pie, PieChart, Cell } from "recharts";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock3,
  Download,
  Eye,
  FileSearch,
  FileText,
  History,
  ShieldCheck,
} from "lucide-react";

import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AnalysisHistoryItem, ComplianceIssue, ComplianceResult, fetchAnalyses, updateAnalysisReview } from "@/services/api";

type DashboardLocationState = {
  results?: ComplianceResult;
  fileName?: string;
  pdfUrl?: string | null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as DashboardLocationState) || {};
  const { toast } = useToast();

  const [currentResult, setCurrentResult] = useState<ComplianceResult | null>(state.results ?? null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<number | null>(state.results?.analysis_id ?? null);
  const [currentFileName, setCurrentFileName] = useState(state.fileName ?? "");
  const [pdfUrl, setPdfUrl] = useState<string | null>(state.pdfUrl ?? null);
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState<ComplianceIssue | null>(null);
  const [viewerPage, setViewerPage] = useState(1);
  const [reviewStatus, setReviewStatus] = useState<"pending" | "approved" | "needs_changes" | "rejected">("pending");
  const [reviewNote, setReviewNote] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const pdfSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      try {
        const items = await fetchAnalyses();
        if (!active) {
          return;
        }
        setHistoryItems(items);

        if (!currentResult && items[0]) {
          setCurrentResult(items[0].raw_result_json);
          setCurrentAnalysisId(items[0].id);
          setCurrentFileName(items[0].filename);
          setReviewStatus((items[0].review_status as "pending" | "approved" | "needs_changes" | "rejected") || "pending");
          setReviewNote(items[0].review_note || "");
        } else if (currentAnalysisId) {
          const matchingItem = items.find((item) => item.id === currentAnalysisId);
          if (matchingItem) {
            setReviewStatus((matchingItem.review_status as "pending" | "approved" | "needs_changes" | "rejected") || "pending");
            setReviewNote(matchingItem.review_note || "");
          }
        }
      } catch (error) {
        console.error("Failed to fetch analysis history", error);
      } finally {
        if (active) {
          setHistoryLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, [currentAnalysisId, currentResult]);

  useEffect(() => {
    return () => {
      if (state.pdfUrl) {
        URL.revokeObjectURL(state.pdfUrl);
      }
    };
  }, [state.pdfUrl]);

  const result = currentResult;

  const filteredIssues = useMemo(() => {
    if (!result) {
      return [];
    }

    if (riskFilter === "all") {
      return result.issues;
    }

    return result.issues.filter((issue) => issue.risk_level.toLowerCase() === riskFilter);
  }, [result, riskFilter]);

  const riskChartData = result
    ? [
        { name: "high", value: result.risk_counts.high, fill: "hsl(var(--destructive))" },
        { name: "medium", value: result.risk_counts.medium, fill: "hsl(var(--warning))" },
        { name: "low", value: result.risk_counts.low, fill: "hsl(var(--success))" },
      ]
    : [];

  const getRiskIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case "high":
        return <AlertTriangle className="w-4 h-4" />;
      case "medium":
        return <AlertCircle className="w-4 h-4" />;
      case "low":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileSearch className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const getRiskBadgeClass = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-success/10 text-success border-success/20";
    }
  };

  const getReviewBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-success/10 text-success border-success/20";
      case "needs_changes":
        return "bg-warning/10 text-warning border-warning/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const focusPdfViewer = (issue: ComplianceIssue, closePanel = false) => {
    setViewerPage(issue.citation?.page_number || 1);

    if (pdfSectionRef.current) {
      pdfSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (closePanel) {
      setSelectedIssue(null);
    }
  };

  const openIssue = (issue: ComplianceIssue) => {
    setSelectedIssue(issue);
    focusPdfViewer(issue);
  };

  const exportJson = () => {
    if (!result) {
      return;
    }

    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentFileName || "analysis-result"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadHistoryResult = (item: AnalysisHistoryItem) => {
    setCurrentResult(item.raw_result_json);
    setCurrentAnalysisId(item.id);
    setCurrentFileName(item.filename);
    setPdfUrl(null);
    setSelectedIssue(null);
    setViewerPage(1);
    setReviewStatus((item.review_status as "pending" | "approved" | "needs_changes" | "rejected") || "pending");
    setReviewNote(item.review_note || "");
  };

  const saveReview = async (nextStatus: "pending" | "approved" | "needs_changes" | "rejected") => {
    if (!currentAnalysisId) {
      return;
    }

    setReviewSaving(true);
    try {
      const updated = await updateAnalysisReview(currentAnalysisId, nextStatus, reviewNote);
      setReviewStatus(updated.review_status as "pending" | "approved" | "needs_changes" | "rejected");
      setReviewNote(updated.review_note || "");
      setHistoryItems((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      toast({
        title: "Review saved",
        description: `Status updated to ${updated.review_status.replace("_", " ")}.`,
      });
    } catch (error) {
      console.error("Failed to update review status", error);
      toast({
        title: "Review update failed",
        description: error instanceof Error ? error.message : "Could not save the review decision.",
        variant: "destructive",
      });
    } finally {
      setReviewSaving(false);
    }
  };

  if (!result && !historyLoading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto py-12 text-center">
          <p className="text-muted-foreground mb-6">No analysis results available yet.</p>
          <Button onClick={() => navigate("/analyze")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/analyze")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Analysis Results</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-base text-muted-foreground">{currentFileName || "Recent analysis"}</p>
              {result && (
                <Badge variant="outline" className={getRiskBadgeClass(result.overall_risk)}>
                  Overall risk: {result.overall_risk}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={exportJson} disabled={!result}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>

        {result && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="rounded-3xl border-border/50">
                <CardHeader className="pb-3">
                  <CardDescription>Compliance Score</CardDescription>
                  <CardTitle className={`text-4xl ${getScoreColor(result.compliance_score)}`}>
                    {result.compliance_score}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{result.summary}</p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-border/50">
                <CardHeader className="pb-3">
                  <CardDescription>Total Issues</CardDescription>
                  <CardTitle className="text-4xl">{result.issues_count}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSearch className="w-4 h-4" />
                  Explainable findings with evidence and actions
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-border/50">
                <CardHeader className="pb-3">
                  <CardDescription>High Risk Count</CardDescription>
                  <CardTitle className="text-4xl text-destructive">{result.risk_counts.high}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="w-4 h-4" />
                  Highest-severity issues driving overall risk
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-border/50">
                <CardHeader className="pb-3">
                  <CardDescription>Policies Referenced</CardDescription>
                  <CardTitle className="text-4xl">{result.policies_referenced_count}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  Unique policy references cited by the analysis
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
              <Card className="rounded-3xl border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl">Issue Explorer</CardTitle>
                  <CardDescription>
                    Filter findings and open any issue to inspect evidence, explanation, citation, and recommended action.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Tabs value={riskFilter} onValueChange={setRiskFilter}>
                    <TabsList className="grid w-full grid-cols-4 rounded-2xl">
                      <TabsTrigger value="all">All ({result.issues_count})</TabsTrigger>
                      <TabsTrigger value="high">High ({result.risk_counts.high})</TabsTrigger>
                      <TabsTrigger value="medium">Medium ({result.risk_counts.medium})</TabsTrigger>
                      <TabsTrigger value="low">Low ({result.risk_counts.low})</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="space-y-3">
                    {filteredIssues.length === 0 && (
                      <Card className="rounded-2xl border-dashed p-6 text-center text-muted-foreground">
                        No issues match the current filter.
                      </Card>
                    )}

                    {filteredIssues.map((issue) => (
                      <button
                        type="button"
                        key={issue.id}
                        onClick={() => openIssue(issue)}
                        className="w-full text-left"
                      >
                        <Card className="rounded-2xl border-border/60 p-5 transition hover:border-primary/40 hover:shadow-lg">
                          <div className="flex items-start gap-4">
                            <div className={`mt-1 rounded-xl p-2 ${getRiskBadgeClass(issue.risk_level)}`}>
                              {getRiskIcon(issue.risk_level)}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-semibold">{issue.title}</h3>
                                <Badge variant="outline" className={getRiskBadgeClass(issue.risk_level)}>
                                  {issue.risk_level}
                                </Badge>
                                <Badge variant="outline">{Math.round(issue.confidence_score * 100)}% confidence</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{issue.explanation}</p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <Badge variant="secondary">{issue.policy_reference}</Badge>
                                <Badge variant="outline">
                                  <FileText className="w-3 h-3 mr-1" />
                                  {issue.citation?.document_name || "Source document"}
                                </Badge>
                                {issue.citation?.page_number && <Badge variant="outline">Page {issue.citation.page_number}</Badge>}
                              </div>
                            </div>
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </Card>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-3xl border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl">Review Decision</CardTitle>
                    <CardDescription>Record a lightweight approval outcome for this analysis.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getReviewBadgeClass(reviewStatus)}>
                        Review status: {reviewStatus.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className={getRiskBadgeClass(result.overall_risk)}>
                        AI risk: {result.overall_risk}
                      </Badge>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Button
                        variant={reviewStatus === "approved" ? "default" : "outline"}
                        onClick={() => saveReview("approved")}
                        disabled={reviewSaving || !currentAnalysisId}
                        className="rounded-xl"
                      >
                        Approve
                      </Button>
                      <Button
                        variant={reviewStatus === "needs_changes" ? "default" : "outline"}
                        onClick={() => saveReview("needs_changes")}
                        disabled={reviewSaving || !currentAnalysisId}
                        className="rounded-xl"
                      >
                        Needs Changes
                      </Button>
                      <Button
                        variant={reviewStatus === "rejected" ? "destructive" : "outline"}
                        onClick={() => saveReview("rejected")}
                        disabled={reviewSaving || !currentAnalysisId}
                        className="rounded-xl"
                      >
                        Reject
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Reviewer note</p>
                      <Textarea
                        value={reviewNote}
                        onChange={(event) => setReviewNote(event.target.value)}
                        placeholder="Optional note for the decision..."
                        className="min-h-24 rounded-2xl"
                      />
                      <div className="flex justify-end">
                        <Button
                          variant="secondary"
                          onClick={() => saveReview(reviewStatus)}
                          disabled={reviewSaving || !currentAnalysisId}
                          className="rounded-xl"
                        >
                          {reviewSaving ? "Saving..." : "Save Note"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl">Risk Distribution</CardTitle>
                    <CardDescription>Severity mix across normalized findings.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      className="mx-auto aspect-square h-[260px]"
                      config={{
                        high: { label: "High", color: "hsl(var(--destructive))" },
                        medium: { label: "Medium", color: "hsl(var(--warning))" },
                        low: { label: "Low", color: "hsl(var(--success))" },
                      }}
                    >
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                        <Pie data={riskChartData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} strokeWidth={5}>
                          {riskChartData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl">Policy Coverage</CardTitle>
                    <CardDescription>Unique policy references surfaced by the analysis.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.referenced_policies.length === 0 && (
                      <p className="text-sm text-muted-foreground">No specific policy references were returned.</p>
                    )}
                    {result.referenced_policies.map((policy) => (
                      <div key={policy} className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-sm">
                        {policy}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid gap-6">
              <Card className="rounded-3xl border-border/50" ref={pdfSectionRef}>
                <CardHeader>
                  <CardTitle className="text-xl">PDF Evidence Viewer</CardTitle>
                  <CardDescription>
                    {pdfUrl
                      ? "Fast fallback viewer: jump to a cited page and inspect the evidence excerpt beside it."
                      : "Upload a PDF in the current session to enable the embedded viewer. History items still show linked evidence in the issue panel."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 xl:grid-cols-[1.7fr_0.7fr]">
                  <div className="min-h-[680px] overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
                    {pdfUrl ? (
                      <iframe
                        title="PDF viewer"
                        src={`${pdfUrl}#page=${viewerPage}&zoom=page-fit`}
                        className="h-[680px] w-full"
                      />
                    ) : (
                      <div className="flex h-[680px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
                        PDF preview is only available for the file you just uploaded.
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Card className="rounded-2xl border-border/60 bg-amber-50/40">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Highlighted Evidence</CardTitle>
                        <CardDescription>
                          {selectedIssue?.citation?.page_number ? `Jumped to page ${selectedIssue.citation.page_number}.` : "Select an issue to focus the viewer."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="rounded-xl border border-amber-200/60 bg-amber-100/60 p-4 text-sm leading-6">
                          {selectedIssue?.evidence || "No issue selected yet."}
                        </p>
                      </CardContent>
                    </Card>

                    {selectedIssue && (
                      <div className="rounded-2xl border border-border/60 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          {getRiskIcon(selectedIssue.risk_level)}
                          <p className="font-semibold">{selectedIssue.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{selectedIssue.policy_reference}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card className="rounded-3xl border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl">AI Pipeline Timeline</CardTitle>
                    <CardDescription>How the result moved from intake to explainable issue cards.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.pipeline_steps.map((step, index) => (
                      <div key={step.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Clock3 className="w-4 h-4" />
                          </div>
                          {index < result.pipeline_steps.length - 1 && <div className="mt-2 h-full w-px bg-border" />}
                        </div>
                        <div className="pb-4">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{step.label}</p>
                            <Badge variant="outline">{step.status}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Analysis History
                    </CardTitle>
                    <CardDescription>Stored automatically in SQLite after each successful analysis.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[320px] pr-4">
                      <div className="space-y-3">
                        {historyLoading && <p className="text-sm text-muted-foreground">Loading history...</p>}
                        {!historyLoading && historyItems.length === 0 && (
                          <p className="text-sm text-muted-foreground">No saved analyses yet.</p>
                        )}
                        {historyItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => loadHistoryResult(item)}
                            className="w-full text-left"
                          >
                            <Card className="rounded-2xl border-border/60 p-4 transition hover:border-primary/40">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-medium">{item.filename}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
                                </div>
                                <Badge variant="outline" className={getRiskBadgeClass(item.overall_risk)}>
                                  Risk: {item.overall_risk}
                                </Badge>
                              </div>
                              <div className="mt-2">
                                <Badge variant="outline" className={getReviewBadgeClass(item.review_status)}>
                                  Review: {item.review_status.replace("_", " ")}
                                </Badge>
                              </div>
                              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>
                            </Card>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => navigate("/analyze")}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Analyze Another File
          </Button>
        </div>

        <Sheet open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssue(null)}>
          <SheetContent side="right" className="flex h-full w-full flex-col p-0 sm:max-w-xl">
            {selectedIssue && (
              <>
                <SheetHeader className="border-b border-border/60 px-6 py-6">
                  <SheetTitle>{selectedIssue.title}</SheetTitle>
                  <SheetDescription>
                    {selectedIssue.policy_reference} | {Math.round(selectedIssue.confidence_score * 100)}% confidence
                  </SheetDescription>
                </SheetHeader>

                <ScrollArea className="min-h-0 flex-1">
                  <div className="space-y-4 px-6 py-6">
                    <Card className="rounded-2xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Evidence</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm leading-6">{selectedIssue.evidence}</CardContent>
                    </Card>

                    <Card className="rounded-2xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Explanation</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm leading-6">{selectedIssue.explanation}</CardContent>
                    </Card>

                    <Card className="rounded-2xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Recommended Action</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm leading-6">{selectedIssue.recommended_action}</CardContent>
                    </Card>

                    <Card className="rounded-2xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Citation</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p>Document: {selectedIssue.citation?.document_name || "Source document"}</p>
                        <p>Page: {selectedIssue.citation?.page_number || "Not available"}</p>
                        <p>{selectedIssue.citation?.relevant_excerpt || selectedIssue.evidence}</p>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>

                {pdfUrl && (
                  <div className="border-t border-border/60 bg-background/95 px-6 py-4 backdrop-blur">
                    <Button className="w-full" onClick={() => focusPdfViewer(selectedIssue, true)}>
                      Jump To PDF Viewer
                    </Button>
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Scrolls to the PDF section and jumps to the cited page when available.
                    </p>
                  </div>
                )}
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
