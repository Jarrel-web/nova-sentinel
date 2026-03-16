import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, BarChart3, History, Shield, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: BarChart3, label: "Dashboard", path: "/dashboard", match: ["/dashboard"] },
  { icon: Zap, label: "Analyze", path: "/analyze", match: ["/analyze"] },
  { icon: History, label: "History", path: "/dashboard", match: ["/dashboard"] },
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const pageMeta =
    location.pathname === "/analyze"
      ? {
          eyebrow: "Workspace",
          title: "Run a New Analysis",
          description: "Upload a document, trigger the pipeline, and move straight into the explainable compliance review.",
        }
      : {
          eyebrow: "Compliance Review",
          title: "Executive Dashboard",
          description: "Track risk, inspect findings, review evidence, and revisit saved analyses from one place.",
        };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(190_60%_92%)_0%,hsl(210_20%_98%)_42%,hsl(210_20%_96%)_100%)]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-card">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-lg font-bold leading-none text-foreground">PolicySentinel</p>
              <p className="mt-1 text-xs text-muted-foreground">AI compliance workspace</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 rounded-2xl border border-border/60 bg-white/70 p-1.5 shadow-card md:flex">
            {navItems.map((item) => {
              const isActive = item.match.includes(location.pathname);
              return (
                <Link
                  key={`${item.label}-${item.path}`}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <Button asChild className="rounded-xl">
              <Link to="/analyze">
                New Analysis
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[2rem] border border-border/60 bg-white/75 p-6 shadow-card backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">{pageMeta.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">{pageMeta.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">{pageMeta.description}</p>
          </div>
        </div>

        <div className="pb-10">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
