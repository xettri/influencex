import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Megaphone, IndianRupee } from "lucide-react";
import type { PaginatedResponse, BudgetType } from "@influencex/shared";
import { api, ApiError } from "@/lib/api";
import { toast } from "@/store/toast";
import { useAuthStore } from "@/store/auth";

interface APICampaign {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: BudgetType;
  status: string;
  criteria: {
    platforms?: string[];
    minFollowers?: number;
    niches?: string[];
    regions?: string[];
  };
  createdAt: string;
  brand: { name: string; logo: string | null; industry: string | null; verified: boolean };
  _count: { applications: number };
}

const BUDGET_LABELS: Record<BudgetType, string> = {
  FLAT_FEE: "Flat Fee",
  CPA: "CPA",
  MIXED: "Mixed",
};

const FILTER_BUDGET: { value: "" | BudgetType; label: string }[] = [
  { value: "", label: "All types" },
  { value: "FLAT_FEE", label: "Flat Fee" },
  { value: "CPA", label: "CPA" },
  { value: "MIXED", label: "Mixed" },
];

function CampaignCard({
  campaign,
  onApply,
  applied,
  applying,
  isBrand,
}: {
  campaign: APICampaign;
  onApply: (id: string) => void;
  applied: boolean;
  applying: boolean;
  isBrand: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-white-hover p-5 flex flex-col gap-4"
    >
      {/* Brand + meta */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wide truncate">
              {campaign.brand.name}
            </span>
            {campaign.brand.verified && (
              <CheckCircle2 className="w-3 h-3 text-violet-500 shrink-0" strokeWidth={2.5} />
            )}
          </div>
          <h3 className="text-[14px] font-bold text-ink leading-snug">{campaign.title}</h3>
        </div>
        <div className="shrink-0 text-right">
          <div className="flex items-center gap-0.5 justify-end text-ink font-extrabold text-[1.05rem] font-display">
            <IndianRupee className="w-3.5 h-3.5" strokeWidth={2.5} />
            {campaign.budget.toLocaleString("en-IN")}
          </div>
          <p className="text-[10px] text-ink-muted">{BUDGET_LABELS[campaign.budgetType]}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-[13px] text-ink-muted leading-relaxed line-clamp-2">{campaign.description}</p>

      {/* Chips */}
      <div className="flex flex-wrap gap-1.5">
        {campaign.criteria.platforms?.slice(0, 3).map((p) => (
          <span key={p} className="px-2 py-0.5 rounded-md bg-violet-50 border border-violet-100 text-violet-700 text-[10px] font-bold">
            {p}
          </span>
        ))}
        {campaign.criteria.niches?.slice(0, 2).map((n) => (
          <span key={n} className="px-2 py-0.5 rounded-md bg-black/4 text-ink-muted text-[10px] font-semibold">
            {n}
          </span>
        ))}
        {campaign.criteria.minFollowers && (
          <span className="px-2 py-0.5 rounded-md bg-black/4 text-ink-muted text-[10px] font-semibold">
            {campaign.criteria.minFollowers.toLocaleString("en-IN")}+ followers
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-0.5 border-t border-black/4">
        <span className="text-[11px] text-ink-muted">
          {campaign._count.applications} applicant{campaign._count.applications !== 1 ? "s" : ""}
        </span>
        {!isBrand && (
          <button
            onClick={() => onApply(campaign.id)}
            disabled={applied || applying}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
              applied
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-default"
                : "btn-primary py-1.5 px-3.5 text-[12px] disabled:opacity-60"
            }`}
          >
            {applying ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : applied ? (
              <>
                <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} /> Applied
              </>
            ) : (
              "Apply Now"
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function ExplorePage() {
  const { user } = useAuthStore();
  const isBrand = user?.role === "BRAND";

  const [campaigns, setCampaigns] = useState<APICampaign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [budgetFilter, setBudgetFilter] = useState<"" | BudgetType>("");
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  const LIMIT = 12;
  const totalPages = Math.ceil(total / LIMIT);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (budgetFilter) params.set("budgetType", budgetFilter);

      const data = await api.get<PaginatedResponse<APICampaign>>(`/api/v1/campaigns?${params}`);
      setCampaigns(data.items);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, budgetFilter]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, budgetFilter]);

  const handleApply = async (campaignId: string) => {
    if (applying || applied.has(campaignId)) return;
    setApplying(campaignId);
    try {
      await api.post(`/api/v1/campaigns/${campaignId}/apply`, {});
      setApplied((s) => new Set(s).add(campaignId));
      toast.success("Application submitted! The brand will review it shortly.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setApplied((s) => new Set(s).add(campaignId));
        toast.info("You've already applied to this campaign");
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to apply");
      }
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-widest mb-1">
          {isBrand ? "All Campaigns" : "Browse Campaigns"}
        </p>
        <h1 className="font-display font-extrabold text-[1.75rem] text-ink tracking-tight">
          {isBrand ? "Active campaigns" : "Find campaigns to join"}
        </h1>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="input-light pl-10 text-[14px] w-full"
          />
        </div>

        {/* Budget filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          {FILTER_BUDGET.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setBudgetFilter(value)}
              className={`px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                budgetFilter === value
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white border border-black/10 text-ink-muted hover:text-ink hover:border-black/25"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Campaign grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-white border border-black/6 animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/6 py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-6 h-6 text-violet-400" strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-ink text-[14px] mb-1">No campaigns found</p>
          <p className="text-[13px] text-ink-muted">
            {search || budgetFilter ? "Try adjusting your filters" : "Check back soon — brands are joining daily"}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${page}-${debouncedSearch}-${budgetFilter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onApply={handleApply}
                applied={applied.has(campaign.id)}
                applying={applying === campaign.id}
                isBrand={isBrand}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mt-6 pt-5 border-t border-black/6"
        >
          <p className="text-[12px] text-ink-muted">
            {total} campaign{total !== 1 ? "s" : ""} · Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-black/10 bg-white text-ink-muted hover:text-ink hover:border-black/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-semibold transition-all ${
                    p === page
                      ? "bg-violet-600 text-white shadow-sm"
                      : "border border-black/10 bg-white text-ink-muted hover:text-ink hover:border-black/25"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-black/10 bg-white text-ink-muted hover:text-ink hover:border-black/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
