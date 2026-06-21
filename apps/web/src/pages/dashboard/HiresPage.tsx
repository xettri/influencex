import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Loader2, Briefcase, Play, Package } from "lucide-react";
import { Link } from "react-router-dom";
import type { DirectHireStatus } from "@influencex/shared";
import { api } from "@/lib/api";
import { toast } from "@/store/toast";
import { useAuthStore } from "@/store/auth";

interface HireItem {
  id: string;
  title: string;
  description: string;
  budget: number;
  deliverables: string;
  deadline: string | null;
  status: DirectHireStatus;
  brandMessage: string | null;
  createdAt: string;
  // brand side: influencer info
  influencer?: { id: string; displayName: string; avatar: string | null; verified: boolean; niche: string[] };
  // creator side: brand info
  brand?: { id: string; name: string; logo: string | null; verified: boolean; industry: string | null };
}

const STATUS_CONFIG: Record<DirectHireStatus, { label: string; icon: typeof Clock; classes: string }> = {
  PENDING: { label: "Pending", icon: Clock, classes: "bg-amber-50 border-amber-200 text-amber-700" },
  ACCEPTED: { label: "Accepted", icon: CheckCircle2, classes: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  IN_PROGRESS: { label: "In Progress", icon: Play, classes: "bg-blue-50 border-blue-200 text-blue-700" },
  COMPLETED: { label: "Completed", icon: Package, classes: "bg-violet-50 border-violet-200 text-violet-700" },
  DECLINED: { label: "Declined", icon: XCircle, classes: "bg-red-50 border-red-200 text-red-600" },
  CANCELLED: { label: "Cancelled", icon: XCircle, classes: "bg-slate-50 border-slate-200 text-slate-600" },
};

export function HiresPage() {
  const { user } = useAuthStore();
  const isBrand = user?.role === "BRAND";

  const [hires, setHires] = useState<HireItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    api.get<HireItem[]>("/api/v1/hires/my")
      .then(setHires)
      .catch(() => toast.error("Failed to load hire requests"))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: DirectHireStatus) => {
    setUpdatingId(id);
    try {
      await api.patch(`/api/v1/hires/${id}/status`, { status });
      setHires((prev) => prev.map((h) => h.id === id ? { ...h, status } : h));
      toast.success(`Request ${status.toLowerCase().replace("_", " ")}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl bg-white border border-black/6 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-widest mb-1">
          {isBrand ? "Brands" : "Creators"}
        </p>
        <div className="flex items-center justify-between">
          <h1 className="font-display font-extrabold text-[1.75rem] text-ink tracking-tight">
            {isBrand ? "Hire Requests Sent" : "Hire Requests Received"}
          </h1>
          {isBrand && (
            <Link to="/dashboard/influencers" className="btn-primary text-[13px] py-2.5 px-4">
              <Briefcase className="w-4 h-4" /> Find Creators
            </Link>
          )}
        </div>
      </motion.div>

      {hires.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/6 py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-6 h-6 text-violet-400" strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-ink text-[14px] mb-1">
            {isBrand ? "No hire requests yet" : "No requests received yet"}
          </p>
          <p className="text-[13px] text-ink-muted mb-5">
            {isBrand ? "Browse creators and send your first hire request" : "Complete your profile to start receiving requests from brands"}
          </p>
          <Link
            to={isBrand ? "/dashboard/influencers" : "/dashboard/profile"}
            className="btn-primary text-[13px] py-2.5 px-5"
          >
            {isBrand ? "Browse Creators" : "Complete Profile"}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {hires.map((hire, i) => {
            const config = STATUS_CONFIG[hire.status];
            const Icon = config.icon;
            const counterpart = isBrand ? hire.influencer : hire.brand;
            const counterpartName = isBrand ? hire.influencer?.displayName : hire.brand?.name;

            return (
              <motion.div
                key={hire.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-black/6 p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[11px] font-extrabold shrink-0">
                    {(counterpartName ?? "?").slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <p className="text-[13px] font-bold text-ink leading-snug">{hire.title}</p>
                        <p className="text-[12px] text-ink-muted">
                          {isBrand ? "To" : "From"}{" "}
                          <span className="font-semibold">{counterpartName}</span>
                          {counterpart && "verified" in counterpart && counterpart.verified && (
                            <CheckCircle2 className="w-3 h-3 text-violet-500 inline ml-1" strokeWidth={2.5} />
                          )}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold shrink-0 ${config.classes}`}>
                        <Icon className="w-3 h-3" strokeWidth={2} />
                        {config.label}
                      </span>
                    </div>

                    <p className="text-[12px] text-ink-muted line-clamp-1 mb-2">{hire.deliverables}</p>

                    <div className="flex items-center gap-3 text-[12px]">
                      <span className="font-semibold text-ink">₹{hire.budget.toLocaleString("en-IN")}</span>
                      {hire.deadline && (
                        <span className="text-ink-muted">
                          · Due {new Date(hire.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {hire.status === "PENDING" && !isBrand && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-black/5">
                    <button
                      onClick={() => updateStatus(hire.id, "ACCEPTED")}
                      disabled={updatingId === hire.id}
                      className="btn-primary flex-1 justify-center text-[13px] py-2.5 disabled:opacity-60"
                    >
                      {updatingId === hire.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle2 className="w-3.5 h-3.5" /> Accept</>}
                    </button>
                    <button
                      onClick={() => updateStatus(hire.id, "DECLINED")}
                      disabled={updatingId === hire.id}
                      className="btn-outline flex-1 justify-center text-[13px] py-2.5 text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-60"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                )}
                {hire.status === "ACCEPTED" && !isBrand && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-black/5">
                    <button
                      onClick={() => updateStatus(hire.id, "IN_PROGRESS")}
                      disabled={updatingId === hire.id}
                      className="btn-primary text-[13px] py-2.5 px-4 disabled:opacity-60"
                    >
                      {updatingId === hire.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Play className="w-3.5 h-3.5" /> Mark In Progress</>}
                    </button>
                  </div>
                )}
                {hire.status === "PENDING" && isBrand && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-black/5">
                    <button
                      onClick={() => updateStatus(hire.id, "CANCELLED")}
                      disabled={updatingId === hire.id}
                      className="text-[12px] text-ink-muted hover:text-red-600 font-semibold transition-colors disabled:opacity-60"
                    >
                      {updatingId === hire.id ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : "Cancel request"}
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
