import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IndianRupee, Lock, CheckCircle2, AlertCircle, Clock, TrendingUp } from "lucide-react";
import type { Payment, PaymentStatus } from "@influencex/shared";
import { api } from "@/lib/api";
import { toast } from "@/store/toast";

function fmtRupee(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; icon: typeof Clock; chip: string }> = {
  PENDING: { label: "Pending", icon: Clock, chip: "bg-amber-50 border-amber-200 text-amber-700" },
  LOCKED: { label: "In Escrow", icon: Lock, chip: "bg-blue-50 border-blue-200 text-blue-700" },
  RELEASED: { label: "Released", icon: CheckCircle2, chip: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  DISPUTED: { label: "Disputed", icon: AlertCircle, chip: "bg-red-50 border-red-200 text-red-600" },
  REFUNDED: { label: "Refunded", icon: AlertCircle, chip: "bg-slate-50 border-slate-200 text-slate-600" },
};

function StatCard({
  label,
  value,
  sub,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: "emerald" | "blue" | "violet" | "amber";
  icon: React.ElementType;
}) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-black/6 p-5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colors[accent]}`}>
        <Icon className="w-4 h-4" strokeWidth={1.75} />
      </div>
      <p className="text-[10px] font-semibold text-ink/50 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="font-display font-extrabold text-[1.5rem] text-ink leading-none">{value}</p>
      {sub && <p className="text-[11px] text-ink-muted mt-1">{sub}</p>}
    </div>
  );
}

export function EarningsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Payment[]>("/api/v1/payments/my")
      .then(setPayments)
      .catch(() => toast.error("Failed to load earnings"))
      .finally(() => setLoading(false));
  }, []);

  const totalReleased = payments.filter((p) => p.status === "RELEASED").reduce((s, p) => s + p.amount, 0);
  const inEscrow = payments.filter((p) => p.status === "LOCKED").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);
  const totalEarned = totalReleased + inEscrow;

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-2xl bg-white border border-black/6 animate-pulse" />)}
        </div>
        {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-white border border-black/6 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Creator</p>
        <h1 className="font-display font-extrabold text-[1.75rem] text-ink tracking-tight">Earnings</h1>
      </motion.div>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
      >
        <StatCard icon={TrendingUp} label="Total Earned" value={fmtRupee(totalEarned)} sub="Released + escrow" accent="violet" />
        <StatCard icon={CheckCircle2} label="Released" value={fmtRupee(totalReleased)} sub={`${payments.filter((p) => p.status === "RELEASED").length} payment${payments.filter((p) => p.status === "RELEASED").length !== 1 ? "s" : ""}`} accent="emerald" />
        <StatCard icon={Lock} label="In Escrow" value={fmtRupee(inEscrow)} sub="Awaiting release" accent="blue" />
        <StatCard icon={Clock} label="Pending" value={fmtRupee(totalPending)} sub="Not yet locked" accent="amber" />
      </motion.div>

      {/* Payment list */}
      {payments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-black/6 py-20 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <IndianRupee className="w-6 h-6 text-violet-400" strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-ink text-[14px] mb-1">No payments yet</p>
          <p className="text-[13px] text-ink-muted max-w-xs mx-auto">
            Once a brand locks payment for your collaboration, it will appear here in escrow.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment, i) => {
            const config = STATUS_CONFIG[payment.status];
            const Icon = config.icon;
            const title = payment.campaign?.title ?? payment.directHire?.title ?? "Direct collaboration";
            const brandName = payment.campaign?.brand?.name ?? "Brand";

            return (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-black/6 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[11px] font-extrabold shrink-0">
                      {brandName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-ink leading-snug truncate">{title}</p>
                      <p className="text-[11px] text-ink-muted">{brandName}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-display font-extrabold text-[1.1rem] text-ink leading-none mb-1">
                      {fmtRupee(payment.amount)}
                    </p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${config.chip}`}>
                      <Icon className="w-2.5 h-2.5" strokeWidth={2.5} />
                      {config.label}
                    </span>
                  </div>
                </div>

                {(payment.notes || payment.lockedAt || payment.releasedAt) && (
                  <div className="mt-3 pt-3 border-t border-black/5 flex items-center gap-4 text-[11px] text-ink-muted flex-wrap">
                    {payment.type && (
                      <span className="font-medium">{payment.type.replace(/_/g, " ")}</span>
                    )}
                    {payment.lockedAt && (
                      <span>Locked {new Date(payment.lockedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    )}
                    {payment.releasedAt && (
                      <span className="text-emerald-600 font-semibold">
                        Released {new Date(payment.releasedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                    {payment.notes && <span className="italic">"{payment.notes}"</span>}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* How escrow works */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 rounded-2xl border border-black/6 bg-gradient-to-br from-violet-50/60 to-indigo-50/60 p-5"
      >
        <p className="text-[12px] font-black text-ink/60 uppercase tracking-wide mb-3">How escrow works</p>
        <div className="space-y-2">
          {[
            { step: "1", text: "Brand approves your application or accepts your hire, then locks the agreed payment into escrow." },
            { step: "2", text: "You create and submit the content. The funds are held safely during this period." },
            { step: "3", text: "Once the brand reviews and approves your work, they release the payment to you." },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-black text-violet-600 shrink-0 mt-0.5">
                {step}
              </div>
              <p className="text-[12px] text-ink-muted leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
