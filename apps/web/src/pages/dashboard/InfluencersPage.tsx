import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, CheckCircle2, ChevronLeft, ChevronRight, IndianRupee, Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { PaginatedResponse, PlatformName } from "@influencex/shared";
import { api } from "@/lib/api";
import { toast } from "@/store/toast";
import { useAuthStore } from "@/store/auth";
import { AuthenticityBadge } from "@/components/dashboard/AuthenticityBadge";

interface DirectoryInfluencer {
  id: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  niche: string[];
  location: string | null;
  followersCount: number;
  engagementRate: number;
  minRate: number | null;
  rateCard: Record<string, number> | null;
  verified: boolean;
  authenticityScore: number;
  qualityFlags: string[];
  platforms: { id: string; name: PlatformName; handle: string; followers: number }[];
}

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: "bg-pink-500",
  YOUTUBE: "bg-red-500",
  TIKTOK: "bg-black",
  TWITTER: "bg-sky-500",
  LINKEDIN: "bg-blue-700",
  PINTEREST: "bg-red-600",
};

const FOLLOWER_RANGES = [
  { label: "All", min: "", max: "" },
  { label: "1K–10K", min: "1000", max: "10000" },
  { label: "10K–100K", min: "10000", max: "100000" },
  { label: "100K+", min: "100000", max: "" },
];

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function InfluencerCard({ influencer }: { influencer: DirectoryInfluencer }) {
  const topPlatform = [...influencer.platforms].sort((a, b) => b.followers - a.followers)[0];
  const initials = influencer.displayName.slice(0, 2).toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-black/6 p-5 flex flex-col gap-4 hover:shadow-[0_8px_32px_-4px_rgba(109,40,217,0.12)] hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Avatar + name */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[15px] font-extrabold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[14px] font-bold text-ink leading-tight truncate">{influencer.displayName}</p>
            {influencer.verified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 shrink-0" strokeWidth={2.5} />
            )}
          </div>
          {influencer.authenticityScore > 0 && (
            <div className="mt-1">
              <AuthenticityBadge score={influencer.authenticityScore} showLabel />
            </div>
          )}
          {influencer.location && (
            <p className="text-[11px] text-ink-muted mt-0.5">{influencer.location}</p>
          )}
        </div>
      </div>

      {/* Niches */}
      {influencer.niche.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {influencer.niche.slice(0, 3).map((n) => (
            <span key={n} className="px-2 py-0.5 rounded-md bg-violet-50 border border-violet-100 text-violet-700 text-[10px] font-bold">
              {n}
            </span>
          ))}
          {influencer.niche.length > 3 && (
            <span className="px-2 py-0.5 rounded-md bg-black/4 text-ink-muted text-[10px] font-semibold">
              +{influencer.niche.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Platform badges */}
      {influencer.platforms.length > 0 && (
        <div className="flex items-center gap-1.5">
          {influencer.platforms.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg ${PLATFORM_COLORS[p.name] ?? "bg-gray-500"}`}
              title={`@${p.handle}`}
            >
              <span className="text-white text-[9px] font-black">{p.name.slice(0, 2)}</span>
            </div>
          ))}
          {topPlatform && (
            <span className="text-[11px] text-ink-muted ml-1 font-semibold">
              {formatFollowers(topPlatform.followers)} on {topPlatform.name.charAt(0) + topPlatform.name.slice(1).toLowerCase()}
            </span>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 pt-1 border-t border-black/5">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-ink-muted" />
          <span className="text-[12px] font-semibold text-ink">{formatFollowers(influencer.followersCount)}</span>
          <span className="text-[11px] text-ink-muted">total</span>
        </div>
        {influencer.minRate && (
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[11px] text-ink-muted">from</span>
            <IndianRupee className="w-3 h-3 text-ink" strokeWidth={2.5} />
            <span className="text-[13px] font-bold text-ink">{influencer.minRate.toLocaleString("en-IN")}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          to={`/dashboard/influencers/${influencer.id}`}
          className="flex-1 btn-outline py-2 px-3 text-[12px] justify-center"
        >
          View Profile
        </Link>
        <Link
          to={`/dashboard/hire/${influencer.id}`}
          className="flex-1 btn-primary py-2 px-3 text-[12px] justify-center"
        >
          Hire
        </Link>
      </div>
    </motion.div>
  );
}

export function InfluencersPage() {
  const { user } = useAuthStore();
  const isBrand = user?.role === "BRAND";

  const [influencers, setInfluencers] = useState<DirectoryInfluencer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [followerRange, setFollowerRange] = useState({ min: "", max: "" });

  const LIMIT = 12;
  const totalPages = Math.ceil(total / LIMIT);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, followerRange]);

  const fetchInfluencers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (followerRange.min) params.set("minFollowers", followerRange.min);
      if (followerRange.max) params.set("maxFollowers", followerRange.max);

      const data = await api.get<PaginatedResponse<DirectoryInfluencer>>(`/api/v1/influencers?${params}`);
      setInfluencers(data.items);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load creators");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, followerRange]);

  useEffect(() => { fetchInfluencers(); }, [fetchInfluencers]);

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Creator Directory</p>
        <h1 className="font-display font-extrabold text-[1.75rem] text-ink tracking-tight">Find creators</h1>
        <p className="text-[14px] text-ink-muted mt-1">
          Browse {total > 0 ? total.toLocaleString("en-IN") : ""} verified creators on InfluenceX
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creators..."
            className="input-light pl-10 text-[14px] w-full"
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {FOLLOWER_RANGES.map(({ label, min, max }) => (
            <button
              key={label}
              onClick={() => setFollowerRange({ min, max })}
              className={`px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                followerRange.min === min && followerRange.max === max
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white border border-black/10 text-ink-muted hover:text-ink hover:border-black/25"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-white border border-black/6 animate-pulse" />
          ))}
        </div>
      ) : influencers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/6 py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-violet-400" strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-ink text-[14px] mb-1">No creators found</p>
          <p className="text-[13px] text-ink-muted">
            {search || followerRange.min ? "Try adjusting your filters" : "Creators are being verified — check back soon"}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${page}-${debouncedSearch}-${followerRange.min}-${followerRange.max}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {influencers.map((inf) => <InfluencerCard key={inf.id} influencer={inf} />)}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-black/6">
          <p className="text-[12px] text-ink-muted">{total} creators · Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-black/10 bg-white text-ink-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i;
              if (p > totalPages) return null;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-semibold transition-all ${p === page ? "bg-violet-600 text-white" : "border border-black/10 bg-white text-ink-muted hover:text-ink"}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-black/10 bg-white text-ink-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Non-brand banner */}
      {!isBrand && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-6 p-4 rounded-2xl bg-violet-50 border border-violet-200 text-center">
          <p className="text-[13px] font-semibold text-violet-700">You're viewing the creator directory as a creator. Only brands can hire.</p>
        </motion.div>
      )}
    </div>
  );
}
