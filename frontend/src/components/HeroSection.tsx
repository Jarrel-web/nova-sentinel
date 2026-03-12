import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="relative container max-w-6xl mx-auto px-6 pt-32 pb-24">
        {/* Nav */}
        <nav className="absolute top-0 left-0 right-0 px-6 py-6">
          <div className="container max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-accent" />
              <span className="font-display font-bold text-xl text-primary-foreground">
                PolicySentinel
              </span>
            </div>
          </div>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/25 mb-8">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium text-accent">AI-Powered Compliance Analysis</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Analyze compliance{" "}
            <span className="text-accent">risks</span> in seconds,{" "}
            not months
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-2xl leading-relaxed">
            PolicySentinel analyzes your documents against compliance policies, identifies risks automatically, and provides actionable insights — powered by AI.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-primary-foreground/10 pt-10"
        >
          {[
            { value: "100%", label: "AI-Powered" },
            { value: "<30s", label: "Analysis Time" },
            { value: "∞", label: "Scalable" },
            { value: "Risk", label: "Scored" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-accent">{stat.value}</p>
              <p className="text-sm text-primary-foreground/50 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
