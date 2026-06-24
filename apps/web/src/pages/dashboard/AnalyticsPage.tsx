import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Megaphone, Users, TrendingUp, DollarSign, CheckCircle2,
  BarChart3, Send, Briefcase,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { toast } from "@/store/toast";
import type { BrandAnalytics, CreatorAnalytics } from "@influencex/shared";

// ── Shared ────────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, gradient, delay,
}: {
  icon: typeof Megaphone; label: string; value: string; sub: string; gradient: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="bg-white rounded-2xl p-5 border border-black/6 hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] transition-shadow"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5 text-white" strokeWidth={1.75} />
      </div>
      <p className="text-[11px] font-bold text-ink/40 uppercase tracking-widest mb-1">{label}</p>
      <p className="font-display font-extrabold text-[1.8rem] text-ink leading-none mb-1">{value}</p>
      <p className="text-[12px] text-ink-muted">{sub}</p>
    </motion.div>
  );
}

function ChartCard({ title, subtitle, children, delay }: {
  title: string; subtitle?: string; children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay ?? 0 }}
      className="bg-white rounded-2xl border border-black/6 p-5"
    >
      <p className="font-display font-bold text-[14px] text-ink mb-0.5">{title}</p>
      {subtitle && <p className="text-[11px] text-ink-muted mb-5">{subtitle}</p>}
      {!subtitle && <div className="mb-5" />}
      {children}
    </motion.div>
  );
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "12px",
    boxShadow: "0 4px 24px -4px rgba(0,0,0,0.12)",
    fontSize: "12px",
    padding: "8px 12px",
  },
  labelStyle: { color: "#3b3b4f", fontWeight: 700, marginBottom: 4 },
  itemStyle: { color: "#6b7280" },
};

const PIE_COLORS: Record<string, string> = {
  PENDING:     "#f59e0b",
  SHORTLISTED: "#3b82f6",
  APPROVED:    "#10b981",
  REJECTED:    "#ef4444",
  WITHDRAWN:   "#94a3b8",
  DRAFT:       "#94a3b8",
  ACTIVE:      "#10b981",
  PAUSED:      "#f59e0b",
  COMPLETED:   "#8b5cf6",
  CANCELLED:   "#ef4444",
};

