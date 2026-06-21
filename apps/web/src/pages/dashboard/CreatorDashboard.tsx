import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  CheckCircle2,
  Megaphone,
  DollarSign,
  ArrowRight,
  Flame,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import type { PaginatedResponse } from "@influencex/shared";

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: string;
  status: string;
  createdAt: string;
  brand: { name: string; verified: boolean; industry: string | null };
  _count?: { applications: number };
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  gradient,
  delay,
}: {
  icon: typeof Send;
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

function CampaignCard({ campaign, delay }: { campaign: Campaign; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-2xl border border-black/6 p-5 hover:shadow-[0_4px_24px_-4px_rgba(109,40,217,0.1)] hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wide">
              {campaign.brand.name}
            </span>
            {campaign.brand.verified && (
              <CheckCircle2 className="w-3 h-3 text-violet-500 shrink-0" strokeWidth={2.5} />
            )}
          </div>
          <h3 className="text-[14px] font-bold text-ink leading-snug">{campaign.title}</h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display font-extrabold text-[1.1rem] text-ink">
            ₹{campaign.budget.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-ink-muted">{campaign.budgetType.replace("_", " ")}</p>
        </div>
      </div>

      <p className="text-[13px] text-ink-muted leading-relaxed line-clamp-2 mb-4">
        {campaign.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {campaign.brand.industry && (
            <span className="px-2 py-0.5 rounded-md bg-black/4 text-[10px] font-semibold text-ink-muted">
              {campaign.brand.industry}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-black/4 text-[10px] font-semibold text-ink-muted">
            {campaign._count?.applications ?? 0} applicants
          </span>
        </div>
        <Link
          to={`/dashboard/campaigns/${campaign.id}`}
          className="flex items-center gap-1 text-[12px] font-semibold text-brand hover:underline"
        >
          View <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}

export function CreatorDashboard() {
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<PaginatedResponse<Campaign>>("/api/v1/campaigns?limit=6")
      .then((data) => setCampaigns(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: Send, label: "Applications", value: "0", sub: "Sent this month", gradient: "from-violet-500 to-indigo-600", delay: 0 },
    { icon: CheckCircle2, label: "Approved", value: "0", sub: "Active collaborations", gradient: "from-emerald-500 to-teal-600", delay: 0.07 },
    { icon: Megaphone, label: "Campaigns", value: String(campaigns.length), sub: "Available now", gradient: "from-blue-500 to-cyan-600", delay: 0.14 },
    { icon: DollarSign, label: "Earnings", value: "₹0", sub: "Total received", gradient: "from-amber-500 to-orange-600", delay: 0.21 },
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
        <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Creator Dashboard</p>
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display font-extrabold text-[1.75rem] text-ink tracking-tight">
            Hello 👋
          </h1>
          <Link
            to="/dashboard/explore"
            className="btn-primary py-2.5 px-4 text-[13px] shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            Browse Campaigns
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

      {/* Featured campaigns */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <h2 className="font-display font-bold text-[15px] text-ink">Open Campaigns</h2>
          </div>
          <Link to="/dashboard/explore" className="flex items-center gap-1 text-[12px] font-semibold text-brand hover:underline">
            Browse all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-white border border-black/6 animate-pulse" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-black/6 py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-6 h-6 text-violet-400" strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-ink text-[14px] mb-1">No campaigns live yet</p>
            <p className="text-[13px] text-ink-muted">Check back soon — brands are joining daily</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {campaigns.map((campaign, i) => (
              <CampaignCard key={campaign.id} campaign={campaign} delay={0.32 + i * 0.06} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
