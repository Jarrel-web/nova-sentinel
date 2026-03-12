import { Shield, FileText, Search, GitCompare, AlertTriangle, ClipboardCheck, FileOutput, Send } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Document Upload",
    description: "Upload your compliance policies and documents for AI-powered analysis.",
  },
  {
    icon: Search,
    title: "Risk Detection",
    description: "AI automatically identifies compliance risks and gaps in your documents.",
  },
  {
    icon: Shield,
    title: "Policy Analysis",
    description: "Intelligent extraction of compliance requirements from policy documents.",
  },
  {
    icon: AlertTriangle,
    title: "Risk Scoring",
    description: "Get categorized findings with High, Medium, and Low risk assessments.",
  },
  {
    icon: ClipboardCheck,
    title: "Evidence Gathering",
    description: "Automatic citation and evidence collection from source documents.",
  },
  {
    icon: FileOutput,
    title: "Detailed Reports",
    description: "Generate actionable compliance reports with remediation recommendations.",
  },
  {
    icon: Send,
    title: "Instant Insights",
    description: "Get compliance analysis results in seconds, not weeks.",
  },
  {
    icon: GitCompare,
    title: "Continuous Monitoring",
    description: "Upload new documents anytime to assess ongoing compliance status.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase text-secondary mb-3">
            Core Capabilities
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Intelligent Compliance Analysis
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From document analysis to risk identification — PolicySentinel covers every step of your compliance review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50 hover:border-secondary/30"
            >
              <div className="w-11 h-11 rounded-lg gradient-accent flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              <div className="absolute bottom-0 left-6 right-6 h-0.5 gradient-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
