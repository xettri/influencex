import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, MapPin, Users, TrendingUp, IndianRupee, Briefcase } from "lucide-react";
import type { RateCard, PlatformName, VerificationStatus } from "@influencex/shared";
import { api } from "@/lib/api";
import { toast } from "@/store/toast";
import { useAuthStore } from "@/store/auth";
import { AuthenticityPanel } from "@/components/dashboard/AuthenticityPanel";

interface InfluencerDetail {
  id: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  niche: string[];
  location: string | null;
  followersCount: number;
  engagementRate: number;
  rateCard: RateCard | null;
  minRate: number | null;
  verified: boolean;
  authenticityScore: number;
  qualityFlags: string[];
  platforms: {
    id: string;
    name: PlatformName;
    handle: string;
    followers: number;
    verified: boolean;
    verificationStatus: VerificationStatus;
    verificationMethod: string | null;
    apiFollowerCount: number | null;
    apiEngagementRate: number | null;
  }[];
  _count: { applications: number; directHires: number };
}

const PLATFORM_META: Record<PlatformName, { label: string; color: string; bg: string }> = {
  INSTAGRAM: { label: "Instagram", color: "text-pink-600", bg: "bg-pink-50 border-pink-200" },
  YOUTUBE: { label: "YouTube", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  TIKTOK: { label: "TikTok", color: "text-gray-800", bg: "bg-gray-50 border-gray-200" },
  TWITTER: { label: "Twitter / X", color: "text-sky-600", bg: "bg-sky-50 border-sky-200" },
  LINKEDIN: { label: "LinkedIn", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  PINTEREST: { label: "Pinterest", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function InfluencerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isBrand = user?.role === "BRAND";

  const [profile, setProfile] = useState<InfluencerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get<InfluencerDetail>(`/api/v1/influencers/${id}`)
      .then(setProfile)
      .catch(() => { toast.error("Influencer not found"); navigate("/dashboard/influencers"); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="h-48 rounded-2xl bg-white border border-black/6 animate-pulse" />
        <div className="h-36 rounded-2xl bg-white border border-black/6 animate-pulse" />
        <div className="h-48 rounded-2xl bg-white border border-black/6 animate-pulse" />
      </div>
    );
  }
  if (!profile) return null;

  const initials = profile.displayName.slice(0, 2).toUpperCase();
  const rateItems = profile.rateCard
    ? [
        { label: "Per Post", value: profile.rateCard.perPost },
        { label: "Per Reel / Short", value: profile.rateCard.perReel },
        { label: "Per Long Video", value: profile.rateCard.perVideo },
        { label: "Per Story", value: profile.rateCard.perStory },
      ].filter((r) => r.value)
    : [];

  return (
    <div className="max-w-3xl">
      <Link to="/dashboard/influencers" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted hover:text-ink mb-5 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to creators
      </Link>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-black/6 p-6 mb-4">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[22px] font-extrabold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display font-extrabold text-[1.5rem] text-ink tracking-tight leading-tight">
                {profile.displayName}
              </h1>
              {profile.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            {profile.location && (
              <div className="flex items-center gap-1 text-ink-muted mb-2">
                <MapPin className="w-3 h-3" />
                <span className="text-[13px]">{profile.location}</span>
              </div>
            )}
            {profile.niche.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.niche.map((n) => (
                  <span key={n} className="px-2 py-0.5 rounded-md bg-violet-50 border border-violet-100 text-violet-700 text-[11px] font-bold">{n}</span>
                ))}
              </div>
            )}
          </div>

          {isBrand && (
            <Link to={`/dashboard/hire/${profile.id}`} className="btn-primary text-[13px] py-2.5 px-5 shrink-0">
              <Briefcase className="w-4 h-4" />
              Hire Now
            </Link>
          )}
        </div>

        {profile.bio && (
          <p className="text-[14px] text-ink-muted leading-relaxed mt-5 pt-5 border-t border-black/6">
            {profile.bio}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-black/6">
          {[
            { icon: Users, label: "Total Reach", value: formatFollowers(profile.followersCount) },
            { icon: TrendingUp, label: "Engagement", value: profile.engagementRate > 0 ? `${profile.engagementRate.toFixed(1)}%` : "—" },
            { icon: Briefcase, label: "Campaigns", value: String(profile._count.applications + profile._count.directHires) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center mx-auto mb-2">
                <Icon className="w-4 h-4 text-violet-500" strokeWidth={1.75} />
              </div>
              <p className="font-display font-extrabold text-[1.35rem] text-ink leading-none">{value}</p>
              <p className="text-[11px] text-ink-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Platforms */}
      {profile.platforms.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl border border-black/6 p-6 mb-4">
          <h2 className="font-display font-bold text-[15px] text-ink mb-4">Social platforms</h2>
          <div className="space-y-3">
            {profile.platforms.map((p) => {
              const meta = PLATFORM_META[p.name];
              return (
                <div key={p.id} className={`flex items-center gap-4 p-4 rounded-xl border ${meta.bg}`}>
                  <div className="flex-1">
                    <p className={`text-[13px] font-bold ${meta.color}`}>{meta.label}</p>
                    <p className="text-[12px] text-ink-muted">@{p.handle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-extrabold text-[1.1rem] text-ink">{formatFollowers(p.followers)}</p>
                    <p className="text-[11px] text-ink-muted">followers</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Rate card */}
      {rateItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="bg-white rounded-2xl border border-black/6 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-[15px] text-ink">Rate card</h2>
            <p className="text-[11px] text-ink-muted">Rates are negotiable</p>
          </div>
          <div className="divide-y divide-black/5">
            {rateItems.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-3">
                <p className="text-[13px] text-ink font-medium">{label}</p>
                <div className="flex items-center gap-0.5">
                  <IndianRupee className="w-3.5 h-3.5 text-ink" strokeWidth={2.5} />
                  <p className="font-display font-extrabold text-[1.05rem] text-ink">{value!.toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>

          {isBrand && (
            <div className="mt-4 pt-4 border-t border-black/6">
              <Link to={`/dashboard/hire/${profile.id}`} className="btn-primary w-full justify-center text-[14px] py-3">
                <Briefcase className="w-4 h-4" />
                Send Hire Request
              </Link>
            </div>
          )}
        </motion.div>
      )}

      {/* Authenticity report */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-black/6 p-6 mb-4">
        <h2 className="font-display font-bold text-[15px] text-ink mb-5">Authenticity report</h2>
        <AuthenticityPanel
          score={profile.authenticityScore}
          flags={profile.qualityFlags}
          platforms={profile.platforms.map((p) => ({
            name: p.name,
            handle: p.handle,
            verificationStatus: p.verificationStatus,
            verificationMethod: p.verificationMethod,
            followers: p.followers,
            apiFollowerCount: p.apiFollowerCount,
            apiEngagementRate: p.apiEngagementRate,
          }))}
        />
      </motion.div>
    </div>
  );
}
