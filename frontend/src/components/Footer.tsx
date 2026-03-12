import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="gradient-hero py-12 px-6">
      <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" />
          <span className="font-display font-bold text-primary-foreground">PolicySentinel</span>
        </div>
        <p className="text-sm text-primary-foreground/50">
          AI-powered compliance analyzer. Identify risks and ensure policy compliance instantly.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
