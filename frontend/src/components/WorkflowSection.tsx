import { Upload, Play, GitCompare, AlertTriangle, ClipboardCheck, FileOutput, CheckCircle, Send } from "lucide-react";

const steps = [
  { icon: Upload, label: "Upload Documents", description: "Regulatory & policy files" },
  { icon: Play, label: "Run Analysis", description: "AI-powered extraction" },
  { icon: GitCompare, label: "View Mapping", description: "Policy ↔ regulation links" },
  { icon: AlertTriangle, label: "Identify Gaps", description: "Compliance status check" },
  { icon: ClipboardCheck, label: "Remediation Plan", description: "Corrective actions" },
  { icon: FileOutput, label: "Generate Evidence", description: "Audit-ready packs" },
  { icon: CheckCircle, label: "Approve", description: "Review & confirm" },
  { icon: Send, label: "Submit Report", description: "Automated delivery" },
];

const WorkflowSection = () => {
  return (
    <section id="workflow" className="py-24 px-6 bg-muted/50">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase text-secondary mb-3">
            User Flow
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            From Upload to Submission
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A streamlined 8-step workflow that takes you from raw documents to automated compliance reporting.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.label} className="relative flex flex-col items-center text-center group">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-card shadow-card border border-border/50 flex items-center justify-center group-hover:shadow-elevated group-hover:border-secondary/30 transition-all duration-300">
                  <step.icon className="w-7 h-7 text-secondary" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
              <h4 className="font-display font-semibold text-foreground mt-4 text-sm">{step.label}</h4>
              <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
