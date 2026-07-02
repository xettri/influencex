import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Link2, Copy, Check, RefreshCw, Youtube, Send,
  ChevronDown, ChevronUp, ExternalLink, Plus, Loader2,
} from "lucide-react";
import type { CampaignDeliverable } from "@influencex/shared";
import { api } from "@/lib/api";
import { toast } from "@/store/toast";

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function MetricPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center px-3 py-2 rounded-xl bg-black/[0.03] border border-black/6">
      <p className="font-display font-extrabold text-[1rem] text-ink leading-none">{value === 0 || value === null ? "—" : value}</p>
      <p className="text-[10px] text-ink-muted mt-0.5">{label}</p>
    </div>
  );
}

function CopyLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/l/${code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-black/[0.03] border border-black/6">
      <Link2 className="w-3.5 h-3.5 text-ink/40 shrink-0" />
      <span className="flex-1 text-[11px] text-ink/60 font-mono truncate">{link}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-black/8 text-[11px] font-semibold text-ink/60 hover:text-ink transition-colors"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function DeliverableCard({ deliverable, onUpdate }: { deliverable: CampaignDeliverable; onUpdate: (d: CampaignDeliverable) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    ytVideoUrl: deliverable.ytVideoId ?? "",
    reportedReach: String(deliverable.reportedReach ?? ""),
    reportedImpressions: String(deliverable.reportedImpressions ?? ""),
    reportedLikes: String(deliverable.reportedLikes ?? ""),
    reportedComments: String(deliverable.reportedComments ?? ""),
    reportedShares: String(deliverable.reportedShares ?? ""),
    reportedSaves: String(deliverable.reportedSaves ?? ""),
  });

  const handleSync = async () => {
    if (!deliverable.ytVideoId) return;
    setSyncing(true);
    try {
      const updated = await api.post<CampaignDeliverable>(`/api/v1/deliverables/${deliverable.id}/sync`, {});
      onUpdate(updated);
      toast.success("YouTube stats refreshed");
    } catch {
      toast.error("Failed to sync");
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {};
      if (form.ytVideoUrl.trim()) payload.ytVideoUrl = form.ytVideoUrl.trim();
      if (form.reportedReach) payload.reportedReach = Number(form.reportedReach);
      if (form.reportedImpressions) payload.reportedImpressions = Number(form.reportedImpressions);
      if (form.reportedLikes) payload.reportedLikes = Number(form.reportedLikes);
      if (form.reportedComments) payload.reportedComments = Number(form.reportedComments);
      if (form.reportedShares) payload.reportedShares = Number(form.reportedShares);
      if (form.reportedSaves) payload.reportedSaves = Number(form.reportedSaves);
      const updated = await api.patch<CampaignDeliverable>(`/api/v1/deliverables/${deliverable.id}/report`, payload);
      onUpdate(updated);
      toast.success("Metrics updated");
      setExpanded(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  const campTitle = deliverable.campaign?.title ?? "Direct Hire";
  const brandName = deliverable.campaign?.brand.name ?? "";
  const hasYt = !!deliverable.ytVideoId;
  const hasReport = deliverable.submittedAt != null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-black/6 overflow-hidden"
    >
      <div className="p-5">
        {/* Campaign + status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-ink/50 uppercase tracking-wide">{brandName}</p>
            <h3 className="text-[15px] font-bold text-ink leading-snug truncate">{campTitle}</h3>
          </div>
          <span className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-bold ${
            deliverable.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
          }`}>
            {deliverable.status}
          </span>
        </div>

        {/* Tracking link */}
        <CopyLink code={deliverable.trackingCode} />

        {/* Quick metrics */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <MetricPill label="Clicks" value={deliverable.totalClicks > 0 ? fmt(deliverable.totalClicks) : "—"} />
          <MetricPill label="Reach" value={deliverable.reportedReach ? fmt(deliverable.reportedReach) : "—"} />
          <MetricPill label="YT Views" value={deliverable.ytViews > 0 ? fmt(deliverable.ytViews) : "—"} />
          <MetricPill label="Conversions" value={deliverable.conversions > 0 ? String(deliverable.conversions) : "—"} />
        </div>

        {/* YouTube stats chip */}
        {hasYt && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-100 text-red-700 text-[11px] font-semibold">
              <Youtube className="w-3 h-3" />
              <span>{fmt(deliverable.ytViews)} views · {fmt(deliverable.ytLikes)} likes · {fmt(deliverable.ytComments)} comments</span>
            </div>
            {deliverable.ytLastSynced && (
              <span className="text-[10px] text-ink/30">
                Last synced {new Date(deliverable.ytLastSynced).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            )}
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/[0.04] hover:bg-black/[0.08] text-[11px] font-semibold text-ink/50 hover:text-ink transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        )}

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:underline"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {hasReport ? "Edit metrics" : "Submit metrics"}
        </button>
      </div>

      {/* Expandable form */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmitReport} className="border-t border-black/6 p-5 bg-black/[0.015] space-y-4">
              {/* YouTube video URL */}
              <div>
                <label className="block text-[11px] font-bold text-ink/70 mb-1.5 flex items-center gap-1">
                  <Youtube className="w-3 h-3 text-red-500" />
                  YouTube video URL or ID
                </label>
                <input
                  type="text"
                  value={form.ytVideoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, ytVideoUrl: e.target.value }))}
                  placeholder="https://youtu.be/... or video ID"
                  className="input-light text-[12px]"
                />
                <p className="text-[10px] text-ink-muted mt-1">We'll fetch views, likes, and comments automatically.</p>
              </div>

              {/* Self-reported metrics */}
              <div>
                <p className="text-[11px] font-bold text-ink/70 mb-2">Self-reported metrics</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: "reportedReach", label: "Total Reach" },
                    { key: "reportedImpressions", label: "Impressions" },
                    { key: "reportedLikes", label: "Likes" },
                    { key: "reportedComments", label: "Comments" },
                    { key: "reportedShares", label: "Shares" },
                    { key: "reportedSaves", label: "Saves" },
                  ] as const).map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-[10px] font-semibold text-ink/50 mb-1">{label}</label>
                      <input
                        type="number"
                        min="0"
                        value={form[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder="0"
                        className="input-light text-[12px] py-2"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button type="submit" disabled={submitting} className="btn-primary text-[12px] py-2 px-4 disabled:opacity-60">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Save metrics</>}
                </button>
                <button type="button" onClick={() => setExpanded(false)} className="text-[12px] text-ink/50 font-semibold hover:text-ink transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState<CampaignDeliverable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<CampaignDeliverable[]>("/api/v1/deliverables/my")
      .then(setDeliverables)
      .catch(() => toast.error("Failed to load deliverables"))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (updated: CampaignDeliverable) => {
    setDeliverables((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Creator Dashboard</p>
        <h1 className="font-display font-extrabold text-[1.75rem] text-ink tracking-tight">Deliverables</h1>
        <p className="text-[14px] text-ink-muted mt-1">
          Track your collaboration links, submit content metrics, and see your campaign performance.
        </p>
      </motion.div>

      {/* How it works */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-violet-50 border border-violet-100 rounded-2xl p-5 mb-6">
        <p className="text-[12px] font-bold text-violet-700 mb-2 flex items-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5" /> How collaboration links work
        </p>
        <p className="text-[12px] text-violet-600/80 leading-relaxed">
          Share your unique tracking link in your content captions, bio, or stories. Every click is counted — brands can see real-time traffic and conversion data. You can also submit your YouTube video URL and self-report metrics like reach, saves, and shares for a full funnel picture.
        </p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-52 rounded-2xl bg-white border border-black/6 animate-pulse" />)}
        </div>
      ) : deliverables.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/6 py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-violet-400" strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-ink text-[14px] mb-1">No deliverables yet</p>
          <p className="text-[13px] text-ink-muted mb-5">
            Once a brand approves your application or hire request, a tracking link is generated here.
          </p>
          <a href="/dashboard/applications" className="btn-primary py-2.5 px-5 text-[13px]">
            <Plus className="w-4 h-4" /> View my applications
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {deliverables.map((d) => (
            <DeliverableCard key={d.id} deliverable={d} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
