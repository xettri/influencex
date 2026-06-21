import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Megaphone, ArrowRight, CheckCircle2, Clock, Circle, Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "@/store/toast";

type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: string;
  status: CampaignStatus;
  campaignCode: string;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  _count?: { applications: number };
}

const STATUS_STYLES: Record<CampaignStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PAUSED: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-violet-50 text-violet-700 border-violet-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_ICONS: Record<CampaignStatus, typeof Circle> = {
  DRAFT: Circle,
  ACTIVE: CheckCircle2,
  PAUSED: Clock,
  COMPLETED: CheckCircle2,
  CANCELLED: Circle,
};

const ALL_STATUSES: (CampaignStatus | "ALL")[] = ["ALL", "ACTIVE", "DRAFT", "PAUSED", "COMPLETED", "CANCELLED"];

function formatBudget(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1).replace(".0", "")}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v.toLocaleString("en-IN")}`;
}

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CampaignStatus | "ALL">("ALL");

  useEffect(() => {
    api.get<Campaign[]>("/api/v1/campaigns/my")
      .then(setCampaigns)
      .catch(() => toast.error("Failed to load campaigns"))
      .finally(() => setLoading(false));
  }, []);

  const counts: Record<string, number> = { ALL: campaigns.length };
  ALL_STATUSES.slice(1).forEach((s) => {
    counts[s] = campaigns.filter((c) => c.status === s).length;
  });

  const filtered = filter === "ALL" ? campaigns : campaigns.filter((c) => c.status === filter);

  return (
    <div className="max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Brand Dashboard</p>
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display font-extrabold text-[1.75rem] text-ink tracking-tight">My Campaigns</h1>
          <Link to="/dashboard/campaigns/new" className="btn-primary text-[13px] py-2.5 px-4 shrink-0">
            <Plus className="w-4 h-4" /> New Campaign
          </Link>
        </div>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-0.5">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all ${
              filter === s
                ? "bg-violet-50 border border-violet-200 text-violet-700"
                : "bg-black/[0.03] text-ink/50 hover:text-ink hover:bg-black/[0.06] border border-transparent"
            }`}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl bg-white border border-black/6 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/6 py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-6 h-6 text-violet-400" strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-ink text-[14px] mb-1">
            {filter === "ALL" ? "No campaigns yet" : `No ${filter.toLowerCase()} campaigns`}
          </p>
          <p className="text-[13px] text-ink-muted mb-5">
            {filter === "ALL" ? "Create your first campaign to start finding creators" : "Try a different filter"}
          </p>
          {filter === "ALL" && (
            <Link to="/dashboard/campaigns/new" className="btn-primary py-2.5 px-5 text-[13px]">
              <Plus className="w-4 h-4" /> Create Campaign
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((campaign, i) => {
            const Icon = STATUS_ICONS[campaign.status];
            const appCount = campaign._count?.applications ?? 0;
            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-black/6 p-5 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="text-[14px] font-bold text-ink truncate">{campaign.title}</h3>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${STATUS_STYLES[campaign.status]}`}>
                        <Icon className="w-3 h-3" strokeWidth={2} />
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-muted line-clamp-1 mb-3">{campaign.description}</p>

                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="font-display font-bold text-[15px] text-ink">{formatBudget(campaign.budget)}</span>
                      <span className="text-[11px] text-ink-muted">{campaign.budgetType.replace(/_/g, " ")}</span>
                      <span className="flex items-center gap-1 text-[11px] text-ink-muted">
                        <Users className="w-3 h-3" />
                        {appCount} {appCount === 1 ? "application" : "applications"}
                      </span>
                      {campaign.startDate && (
                        <span className="text-[11px] text-ink-muted">
                          {new Date(campaign.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Link
                      to={`/dashboard/campaigns/${campaign.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 text-[12px] font-bold hover:bg-violet-100 transition-colors"
                    >
                      View Applications <ArrowRight className="w-3 h-3" />
                    </Link>
                    <span className="text-[10px] text-center text-ink-muted">{campaign.campaignCode}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
