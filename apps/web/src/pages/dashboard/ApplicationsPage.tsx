import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Send, CheckCircle2, Clock, XCircle, Circle, ArrowRight, Bookmark, BarChart3,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "@/store/toast";

type AppStatus = "PENDING" | "SHORTLISTED" | "APPROVED" | "REJECTED" | "WITHDRAWN";

interface MyApplication {
  id: string;
  campaignId: string;
  influencerId: string;
  status: AppStatus;
  pitch?: string;
  createdAt: string;
  campaign?: {
    id: string;
    title: string;
    brand: { name: string; logo?: string | null; verified: boolean };
    budget: number;
    budgetType: string;
  };
}

const STATUS_STYLES: Record<AppStatus, { cls: string; icon: typeof Send; label: string }> = {
  PENDING: { cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock, label: "Pending" },
  SHORTLISTED: { cls: "bg-blue-50 text-blue-700 border-blue-200", icon: Bookmark, label: "Shortlisted" },
  APPROVED: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2, label: "Approved" },
  REJECTED: { cls: "bg-red-50 text-red-600 border-red-200", icon: XCircle, label: "Rejected" },
  WITHDRAWN: { cls: "bg-slate-100 text-slate-500 border-slate-200", icon: Circle, label: "Withdrawn" },
};

function formatBudget(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1).replace(".0", "")}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v.toLocaleString("en-IN")}`;
}

const ALL_FILTERS: (AppStatus | "ALL")[] = ["ALL", "PENDING", "SHORTLISTED", "APPROVED", "REJECTED"];

export function ApplicationsPage() {
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AppStatus | "ALL">("ALL");

  useEffect(() => {
    api.get<MyApplication[]>("/api/v1/campaigns/applications/my")
      .then(setApplications)
      .catch(() => toast.error("Failed to load applications"))
      .finally(() => setLoading(false));
  }, []);

  const counts: Record<string, number> = { ALL: applications.length };
  ALL_FILTERS.slice(1).forEach((s) => {
    counts[s] = applications.filter((a) => a.status === s).length;
  });

  const filtered = filter === "ALL" ? applications : applications.filter((a) => a.status === filter);

  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Creator Dashboard</p>
        <h1 className="font-display font-extrabold text-[1.75rem] text-ink tracking-tight">My Applications</h1>
        <p className="text-[14px] text-ink-muted mt-1">Track the campaigns you've applied to and their statuses.</p>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-0.5">
        {ALL_FILTERS.map((s) => (
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
            {s === "ALL" ? "All" : STATUS_STYLES[s as AppStatus].label} ({counts[s] ?? 0})
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
            <Send className="w-6 h-6 text-violet-400" strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-ink text-[14px] mb-1">
            {filter === "ALL" ? "No applications yet" : `No ${STATUS_STYLES[filter as AppStatus]?.label.toLowerCase()} applications`}
          </p>
          <p className="text-[13px] text-ink-muted mb-5">
            {filter === "ALL" ? "Browse campaigns and apply to start collaborating with brands" : "Try a different filter"}
          </p>
          {filter === "ALL" && (
            <Link to="/dashboard/explore" className="btn-primary py-2.5 px-5 text-[13px]">
              Browse Campaigns
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app, i) => {
            const statusInfo = STATUS_STYLES[app.status];
            const Icon = statusInfo.icon;
            const camp = app.campaign;

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-black/6 p-5"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${statusInfo.cls} border`}>
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-bold text-ink truncate">
                          {camp?.title ?? "Unknown Campaign"}
                        </h3>
                        {camp && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[11px] text-ink-muted">{camp.brand.name}</span>
                            {camp.brand.verified && (
                              <CheckCircle2 className="w-3 h-3 text-violet-500 shrink-0" strokeWidth={2.5} />
                            )}
                          </div>
                        )}
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {camp && (
                        <>
                          <span className="font-display font-bold text-[13px] text-ink">{formatBudget(camp.budget)}</span>
                          <span className="text-[11px] text-ink-muted">{camp.budgetType.replace(/_/g, " ")}</span>
                        </>
                      )}
                      <span className="text-[11px] text-ink-muted ml-auto">
                        Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    {app.pitch && (
                      <p className="text-[12px] text-ink-muted italic line-clamp-1 mt-2 pt-2 border-t border-black/6">
                        "{app.pitch}"
                      </p>
                    )}

                    <div className="mt-3 pt-3 border-t border-black/6 flex items-center justify-between gap-2">
                      {app.status === "APPROVED" && (
                        <Link
                          to="/dashboard/deliverables"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-bold hover:bg-violet-100 transition-colors"
                        >
                          <BarChart3 className="w-3 h-3" /> Track Deliverable
                        </Link>
                      )}
                      <Link
                        to={`/dashboard/campaigns/${app.campaignId}`}
                        className="flex items-center gap-1 text-[12px] font-semibold text-brand hover:underline ml-auto"
                      >
                        View Campaign <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
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
