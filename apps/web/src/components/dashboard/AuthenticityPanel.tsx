import { CheckCircle2, XCircle, Clock, AlertTriangle, Shield, Zap, Info } from "lucide-react";
import type { PlatformName, VerificationStatus } from "@influencex/shared";

interface PlatformRow {
  name: PlatformName;
  handle: string;
  verificationStatus: VerificationStatus;
  verificationMethod: string | null;
  followers: number;
  apiFollowerCount: number | null;
  apiEngagementRate: number | null;
}

interface Props {
  score: number;
  flags: string[];
  platforms: PlatformRow[];
  isOwner?: boolean;
}

const FLAG_META: Record<string, { label: string; description: string; severity: "warn" | "danger" | "info" }> = {
  UNVERIFIED_HANDLES: {
    label: "Handles unverified",
    description: "No social platforms have been verified yet. Brands rely on verification to confirm account ownership.",
    severity: "warn",
  },
  LOW_ENGAGEMENT: {
    label: "Low engagement rate",
    description: "Engagement is below industry benchmarks for this follower tier, which may indicate purchased followers.",
    severity: "danger",
  },
  ENGAGEMENT_PODS: {
    label: "Unusually high engagement",
    description: "Engagement rate exceeds 20%, which can indicate engagement pods or paid interaction networks.",
    severity: "warn",
  },
  STATS_MISMATCH: {
    label: "Follower count mismatch",
    description: "The claimed follower count differs significantly from the actual API-verified count (>30% variance).",
    severity: "danger",
  },
  SELF_REPORTED_ONLY: {
    label: "Self-reported data",
    description: "All profile data is self-reported. No platform API has been used to verify follower or engagement data.",
    severity: "info",
  },
  NO_PLATFORMS: {
    label: "No platforms connected",
    description: "No social platforms are linked to this profile.",
    severity: "warn",
  },
};

const OWNER_TIPS: Record<string, string> = {
  UNVERIFIED_HANDLES: "Click 'Request Verification' on each platform to start the review process.",
  LOW_ENGAGEMENT: "Focus on genuine audience interaction — reply to comments, post consistently, and avoid engagement bots.",
  ENGAGEMENT_PODS: "High engagement pods can look suspicious. Ensure interactions come from real, organic audience activity.",
  STATS_MISMATCH: "Make sure your claimed follower count matches what's actually on your profile page.",
  SELF_REPORTED_ONLY: "Verify your YouTube channel to get an automatic API-verified score boost.",
  NO_PLATFORMS: "Add and verify your social platforms to build trust with brands.",
};

const VERIF_STATUS_META: Record<VerificationStatus, { icon: React.ReactNode; label: string; color: string }> = {
  VERIFIED: {
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: "Verified",
    color: "text-emerald-600",
  },
  PENDING: {
    icon: <Clock className="w-3.5 h-3.5" />,
    label: "Pending",
    color: "text-amber-600",
  },
  UNVERIFIED: {
    icon: <XCircle className="w-3.5 h-3.5" />,
    label: "Unverified",
    color: "text-ink/30",
  },
  FAILED: {
    icon: <XCircle className="w-3.5 h-3.5" />,
    label: "Failed",
    color: "text-red-500",
  },
};

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function ScoreRing({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";
  const label =
    score >= 80 ? "High trust" : score >= 60 ? "Good trust" : score >= 40 ? "Fair trust" : "Low trust";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="text-center -mt-[88px] mb-[72px]">
        <p className="font-display font-extrabold text-[1.5rem] text-ink leading-none">{score}</p>
        <p className="text-[10px] text-ink-muted font-semibold">/100</p>
      </div>
      <p className="text-[11px] font-bold" style={{ color }}>{label}</p>
    </div>
  );
}

export function AuthenticityPanel({ score, flags, platforms, isOwner = false }: Props) {
  return (
    <div className="space-y-4">
      {/* Score + flags */}
      <div className="flex items-start gap-6">
        <div className="shrink-0">
          <ScoreRing score={score} />
        </div>

        <div className="flex-1 min-w-0 pt-2">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-violet-500" strokeWidth={1.75} />
            <p className="text-[13px] font-bold text-ink">Authenticity Score</p>
          </div>

          {flags.length === 0 ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <p className="text-[12px] text-emerald-700 font-semibold">No quality issues detected</p>
            </div>
          ) : (
            <div className="space-y-2">
              {flags.map((flag) => {
                const meta = FLAG_META[flag];
                if (!meta) return null;
                const Icon = meta.severity === "danger" ? AlertTriangle : meta.severity === "warn" ? AlertTriangle : Info;
                const colors = meta.severity === "danger"
                  ? "bg-red-50 border-red-100 text-red-700"
                  : meta.severity === "warn"
                  ? "bg-amber-50 border-amber-100 text-amber-700"
                  : "bg-blue-50 border-blue-100 text-blue-700";
                return (
                  <div key={flag} className={`px-3 py-2 rounded-xl border ${colors}`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <p className="text-[11px] font-bold">{meta.label}</p>
                    </div>
                    <p className="text-[11px] opacity-80 leading-snug">{meta.description}</p>
                    {isOwner && OWNER_TIPS[flag] && (
                      <p className="text-[10px] font-semibold mt-1 opacity-70">
                        Tip: {OWNER_TIPS[flag]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Platform breakdown */}
      {platforms.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wide mb-2">Platform verification</p>
          <div className="divide-y divide-black/5 rounded-xl border border-black/6 overflow-hidden">
            {platforms.map((p) => {
              const statusMeta = VERIF_STATUS_META[p.verificationStatus];
              const isAutoApi = p.verificationMethod === "AUTO_API";
              return (
                <div key={`${p.name}-${p.handle}`} className="flex items-center gap-3 px-4 py-3 bg-white">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-ink">{p.name}</p>
                    <p className="text-[11px] text-ink-muted">@{p.handle}</p>
                  </div>

                  {/* API data if available */}
                  {isAutoApi && p.apiFollowerCount != null && (
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-1 justify-end">
                        <Zap className="w-3 h-3 text-violet-400" />
                        <p className="text-[11px] font-bold text-ink">{formatFollowers(p.apiFollowerCount)}</p>
                      </div>
                      {p.apiEngagementRate != null && (
                        <p className="text-[10px] text-ink-muted">{p.apiEngagementRate.toFixed(1)}% eng.</p>
                      )}
                    </div>
                  )}

                  <div className={`flex items-center gap-1 text-[11px] font-semibold ${statusMeta.color}`}>
                    {statusMeta.icon}
                    <span>{statusMeta.label}</span>
                    {isAutoApi && (
                      <span className="ml-1 px-1.5 py-0.5 rounded bg-violet-50 border border-violet-100 text-violet-600 text-[9px] font-black uppercase tracking-wide">
                        API
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
