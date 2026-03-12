import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Zap, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Zap, label: "Analyze", path: "/analyze" },
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 gradient-hero flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" />
          <span className="font-display font-bold text-lg text-primary-foreground">PolicySentinel</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-primary-foreground"
                    : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
