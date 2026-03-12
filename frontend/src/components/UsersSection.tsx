import { Users, Briefcase, Scale, MonitorCheck, BarChart3 } from "lucide-react";

const users = [
  { icon: Users, title: "Compliance Officers", type: "Primary" },
  { icon: BarChart3, title: "Risk Managers", type: "Primary" },
  { icon: Briefcase, title: "Internal Audit Teams", type: "Primary" },
  { icon: Scale, title: "Legal Teams", type: "Secondary" },
  { icon: MonitorCheck, title: "IT Security Teams", type: "Secondary" },
];

const UsersSection = () => {
  return (
    <section id="users" className="py-24 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase text-secondary mb-3">
            Target Users
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built for Compliance Teams
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {users.map((user) => (
            <div
              key={user.title}
              className="flex items-center gap-3 px-6 py-4 rounded-xl bg-card shadow-card border border-border/50"
            >
              <user.icon className="w-5 h-5 text-secondary" />
              <div>
                <p className="font-display font-semibold text-foreground text-sm">{user.title}</p>
                <p className="text-xs text-muted-foreground">{user.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UsersSection;
