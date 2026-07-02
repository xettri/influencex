import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, MousePointerClick, ShoppingCart, Eye, Users, Heart,
  MessageCircle, Share2, Bookmark, RefreshCw, IndianRupee,
} from "lucide-react";
import type { CampaignMetrics } from "@influencex/shared";
import { api } from "@/lib/api";
import { toast } from "@/store/toast";

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtRupee(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function MetricTile({
  icon: Icon,
  label,
  value,
  sub,
  accent = "violet",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: "violet" | "blue" | "emerald" | "amber" | "rose";
}) {
  const colors = {
    violet: "bg-violet-50 text-violet-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.02] border border-black/6">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colors[accent]}`}>
        <Icon className="w-4 h-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-ink/50 uppercase tracking-wide leading-none mb-0.5">{label}</p>
        <p className="font-display font-extrabold text-[1.1rem] text-ink leading-none">{value}</p>
        {sub && <p className="text-[10px] text-ink-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function EngagementBar({ label, value, total, icon: Icon, color }: {
  label: string;
  value: number;
  total: number;
  icon: React.ElementType;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-3 h-3" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-ink/70">{label}</span>
          <span className="text-[11px] font-bold text-ink">{fmt(value)}</span>
        </div>
        <div className="h-1.5 bg-black/[0.05] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-violet-400 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

interface Props {
  metrics: CampaignMetrics;
  onRefresh?: () => void;
}

export function CampaignFunnelMetrics({ metrics, onRefresh }: Props) {
  const [syncing, setSyncing] = useState(false);
  const { funnel, deliverables } = metrics;

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const ytDeliverables = deliverables.filter((d) => d.ytVideoId);
      await Promise.all(ytDeliverables.map((d) => api.post(`/api/v1/deliverables/${d.id}/sync`, {})));
      toast.success("YouTube stats refreshed");
      onRefresh?.();
    } catch {
      toast.error("Failed to sync some stats");
    } finally {
      setSyncing(false);
    }
  };

  const hasYt = deliverables.some((d) => d.ytVideoId);
  const totalBudget = funnel.budgetBase;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-ink/50 uppercase tracking-wide">Campaign spend</p>
          <p className="font-display font-extrabold text-[1.4rem] text-ink">{fmtRupee(totalBudget)}</p>
        </div>
        {hasYt && (
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.04] hover:bg-black/[0.08] text-[12px] font-semibold text-ink/60 hover:text-ink transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            Sync YT stats
          </button>
        )}
      </div>

      {/* ── LAYER 1: TOP — Awareness ── */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl" />
        <div className="relative p-5 rounded-2xl border border-violet-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <p className="text-[12px] font-black text-violet-700 uppercase tracking-wide">Top — Awareness</p>
            <div className="flex-1 h-px bg-violet-200 ml-1" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MetricTile
              icon={Users}
              label="Total Reach"
              value={funnel.top.totalReach > 0 ? fmt(funnel.top.totalReach) : "—"}
              sub="Unique accounts"
              accent="violet"
            />
            <MetricTile
              icon={Eye}
              label="Impressions"
              value={funnel.top.totalImpressions > 0 ? fmt(funnel.top.totalImpressions) : "—"}
              sub="Views + reported"
              accent="violet"
            />
            <MetricTile
              icon={IndianRupee}
              label="CPM"
              value={funnel.top.cpm != null ? fmtRupee(Math.round(funnel.top.cpm)) : "—"}
              sub="Cost per 1K impressions"
              accent="violet"
            />
          </div>
        </div>
      </div>

      {/* Funnel neck */}
      <div className="flex justify-center">
        <div className="w-0.5 h-4 bg-gradient-to-b from-violet-300 to-blue-300 mx-auto" />
      </div>

      {/* ── LAYER 2: MIDDLE — Engagement ── */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl" style={{ clipPath: "polygon(3% 0%, 97% 0%, 100% 100%, 0% 100%)" }} />
        <div className="relative p-5 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-[12px] font-black text-blue-700 uppercase tracking-wide">Middle — Engagement</p>
            <div className="flex-1 h-px bg-blue-200 ml-1" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <MetricTile
              icon={TrendingUp}
              label="Total Engagements"
              value={funnel.middle.totalEngagements > 0 ? fmt(funnel.middle.totalEngagements) : "—"}
              accent="blue"
            />
            <MetricTile
              icon={MousePointerClick}
              label="Link Clicks"
              value={funnel.middle.totalClicks > 0 ? fmt(funnel.middle.totalClicks) : "—"}
              accent="blue"
            />
            <MetricTile
              icon={IndianRupee}
              label="CPE"
              value={funnel.middle.cpe != null ? fmtRupee(Math.round(funnel.middle.cpe)) : "—"}
              sub="Cost per engagement"
              accent="blue"
            />
            <MetricTile
              icon={MousePointerClick}
              label="CPC / CTR"
              value={funnel.middle.cpc != null ? fmtRupee(Math.round(funnel.middle.cpc)) : "—"}
              sub={funnel.middle.ctr != null ? `${funnel.middle.ctr.toFixed(2)}% CTR` : "—"}
              accent="blue"
            />
          </div>

          {/* Engagement breakdown bars */}
          {funnel.middle.totalEngagements > 0 && (
            <div className="space-y-2.5 pt-4 border-t border-blue-100">
              <p className="text-[10px] font-bold text-ink/50 uppercase tracking-wide mb-2">Breakdown</p>
              <EngagementBar icon={Heart} label="Likes" value={funnel.middle.breakdown.likes} total={funnel.middle.totalEngagements} color="bg-rose-50 text-rose-500" />
              <EngagementBar icon={MessageCircle} label="Comments" value={funnel.middle.breakdown.comments} total={funnel.middle.totalEngagements} color="bg-blue-50 text-blue-500" />
              <EngagementBar icon={Share2} label="Shares" value={funnel.middle.breakdown.shares} total={funnel.middle.totalEngagements} color="bg-emerald-50 text-emerald-500" />
              <EngagementBar icon={Bookmark} label="Saves" value={funnel.middle.breakdown.saves} total={funnel.middle.totalEngagements} color="bg-amber-50 text-amber-500" />
            </div>
          )}
        </div>
      </div>

      {/* Funnel neck */}
      <div className="flex justify-center">
        <div className="w-0.5 h-4 bg-gradient-to-b from-blue-300 to-emerald-300 mx-auto" />
      </div>

      {/* ── LAYER 3: BOTTOM — Conversions ── */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl" />
        <div className="relative p-5 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-[12px] font-black text-emerald-700 uppercase tracking-wide">Bottom — Conversions</p>
            <div className="flex-1 h-px bg-emerald-200 ml-1" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricTile
              icon={ShoppingCart}
              label="Conversions"
              value={funnel.bottom.totalConversions > 0 ? String(funnel.bottom.totalConversions) : "—"}
              sub="Brand-reported"
              accent="emerald"
            />
            <MetricTile
              icon={IndianRupee}
              label="Revenue"
              value={funnel.bottom.totalRevenue > 0 ? fmtRupee(funnel.bottom.totalRevenue) : "—"}
              accent="emerald"
            />
            <MetricTile
              icon={IndianRupee}
              label="CPA"
              value={funnel.bottom.cpa != null ? fmtRupee(Math.round(funnel.bottom.cpa)) : "—"}
              sub="Cost per acquisition"
              accent="emerald"
            />
            <MetricTile
              icon={TrendingUp}
              label="ROAS"
              value={funnel.bottom.roas != null ? `${funnel.bottom.roas.toFixed(2)}x` : "—"}
              sub="Return on ad spend"
              accent="emerald"
            />
          </div>

          {funnel.bottom.totalConversions === 0 && (
            <p className="text-[12px] text-ink-muted text-center mt-4 pt-3 border-t border-emerald-100">
              No conversions reported yet. Report them via each creator's deliverable card.
            </p>
          )}
        </div>
      </div>

      {/* Per-deliverable table */}
      {deliverables.length > 0 && (
        <div className="bg-white rounded-2xl border border-black/6 overflow-hidden">
          <div className="px-5 py-3 border-b border-black/6">
            <p className="text-[12px] font-bold text-ink">Per-creator breakdown</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-black/6 bg-black/[0.02]">
                  <th className="px-4 py-2.5 text-left font-semibold text-ink/50">Creator</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-ink/50">Impressions</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-ink/50">Engagements</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-ink/50">Clicks</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-ink/50">Conversions</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-ink/50">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {deliverables.map((d) => {
                  const impressions = (d.reportedImpressions ?? 0) + d.ytViews;
                  const eng = (d.ytViews > 0 ? d.ytLikes + d.ytComments : (d.reportedLikes ?? 0) + (d.reportedComments ?? 0)) + (d.reportedShares ?? 0) + (d.reportedSaves ?? 0);
                  return (
                    <tr key={d.id} className="border-b border-black/4 hover:bg-black/[0.015] transition-colors">
                      <td className="px-4 py-3 font-medium text-ink">{d.influencer?.displayName ?? "—"}</td>
                      <td className="px-4 py-3 text-right text-ink/70">{impressions > 0 ? fmt(impressions) : "—"}</td>
                      <td className="px-4 py-3 text-right text-ink/70">{eng > 0 ? fmt(eng) : "—"}</td>
                      <td className="px-4 py-3 text-right text-ink/70">{d.totalClicks > 0 ? fmt(d.totalClicks) : "—"}</td>
                      <td className="px-4 py-3 text-right text-ink/70">{d.conversions > 0 ? String(d.conversions) : "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-ink">{d.revenue > 0 ? fmtRupee(d.revenue) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
