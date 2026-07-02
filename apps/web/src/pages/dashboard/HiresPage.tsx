import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Loader2, Briefcase, Play, Package, Lock, Unlock, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import type { DirectHireStatus, Payment } from "@influencex/shared";
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
  influencer?: { id: string; displayName: string; avatar: string | null; verified: boolean; niche: string[] };
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

function LockPaymentForm({
  hireId,
  defaultAmount,
  onLocked,
  onCancel,
}: {
  hireId: string;
  defaultAmount: number;
  onLocked: (payment: Payment) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(String(defaultAmount));
  const [notes, setNotes] = useState("");
  const [locking, setLocking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) { toast.error("Enter a valid amount"); return; }
    setLocking(true);
    try {
      const payment = await api.post<Payment>("/api/v1/payments", {
        directHireId: hireId,
        amount: parsed,
        type: "FLAT_FEE",
        notes: notes || undefined,
      });
      toast.success(`₹${parsed.toLocaleString("en-IN")} locked in escrow`);
      onLocked(payment);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to lock payment");
    } finally {
      setLocking(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-black/5 space-y-3">
      <p className="text-[12px] font-bold text-ink">Lock payment into escrow</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-muted font-semibold">₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1}
            step={100}
            className="input-light text-[13px] pl-7 w-full"
            placeholder="Amount"
          />
        </div>
        <button
          type="submit"
          disabled={locking}
          className="btn-primary text-[13px] py-2.5 px-4 disabled:opacity-60 shrink-0"
        >
          {locking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Lock className="w-3.5 h-3.5" /> Lock</>}
        </button>
        <button type="button" onClick={onCancel} className="text-[12px] font-semibold text-ink-muted hover:text-ink transition-colors shrink-0">
          Cancel
        </button>
      </div>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="input-light text-[13px] w-full"
      />
    </form>
  );
}

export function HiresPage() {
  const { user } = useAuthStore();
  const isBrand = user?.role === "BRAND";

  const [hires, setHires] = useState<HireItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [paymentsByHireId, setPaymentsByHireId] = useState<Record<string, Payment>>({});
  const [showLockFormFor, setShowLockFormFor] = useState<string | null>(null);
  const [releasingId, setReleasingId] = useState<string | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const h = await api.get<HireItem[]>("/api/v1/hires/my");
        setHires(h);
        if (isBrand) {
          const payments = await api.get<Payment[]>("/api/v1/payments/sent").catch(() => []);
          const byHireId: Record<string, Payment> = {};
          for (const p of payments) {
            if (p.directHireId) byHireId[p.directHireId] = p;
          }
          setPaymentsByHireId(byHireId);
        }
      } catch {
        toast.error("Failed to load hire requests");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [isBrand]);

  const updateStatus = async (id: string, status: DirectHireStatus) => {
    setUpdatingId(id);
    try {
      await api.patch(`/api/v1/hires/${id}/status`, { status });
      setHires((prev) => prev.map((h) => h.id === id ? { ...h, status } : h));
      toast.success(`Request ${status.toLowerCase().replace(/_/g, " ")}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentLocked = (hireId: string, payment: Payment) => {
    setPaymentsByHireId((prev) => ({ ...prev, [hireId]: payment }));
    setShowLockFormFor(null);
  };

  const handleRelease = async (hireId: string) => {
    const payment = paymentsByHireId[hireId];
    if (!payment) return;
    setReleasingId(hireId);
    try {
      const updated = await api.patch<Payment>(`/api/v1/payments/${payment.id}/release`, {});
      setPaymentsByHireId((prev) => ({ ...prev, [hireId]: updated }));
      toast.success("Payment released to creator");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to release payment");
    } finally {
      setReleasingId(null);
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
            const payment = paymentsByHireId[hire.id];
            const canLock = isBrand && ["ACCEPTED", "IN_PROGRESS"].includes(hire.status) && !payment;
            const canRelease = isBrand && payment?.status === "LOCKED";
            const showingLockForm = showLockFormFor === hire.id;

            return (
              <motion.div
                key={hire.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-black/6 p-5"
              >
                <div className="flex items-start gap-4">
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
                      {/* Payment status badge */}
                      {payment && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ml-auto ${
                          payment.status === "RELEASED"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : payment.status === "LOCKED"
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : payment.status === "DISPUTED"
                            ? "bg-red-50 border-red-200 text-red-600"
                            : "bg-amber-50 border-amber-200 text-amber-700"
                        }`}>
                          <IndianRupee className="w-2.5 h-2.5" />
                          {payment.status === "LOCKED" ? "In Escrow" : payment.status === "RELEASED" ? "Released" : payment.status}
                          {" "}₹{payment.amount.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Creator actions */}
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

                {/* Brand: cancel pending */}
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

                {/* Brand: lock payment for accepted/in-progress hires */}
                {(canLock || canRelease || (isBrand && payment?.status === "RELEASED")) && (
                  <div className="mt-4 pt-4 border-t border-black/5">
                    {canLock && !showingLockForm && (
                      <button
                        onClick={() => setShowLockFormFor(hire.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[12px] font-bold hover:bg-blue-100 transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" /> Lock Payment into Escrow
                      </button>
                    )}
                    {canLock && showingLockForm && (
                      <LockPaymentForm
                        hireId={hire.id}
                        defaultAmount={hire.budget}
                        onLocked={(payment) => handlePaymentLocked(hire.id, payment)}
                        onCancel={() => setShowLockFormFor(null)}
                      />
                    )}
                    {canRelease && (
                      <button
                        onClick={() => handleRelease(hire.id)}
                        disabled={releasingId === hire.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12px] font-bold hover:bg-emerald-100 transition-colors disabled:opacity-60"
                      >
                        {releasingId === hire.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Unlock className="w-3.5 h-3.5" /> Release Payment to Creator</>}
                      </button>
                    )}
                    {isBrand && payment?.status === "RELEASED" && (
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Payment of ₹{payment.amount.toLocaleString("en-IN")} released
                      </div>
                    )}
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
