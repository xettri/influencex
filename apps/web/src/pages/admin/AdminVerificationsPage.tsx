import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, CheckCircle2, XCircle, Clock, ExternalLink, Loader2, RefreshCw,
} from "lucide-react";
import type { PlatformName } from "@influencex/shared";
import { api } from "@/lib/api";
import { toast } from "@/store/toast";

const PLATFORM_URLS: Record<PlatformName, (handle: string) => string> = {
  INSTAGRAM: (h) => `https://instagram.com/${h}`,
  YOUTUBE: (h) => `https://youtube.com/@${h}`,
  TIKTOK: (h) => `https://tiktok.com/@${h}`,
  TWITTER: (h) => `https://x.com/${h}`,
  LINKEDIN: (h) => `https://linkedin.com/in/${h}`,
  PINTEREST: (h) => `https://pinterest.com/${h}`,
};

const PLATFORM_COLORS: Record<PlatformName, string> = {
  INSTAGRAM: "bg-pink-500",
  YOUTUBE: "bg-red-500",
  TIKTOK: "bg-black",
  TWITTER: "bg-sky-500",
  LINKEDIN: "bg-blue-700",
  PINTEREST: "bg-red-600",
};

interface PendingVerification {
  id: string;
  name: PlatformName;
  handle: string;
  followers: number;
  verificationCode: string | null;
  createdAt: string;
  influencer: {
    id: string;
    displayName: string;
    avatar: string | null;
    user: { email: string };
  };
}

export function AdminVerificationsPage() {
  const [items, setItems] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.get<PendingVerification[]>("/api/v1/admin/verifications")
      .then(setItems)
      .catch(() => toast.error("Failed to load verifications"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const act = async (id: string, action: "verify" | "fail") => {
    setActingId(id);
    try {
      await api.patch(`/api/v1/admin/platforms/${id}/${action}`, {});
      toast.success(action === "verify" ? "Platform verified!" : "Verification failed.");
      setItems((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActingId(null);
    }
  };

  const queueCount = items.length;

  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Admin</p>
        <div className="flex items-center justify-between">
          <h1 className="font-display font-extrabold text-[1.75rem] text-ink tracking-tight">Verifications</h1>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="btn-outline text-[12px] py-2 px-3.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border border-black/8 bg-black/[0.02]">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-[13px] font-semibold text-ink/70">
            {loading ? "Loading..." : queueCount === 0
              ? "No pending verifications — queue is clear."
              : `${queueCount} platform${queueCount > 1 ? "s" : ""} awaiting verification.`}
          </p>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-black/6 animate-pulse" />
          ))}
        </div>
      ) : queueCount === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-2xl border border-black/6"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="font-display font-bold text-[15px] text-ink mb-1">All clear!</p>
          <p className="text-[13px] text-ink-muted">No platforms are pending verification right now.</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-black/6 p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Platform icon */}
                  <div className={`w-10 h-10 rounded-xl ${PLATFORM_COLORS[item.name]} flex items-center justify-center shrink-0`}>
                    <span className="text-white text-[11px] font-black">{item.name.slice(0, 2)}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-[14px] font-bold text-ink">
                        {item.influencer.displayName}
                      </p>
                      <span className="text-ink-muted text-[13px]">·</span>
                      <p className="text-[13px] text-ink-muted">{item.name}</p>
                      <a
                        href={PLATFORM_URLS[item.name](item.handle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[12px] text-violet-600 hover:underline"
                      >
                        @{item.handle} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-[11px] text-ink-muted mb-3">
                      {item.influencer.user.email} · {item.followers.toLocaleString("en-IN")} followers ·
                      {" "}Submitted {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>

                    {item.verificationCode && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] font-semibold text-ink/50 uppercase tracking-wide">Code to find in bio:</span>
                        <code className="px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200 font-mono text-[13px] font-bold text-violet-700 tracking-widest">
                          {item.verificationCode}
                        </code>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => act(item.id, "verify")}
                        disabled={actingId === item.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-bold transition-colors disabled:opacity-60"
                      >
                        {actingId === item.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => act(item.id, "fail")}
                        disabled={actingId === item.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[12px] font-bold transition-colors disabled:opacity-60"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Fail
                      </button>
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 ml-1" />
                      <span className="text-[11px] text-ink-muted font-semibold">Check their bio before approving</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
