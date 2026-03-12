import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, AlertCircle, FileText, ArrowLeft } from "lucide-react";
import { ComplianceResult } from "@/services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { results, fileName } = location.state as { results: ComplianceResult; fileName: string } || {};
  const [visibleRiskLevels, setVisibleRiskLevels] = useState<Set<string>>(new Set(['high', 'medium', 'low']));

  // Redirect if no results data
  if (!results) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto py-12 text-center">
          <p className="text-muted-foreground mb-6">No analysis results available</p>
          <Button onClick={() => navigate("/analyze")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Button>
        </div>
      </AppLayout>
    );
  }

  const toggleRiskLevel = (level: string) => {
    const newVisible = new Set(visibleRiskLevels);
    if (newVisible.has(level)) {
      newVisible.delete(level);
    } else {
      newVisible.add(level);
    }
    setVisibleRiskLevels(newVisible);
  };

  const getRiskIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case "high":
        return <AlertTriangle className="w-4 h-4" />;
      case "medium":
        return <AlertCircle className="w-4 h-4" />;
      case "low":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const calculateComplianceRadius = (score: number) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    return { radius, circumference, progress };
  };

  const { radius, circumference, progress } = calculateComplianceRadius(results.compliance_score);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Page Header */}
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
            <p className="text-base text-muted-foreground mt-1">{fileName}</p>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Compliance Score Card */}
          <Card className="p-8 shadow-card border-border/50 rounded-3xl flex flex-col items-center justify-center min-h-80">
            <div className="relative w-40 h-40 mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-border/30"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - progress}
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ${getScoreColor(results.compliance_score)}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(results.compliance_score)}`}>
                    {results.compliance_score}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">Compliance</div>
                </div>
              </div>
            </div>
            <p className="text-base text-muted-foreground text-center leading-relaxed">
              {results.summary}
            </p>
          </Card>

          {/* Risk Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">Risk Overview</h3>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              {/* High Risk Card */}
              <div className="bg-white dark:bg-slate-950 border-2 border-destructive/20 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-destructive/15 flex items-center justify-center flex-none">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-destructive">High Risk</p>
                      <p className="text-xs text-muted-foreground">Critical issues requiring immediate attention</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-destructive">{results.risk_overview.high}</div>
                </div>
              </div>

              {/* Medium Risk Card */}
              <div className="bg-white dark:bg-slate-950 border-2 border-warning/20 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-warning/15 flex items-center justify-center flex-none">
                      <AlertCircle className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-warning">Medium Risk</p>
                      <p className="text-xs text-muted-foreground">Issues that should be addressed</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-warning">{results.risk_overview.medium}</div>
                </div>
              </div>

              {/* Low Risk Card */}
              <div className="bg-white dark:bg-slate-950 border-2 border-success/20 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center flex-none">
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-success">Low Risk</p>
                      <p className="text-xs text-muted-foreground">Minor items to monitor</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-success">{results.risk_overview.low}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Issues List */}
        {results.top_issues.length > 0 && (
          <div className="space-y-8">
            {/* Issues Header */}
            <div className="space-y-4 pb-6 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  Detected Issues
                </h3>
              </div>
              <p className="text-base text-muted-foreground pl-13">
                {results.all_issues_count} compliance issue{results.all_issues_count !== 1 ? "s" : ""} found in your document
              </p>

              {/* Risk Level Filter Buttons */}
              <div className="flex flex-wrap gap-2 pt-2 pl-13">
                <Button
                  variant={visibleRiskLevels.has('high') ? 'default' : 'outline'}
                  onClick={() => toggleRiskLevel('high')}
                  className={`text-xs rounded-lg transition-all ${
                    visibleRiskLevels.has('high')
                      ? 'bg-destructive text-white hover:bg-destructive/90'
                      : 'border-destructive/20 text-destructive hover:bg-destructive/5'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 mr-1.5" />
                  High ({results.risk_overview.high})
                </Button>
                <Button
                  variant={visibleRiskLevels.has('medium') ? 'default' : 'outline'}
                  onClick={() => toggleRiskLevel('medium')}
                  className={`text-xs rounded-lg transition-all ${
                    visibleRiskLevels.has('medium')
                      ? 'bg-warning text-white hover:bg-warning/90'
                      : 'border-warning/20 text-warning hover:bg-warning/5'
                  }`}
                >
                  <AlertCircle className="w-3 h-3 mr-1.5" />
                  Medium ({results.risk_overview.medium})
                </Button>
                <Button
                  variant={visibleRiskLevels.has('low') ? 'default' : 'outline'}
                  onClick={() => toggleRiskLevel('low')}
                  className={`text-xs rounded-lg transition-all ${
                    visibleRiskLevels.has('low')
                      ? 'bg-success text-white hover:bg-success/90'
                      : 'border-success/20 text-success hover:bg-success/5'
                  }`}
                >
                  <CheckCircle className="w-3 h-3 mr-1.5" />
                  Low ({results.risk_overview.low})
                </Button>
              </div>
            </div>

            {/* Group Issues by Risk Level */}
            {['high', 'medium', 'low'].map((riskLevel) => {
              if (!visibleRiskLevels.has(riskLevel)) return null;

              const issuesAtLevel = results.top_issues.filter(
                (issue) => issue.risk_level.toLowerCase() === riskLevel
              );
              if (issuesAtLevel.length === 0) return null;

              const riskLabels = {
                high: { 
                  label: 'High Risk', 
                  color: 'text-destructive', 
                  textSecondary: 'text-foreground/80',
                  cardBg: 'bg-white dark:bg-slate-950',
                  sectionBg: 'bg-destructive/8',
                  sectionBorder: 'border-destructive/20',
                  accentBorder: 'border-destructive/30',
                  icon: 'bg-destructive/15',
                  dotColor: 'bg-destructive/60'
                },
                medium: { 
                  label: 'Medium Risk', 
                  color: 'text-warning', 
                  textSecondary: 'text-foreground/80',
                  cardBg: 'bg-white dark:bg-slate-950',
                  sectionBg: 'bg-warning/8',
                  sectionBorder: 'border-warning/20',
                  accentBorder: 'border-warning/30',
                  icon: 'bg-warning/15',
                  dotColor: 'bg-warning/60'
                },
                low: { 
                  label: 'Low Risk', 
                  color: 'text-success', 
                  textSecondary: 'text-foreground/80',
                  cardBg: 'bg-white dark:bg-slate-950',
                  sectionBg: 'bg-success/8',
                  sectionBorder: 'border-success/20',
                  accentBorder: 'border-success/30',
                  icon: 'bg-success/15',
                  dotColor: 'bg-success/60'
                },
              };

              const style = riskLabels[riskLevel as keyof typeof riskLabels];

              return (
                <div key={riskLevel} className="space-y-4">
                  {/* Risk Level Section Header */}
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${style.sectionBg} border ${style.sectionBorder}`}>
                    <div className={`w-8 h-8 rounded-lg ${style.icon} flex items-center justify-center flex-none`}>
                      {riskLevel === 'high' && <AlertTriangle className={`w-4 h-4 ${style.color}`} />}
                      {riskLevel === 'medium' && <AlertCircle className={`w-4 h-4 ${style.color}`} />}
                      {riskLevel === 'low' && <CheckCircle className={`w-4 h-4 ${style.color}`} />}
                    </div>
                    <h4 className={`text-sm font-semibold ${style.color}`}>{style.label}</h4>
                    <span className="ml-auto text-xs font-medium text-muted-foreground">{issuesAtLevel.length} issue{issuesAtLevel.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Issues in this risk level */}
                  <div className="space-y-3">
                    {issuesAtLevel.map((issue, index) => (
                      <Card
                        key={index}
                        className={`p-6 md:p-7 shadow-card transition-all duration-300 rounded-2xl overflow-hidden group hover:shadow-xl border-2 ${style.cardBg} ${style.accentBorder}`}
                      >
                        <div className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${style.color}`} />
                        
                        {/* Issue Header */}
                        <div className="flex items-start gap-4 mb-5">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 flex-none ${style.icon}`}>
                            {getRiskIcon(issue.risk_level)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base md:text-lg text-foreground mb-2 leading-snug">{issue.title}</h4>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs rounded-lg bg-muted/50 backdrop-blur border-border/60">
                                {issue.policy_reference}
                              </Badge>
                              <Badge variant="outline" className="text-xs rounded-lg bg-muted/50 backdrop-blur border-border/60 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {issue.source_document}
                              </Badge>
                              <Badge variant="outline" className="text-xs rounded-lg bg-muted/50 backdrop-blur border-border/60">
                                Page {issue.page_number}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Issue Content */}
                        <div className="space-y-5 pl-0 md:pl-15">
                          {/* Evidence */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-2 h-2 rounded-full ${style.color}`} />
                              <p className={`text-xs font-semibold ${style.color} uppercase tracking-widest`}>Evidence</p>
                            </div>
                            <div className={`${style.sectionBg} rounded-xl p-4 border ${style.sectionBorder} backdrop-blur-sm`}>
                              <p className={`text-sm text-foreground font-medium leading-relaxed`}>{issue.evidence}</p>
                            </div>
                          </div>

                          {/* Why It Matters */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-2 h-2 rounded-full ${style.color}`} />
                              <p className={`text-xs font-semibold ${style.color} uppercase tracking-widest`}>Why It Matters</p>
                            </div>
                            <div className={`${style.sectionBg} rounded-xl p-4 border ${style.sectionBorder} backdrop-blur-sm`}>
                              <p className={`text-sm text-foreground font-medium leading-relaxed`}>{issue.why_it_matters}</p>
                            </div>
                          </div>

                          {/* Action Required */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-2 h-2 rounded-full ${style.color}`} />
                              <p className={`text-xs font-semibold ${style.color} uppercase tracking-widest`}>Action Required</p>
                            </div>
                            <div className={`${style.sectionBg} rounded-xl p-4 border ${style.sectionBorder} backdrop-blur-sm`}>
                              <p className={`text-sm text-foreground font-medium leading-relaxed`}>{issue.recommended_action}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* No visible issues message */}
            {['high', 'medium', 'low'].every((level) => !visibleRiskLevels.has(level)) && (
              <div className="text-center py-12">
                <p className="text-base text-muted-foreground">Select at least one risk level to view issues</p>
              </div>
            )}
          </div>
        )}

        {results.top_issues.length === 0 && (
          <Card className="p-12 text-center shadow-card border-border/50 bg-gradient-to-br from-success/5 to-success/10 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">No Issues Found</h3>
            <p className="text-base text-muted-foreground">
              Your document appears to comply with all applicable policies
            </p>
          </Card>
        )}

        {/* Action Buttons */}
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
      </div>
    </AppLayout>
  );
};

export default Dashboard;
