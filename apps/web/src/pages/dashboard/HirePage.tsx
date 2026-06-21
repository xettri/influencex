import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2, Send } from "lucide-react";
import { CreateDirectHireSchema } from "@influencex/shared";
import type { RateCard } from "@influencex/shared";
import { api } from "@/lib/api";
import { toast } from "@/store/toast";

interface InfluencerSummary {
  id: string;
  displayName: string;
  niche: string[];
  verified: boolean;
  followersCount: number;
  rateCard: RateCard | null;
  minRate: number | null;
}

export function HirePage() {
  const { influencerId } = useParams<{ influencerId: string }>();
  const navigate = useNavigate();

  const [influencer, setInfluencer] = useState<InfluencerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    deliverables: "",
    deadline: "",
    brandMessage: "",
  });

  useEffect(() => {
    if (!influencerId) return;
    api.get<InfluencerSummary>(`/api/v1/influencers/${influencerId}`)
      .then(setInfluencer)
      .catch(() => { toast.error("Creator not found"); navigate("/dashboard/influencers"); })
      .finally(() => setLoading(false));
  }, [influencerId, navigate]);

  const set = (key: keyof typeof form, val: string) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      influencerId: influencerId!,
      title: form.title,
      description: form.description,
      budget: Number(form.budget),
      deliverables: form.deliverables,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      brandMessage: form.brandMessage || undefined,
    };

    const result = CreateDirectHireSchema.safeParse(payload);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((err) => { const k = String(err.path[0] ?? ""); if (!errs[k]) errs[k] = err.message; });
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/v1/hires", payload);
      toast.success(`Hire request sent to ${influencer?.displayName}!`);
      navigate("/dashboard/hires");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send hire request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl space-y-4">
        <div className="h-24 rounded-2xl bg-white border border-black/6 animate-pulse" />
        <div className="h-96 rounded-2xl bg-white border border-black/6 animate-pulse" />
      </div>
    );
  }
  if (!influencer) return null;

  return (
    <div className="max-w-xl">
      <Link to={`/dashboard/influencers/${influencerId}`}
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted hover:text-ink mb-5 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to profile
      </Link>

      {/* Creator summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-black/6 p-5 mb-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[15px] font-extrabold shrink-0">
          {influencer.displayName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-[14px] text-ink">{influencer.displayName}</p>
            {influencer.verified && <CheckCircle2 className="w-3.5 h-3.5 text-violet-500" strokeWidth={2.5} />}
          </div>
          <p className="text-[12px] text-ink-muted">
            {influencer.niche.slice(0, 2).join(", ")}
            {influencer.minRate ? ` · from ₹${influencer.minRate.toLocaleString("en-IN")}` : ""}
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-black/6 p-6">
        <h2 className="font-display font-bold text-[15px] text-ink mb-5">Hire request details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: "title" as const, label: "Campaign title *", placeholder: "e.g. Summer product launch post" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">{label}</label>
              <input type="text" value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className="input-light text-[14px]" required />
              {errors[key] && <p className="text-[11px] text-red-500 mt-1">{errors[key]}</p>}
            </div>
          ))}

          <div>
            <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">Brief / Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the campaign, your brand, target audience, and what you're promoting..."
              rows={4}
              className="input-light text-[14px] resize-none leading-relaxed"
              required
            />
            {errors.description && <p className="text-[11px] text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">Budget (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted font-semibold">₹</span>
                <input type="number" min="1" value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="10000" className="input-light text-[14px] pl-7" required />
              </div>
              {errors.budget && <p className="text-[11px] text-red-500 mt-1">{errors.budget}</p>}
            </div>
            <div>
              <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className="input-light text-[14px]" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">Deliverables *</label>
            <textarea
              value={form.deliverables}
              onChange={(e) => set("deliverables", e.target.value)}
              placeholder="e.g. 1 Instagram reel (60s), 2 stories with product tag, 1 feed post..."
              rows={3}
              className="input-light text-[14px] resize-none"
              required
            />
            {errors.deliverables && <p className="text-[11px] text-red-500 mt-1">{errors.deliverables}</p>}
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">Personal message (optional)</label>
            <textarea
              value={form.brandMessage}
              onChange={(e) => set("brandMessage", e.target.value)}
              placeholder="Add a personal note to the creator..."
              rows={2}
              className="input-light text-[14px] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center text-[14px] py-3 disabled:opacity-60">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Hire Request</>}
            </button>
            <Link to={`/dashboard/influencers/${influencerId}`} className="btn-outline text-[14px] py-3 px-5">Cancel</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
