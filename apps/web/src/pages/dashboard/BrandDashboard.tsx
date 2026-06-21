import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Megaphone,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";

interface Campaign {
  id: string;
  title: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  budget: number;
  budgetType: string;
  createdAt: string;
  _count?: { applications: number };
}

interface StatsState {
  total: number;
  active: number;
  applications: number;
  budgetLocked: number;
}

const statusStyles: Record<Campaign["status"], string> = {
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PAUSED: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-violet-50 text-violet-700 border-violet-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

const statusIcons: Record<Campaign["status"], typeof Circle> = {
  DRAFT: Circle,
  ACTIVE: CheckCircle2,
  PAUSED: Clock,
  COMPLETED: CheckCircle2,
  CANCELLED: Circle,
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  gradient,
  delay,
}: {
  icon: typeof Megaphone;
  label: string;
  value: string;
  sub: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-2xl p-5 border border-black/6 hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] transition-shadow"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5 text-white" strokeWidth={1.75} />
      </div>
      <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-wide mb-1">{label}</p>
      <p className="font-display font-extrabold text-[1.8rem] text-ink leading-none mb-1">{value}</p>
      <p className="text-[12px] text-ink-muted">{sub}</p>
    </motion.div>
  );
}

export function BrandDashboard() {
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<StatsState>({ total: 0, active: 0, applications: 0, budgetLocked: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Campaign[]>("/api/v1/campaigns/my")
      .then((data) => {
        setCampaigns(data);
        const totalApps = data.reduce((s, c) => s + (c._count?.applications ?? 0), 0);
        setStats({
          total: data.length,
          active: data.filter((c) => c.status === "ACTIVE").length,
          applications: totalApps,
          budgetLocked: data.filter((c) => c.status === "ACTIVE").reduce((s, c) => s + c.budget, 0),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      icon: Megaphone,
      label: "Total Campaigns",
      value: String(stats.total),
      sub: `${stats.active} currently active`,
      gradient: "from-violet-500 to-indigo-600",
      delay: 0,
    },
    {
      icon: Users,
      label: "Applications",
      value: String(stats.applications),
      sub: "Across all campaigns",
      gradient: "from-blue-500 to-cyan-600",
      delay: 0.07,
    },
    {
      icon: TrendingUp,
      label: "Active Now",
      value: String(stats.active),
      sub: "Running campaigns",
      gradient: "from-emerald-500 to-teal-600",
      delay: 0.14,
    },
    {
      icon: DollarSign,
      label: "Budget Live",
      value: stats.budgetLocked > 0 ? `₹${stats.budgetLocked.toLocaleString("en-IN")}` : "₹0",
      sub: "In active campaigns",
      gradient: "from-amber-500 to-orange-600",
      delay: 0.21,
    },
  ];

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8"
      >
        <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Brand Dashboard</p>
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display font-extrabold text-[1.75rem] text-ink tracking-tight">
            Hello 👋
          </h1>
          <Link
            to="/dashboard/campaigns/new"
            className="btn-primary py-2.5 px-4 text-[13px] shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </Link>
        </div>
        <p className="text-[14px] text-ink-muted mt-1">
          {user?.email} · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* Campaigns table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="bg-white rounded-2xl border border-black/6 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/6">
          <h2 className="font-display font-bold text-[15px] text-ink">My Campaigns</h2>
          <Link to="/dashboard/campaigns" className="flex items-center gap-1 text-[12px] font-semibold text-brand hover:underline">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-black/4 animate-pulse" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-6 h-6 text-violet-400" strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-ink text-[14px] mb-1">No campaigns yet</p>
            <p className="text-[13px] text-ink-muted mb-5">Post your first campaign in under 5 minutes</p>
            <Link to="/dashboard/campaigns/new" className="btn-primary py-2.5 px-5 text-[13px]">
              <Plus className="w-4 h-4" />
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-black/4">
            {campaigns.slice(0, 8).map((campaign) => {
              const Icon = statusIcons[campaign.status];
              return (
                <div key={campaign.id} className="flex items-center gap-4 px-6 py-4 hover:bg-black/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-ink truncate">{campaign.title}</p>
                    <p className="text-[12px] text-ink-muted">
                      {campaign._count?.applications ?? 0} applicants · ₹{campaign.budget.toLocaleString("en-IN")} {campaign.budgetType.replace("_", " ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${statusStyles[campaign.status]}`}>
                      <Icon className="w-3 h-3" strokeWidth={2} />
                      {campaign.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
