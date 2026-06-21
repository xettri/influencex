import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, X, Loader2, Send } from "lucide-react";
import { CreateCampaignSchema } from "@influencex/shared";
import type { BudgetType, PlatformName } from "@influencex/shared";
import { api } from "@/lib/api";
import { toast } from "@/store/toast";

const PLATFORMS: { value: PlatformName; label: string }[] = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "TWITTER", label: "Twitter/X" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "PINTEREST", label: "Pinterest" },
];

const BUDGET_TYPES: { value: BudgetType; label: string; desc: string }[] = [
  { value: "FLAT_FEE", label: "Flat Fee", desc: "Fixed payment per deliverable" },
  { value: "CPA", label: "CPA", desc: "Pay per conversion / action" },
  { value: "MIXED", label: "Mixed", desc: "Flat fee + performance bonus" },
];

interface FormState {
  title: string;
  description: string;
  budget: string;
  budgetType: BudgetType;
  platforms: PlatformName[];
  minFollowers: string;
  niches: string[];
  regions: string[];
  startDate: string;
  endDate: string;
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-black/6 p-6">
      <div className="mb-5">
        <h3 className="font-display font-bold text-[15px] text-ink">{title}</h3>
        {subtitle && <p className="text-[12px] text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[11px] text-red-500 font-medium mt-1.5">{msg}</p>;
}

function TagInput({
  tags,
  input,
  onInputChange,
  onAdd,
  onRemove,
  placeholder,
}: {
  tags: string[];
  input: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (t: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 text-[12px] font-semibold"
            >
              {t}
              <button
                type="button"
                onClick={() => onRemove(t)}
                className="text-violet-400 hover:text-violet-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            onAdd();
          }
        }}
        placeholder={placeholder}
        className="input-light text-[14px]"
      />
      <p className="text-[11px] text-ink-muted mt-1">Press Enter or comma to add</p>
    </div>
  );
}

export function CreateCampaignPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nicheInput, setNicheInput] = useState("");
  const [regionInput, setRegionInput] = useState("");

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    budget: "",
    budgetType: "FLAT_FEE",
    platforms: [],
    minFollowers: "",
    niches: [],
    regions: [],
    startDate: "",
    endDate: "",
  });

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const togglePlatform = (p: PlatformName) => {
    set(
      "platforms",
      form.platforms.includes(p) ? form.platforms.filter((x) => x !== p) : [...form.platforms, p]
    );
  };

  const addTag = (field: "niches" | "regions", input: string, setInput: (v: string) => void) => {
    const trimmed = input.trim().replace(/,$/, "");
    if (trimmed && !form[field].includes(trimmed)) {
      set(field, [...form[field], trimmed]);
    }
    setInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      title: form.title,
      description: form.description,
      budget: Number(form.budget),
      budgetType: form.budgetType,
      criteria: {
        platforms: form.platforms.length > 0 ? form.platforms : undefined,
        minFollowers: form.minFollowers ? Number(form.minFollowers) : undefined,
        niches: form.niches.length > 0 ? form.niches : undefined,
        regions: form.regions.length > 0 ? form.regions : undefined,
      },
      startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
    };

    const result = CreateCampaignSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrs: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key = String(err.path[0] ?? "");
        if (!fieldErrs[key]) fieldErrs[key] = err.message;
      });
      setErrors(fieldErrs);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/api/v1/campaigns", payload);
      toast.success("Campaign created! It's now in draft — activate it from your dashboard.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-7"
      >
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted hover:text-ink transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
        </Link>
        <h1 className="font-display font-extrabold text-[1.75rem] text-ink tracking-tight">
          Create campaign
        </h1>
        <p className="text-[14px] text-ink-muted mt-1">
          Set up your campaign details and targeting criteria
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: Campaign Details */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <Section title="Campaign details">
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">
                  Campaign title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Summer fitness product launch"
                  className="input-light text-[14px]"
                  required
                />
                <FieldError msg={errors.title} />
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Tell creators what your campaign is about, what deliverables you expect, and what makes this collaboration exciting..."
                  rows={5}
                  className="input-light text-[14px] resize-none leading-relaxed"
                  required
                />
                <div className="flex items-center justify-between mt-1">
                  <FieldError msg={errors.description} />
                  <p className="text-[11px] text-ink-muted ml-auto">{form.description.length} / 2000</p>
                </div>
              </div>
            </div>
          </Section>
        </motion.div>

        {/* Section 2: Budget */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <Section title="Budget & compensation" subtitle="Creators see this before applying">
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">
                  Total budget (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-[14px] font-semibold">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={form.budget}
                    onChange={(e) => set("budget", e.target.value)}
                    placeholder="5000"
                    className="input-light text-[14px] pl-8"
                    required
                  />
                </div>
                <FieldError msg={errors.budget} />
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-2.5">
                  Compensation model
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BUDGET_TYPES.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set("budgetType", value)}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all duration-150 ${
                        form.budgetType === value
                          ? "border-violet-500 bg-violet-50"
                          : "border-black/8 hover:border-black/20 bg-white"
                      }`}
                    >
                      <p className={`text-[13px] font-bold mb-0.5 ${form.budgetType === value ? "text-violet-700" : "text-ink"}`}>
                        {label}
                      </p>
                      <p className="text-[10px] text-ink-muted leading-snug">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </motion.div>

        {/* Section 3: Targeting */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <Section title="Creator targeting" subtitle="Leave fields empty to stay open to all creators">
            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-2.5">
                  Platforms
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => togglePlatform(value)}
                      className={`px-3 py-1.5 rounded-xl border text-[12px] font-semibold transition-all duration-150 ${
                        form.platforms.includes(value)
                          ? "border-violet-500 bg-violet-50 text-violet-700"
                          : "border-black/10 bg-white text-ink-muted hover:border-black/25 hover:text-ink"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">
                  Minimum followers
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.minFollowers}
                  onChange={(e) => set("minFollowers", e.target.value)}
                  placeholder="e.g. 10000"
                  className="input-light text-[14px]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">
                  Niches / categories
                </label>
                <TagInput
                  tags={form.niches}
                  input={nicheInput}
                  onInputChange={setNicheInput}
                  onAdd={() => addTag("niches", nicheInput, setNicheInput)}
                  onRemove={(t) => set("niches", form.niches.filter((n) => n !== t))}
                  placeholder="e.g. fitness, wellness, nutrition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">
                  Target regions
                </label>
                <TagInput
                  tags={form.regions}
                  input={regionInput}
                  onInputChange={setRegionInput}
                  onAdd={() => addTag("regions", regionInput, setRegionInput)}
                  onRemove={(t) => set("regions", form.regions.filter((r) => r !== t))}
                  placeholder="e.g. Mumbai, Delhi, Pan India"
                />
              </div>
            </div>
          </Section>
        </motion.div>

        {/* Section 4: Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <Section title="Timeline" subtitle="Optional — leave empty for an open-ended campaign">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">
                  Start date
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                  className="input-light text-[14px]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">
                  End date
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                  min={form.startDate}
                  className="input-light text-[14px]"
                />
              </div>
            </div>
          </Section>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="flex items-center gap-3 pt-1 pb-8"
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary py-3 px-6 text-[14px] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Save as draft
              </>
            )}
          </button>
          <Link to="/dashboard" className="btn-outline py-3 px-5 text-[14px]">
            Cancel
          </Link>
        </motion.div>
      </form>
    </div>
  );
}
