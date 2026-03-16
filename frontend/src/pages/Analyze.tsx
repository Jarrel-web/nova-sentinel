import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeDocument } from "@/services/api";

const Analyze = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = ["application/pdf", "text/plain"];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or TXT file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisResult = await analyzeDocument(file);
      const pdfUrl = file.type === "application/pdf" ? URL.createObjectURL(file) : null;
      toast({
        title: "Analysis complete",
        description: "Your document has been analyzed successfully",
      });
      // Navigate to dashboard with results
      navigate("/dashboard", {
        state: {
          results: analysisResult,
          fileName: file.name,
          pdfUrl,
        },
      });
    } catch (error) {
      console.error("Error analyzing document:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-3xl mx-auto py-12">
        {/* Back to Home */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Upload Card */}
        <Card className="p-0 shadow-card border-border/50 overflow-hidden">
          <div className="p-10 md:p-12">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-border hover:border-secondary/70 rounded-3xl p-16 text-center transition-all duration-300 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary/10 to-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:from-secondary/20 group-hover:to-accent/20 transition-all duration-300">
                <Upload className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-2">Drag & drop your document</h3>
              <p className="text-base text-muted-foreground mb-1">or click to browse files</p>
              <p className="text-sm text-muted-foreground">PDF or TXT | Up to 50MB</p>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.txt"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
            </div>

            {file && (
              <div className="mt-8 pt-8 border-t border-border/50 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between bg-muted/30 rounded-2xl p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Change
                  </Button>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full gradient-accent text-accent-foreground font-semibold text-base py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Analyze Document
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Analyze;