function formatBudget(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1).replace(".0", "")}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v.toLocaleString("en-IN")}`;
}

// ── Brand Analytics ───────────────────────────────────────────────────────────

function BrandAnalyticsView() {
  const [data, setData] = useState<BrandAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<BrandAnalytics>("/api/v1/analytics/brand")
      .then(setData)
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AnalyticsSkeleton />;
  if (!data) return null;

  const { overview } = data;

  const statCards = [
    { icon: Megaphone,  label: "Total Campaigns",  value: String(overview.totalCampaigns),  sub: `${overview.activeCampaigns} active`,                          gradient: "from-violet-500 to-indigo-600", delay: 0 },
    { icon: Users,      label: "Applications",      value: String(overview.totalApplications), sub: "Across all campaigns",                                     gradient: "from-blue-500 to-cyan-600",     delay: 0.07 },
    { icon: CheckCircle2,label: "Approval Rate",   value: `${overview.approvalRate}%`,        sub: `${overview.approvedCount} approved`,                       gradient: "from-emerald-500 to-teal-600",  delay: 0.14 },
    { icon: DollarSign, label: "Budget Active",     value: formatBudget(overview.totalBudgetActive), sub: "In live campaigns",                                  gradient: "from-amber-500 to-orange-600",  delay: 0.21 },
  ];

  // Collapse days for x-axis labels — show every 5th
  const timeData = data.applicationsOverTime.map((d, i) => ({
    ...d,
    label: i % 5 === 0 ? d.date.slice(5) : "",
  }));

  const statusPieData = Object.entries(data.applicationsByStatus)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const campStatusPieData = Object.entries(data.campaignsByStatus)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Applications over time */}
      <ChartCard title="Applications received" subtitle="Last 30 days" delay={0.28}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={timeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [v, "Applications"]} labelFormatter={(l) => l || ""} />
            <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fill="url(#appGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: "#8b5cf6" }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Applications by status */}
        <ChartCard title="Applications by status" delay={0.32}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {statusPieData.map((entry) => (
                  <Cell key={entry.name} fill={PIE_COLORS[entry.name] ?? "#8b5cf6"} />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => [v, name]} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: "#6b7280" }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Campaign status */}
        <ChartCard title="Campaigns by status" delay={0.36}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={campStatusPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {campStatusPieData.map((entry) => (
                  <Cell key={entry.name} fill={PIE_COLORS[entry.name] ?? "#8b5cf6"} />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => [v, name]} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: "#6b7280" }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top campaigns bar chart */}
      {data.topCampaigns.length > 0 && (
        <ChartCard title="Top campaigns by applications" subtitle="Approved vs total applicants" delay={0.4}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.topCampaigns} margin={{ top: 4, right: 4, left: -16, bottom: 40 }} barSize={14} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="title" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => [v, name === "applications" ? "Total" : "Approved"]} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: "#6b7280" }}>{v === "applications" ? "Total applications" : "Approved"}</span>} />
              <Bar dataKey="applications" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
              <Bar dataKey="approved" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

// ── Creator Analytics ─────────────────────────────────────────────────────────

function CreatorAnalyticsView() {
  const [data, setData] = useState<CreatorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<CreatorAnalytics>("/api/v1/analytics/creator")
      .then(setData)
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AnalyticsSkeleton />;
  if (!data) return null;

  const { overview } = data;

  const statCards = [
    { icon: Send,         label: "Applications",      value: String(overview.totalApplications),  sub: `${overview.pendingCount} pending`,        gradient: "from-violet-500 to-indigo-600", delay: 0 },
    { icon: CheckCircle2, label: "Approval Rate",      value: `${overview.approvalRate}%`,         sub: `${overview.approvedCount} approved`,      gradient: "from-emerald-500 to-teal-600",  delay: 0.07 },
    { icon: Briefcase,    label: "Direct Hires",       value: String(overview.directHires),        sub: "Accepted collaborations",                 gradient: "from-blue-500 to-cyan-600",     delay: 0.14 },
    { icon: DollarSign,   label: "Earnings Pipeline",  value: overview.estimatedEarnings > 0 ? formatBudget(overview.estimatedEarnings) : "₹0", sub: "From approved campaigns",              gradient: "from-amber-500 to-orange-600",  delay: 0.21 },
  ];

  const statusPieData = Object.entries(data.applicationsByStatus)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Application activity by month */}
        <ChartCard title="Application activity" subtitle="Last 6 months" delay={0.28}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.activityByMonth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [v, "Applications"]} />
              <Bar dataKey="applications" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Status distribution */}
        <ChartCard title="Status breakdown" delay={0.32}>
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusPieData.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name] ?? "#8b5cf6"} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => [v, name]} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: "#6b7280" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-[12px] text-ink-muted">No applications yet</div>
          )}
        </ChartCard>
      </div>

      {/* Earnings pipeline */}
      {data.earningsPipeline.length > 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
          className="bg-white rounded-2xl border border-black/6 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-black/6">
            <p className="font-display font-bold text-[14px] text-ink">Earnings pipeline</p>
            <p className="text-[11px] text-ink-muted mt-0.5">Campaigns where you are shortlisted or approved</p>
          </div>
          <div className="divide-y divide-black/4">
            {data.earningsPipeline.map((e) => (
              <div key={e.campaignId} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink truncate">{e.title}</p>
                  <p className="text-[11px] text-ink-muted">{e.brand}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-[14px] text-ink">{formatBudget(e.budget)}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                    e.status === "APPROVED"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-blue-50 border-blue-200 text-blue-700"
                  }`}>
                    {e.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
          className="bg-white rounded-2xl border border-black/6 py-16 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-violet-400" strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-ink text-[14px] mb-1">No active pipeline yet</p>
          <p className="text-[13px] text-ink-muted">Apply to campaigns to start building your earnings pipeline.</p>
        </motion.div>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-2xl bg-white border border-black/6 animate-pulse" />)}
      </div>
      <div className="h-64 rounded-2xl bg-white border border-black/6 animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => <div key={i} className="h-56 rounded-2xl bg-white border border-black/6 animate-pulse" />)}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const { user } = useAuthStore();
  const isBrand = user?.role === "BRAND";

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-widest mb-1">
          {isBrand ? "Brand Dashboard" : "Creator Dashboard"}
        </p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" strokeWidth={1.75} />
          </div>
          <h1 className="font-display font-extrabold text-[1.75rem] text-ink tracking-tight">Analytics</h1>
        </div>
        <p className="text-[14px] text-ink-muted mt-1.5">
          {isBrand
            ? "Campaign performance, application trends, and budget overview."
            : "Your application history, approval rates, and earnings pipeline."}
        </p>
      </motion.div>

      {isBrand ? <BrandAnalyticsView /> : <CreatorAnalyticsView />}
    </div>
  );
}
