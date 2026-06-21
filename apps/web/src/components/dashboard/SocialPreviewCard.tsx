import { ExternalLink, Loader2, AlertCircle, Youtube, Key } from "lucide-react";
import type { SocialPreviewData } from "@/hooks/useSocialPreview";
import type { PlatformName } from "@influencex/shared";

const PLATFORM_COLORS: Record<PlatformName, string> = {
  INSTAGRAM: "from-pink-500 to-purple-600",
  YOUTUBE: "from-red-500 to-red-700",
  TIKTOK: "from-slate-800 to-slate-900",
  TWITTER: "from-sky-400 to-blue-500",
  LINKEDIN: "from-blue-600 to-blue-800",
  PINTEREST: "from-red-500 to-rose-700",
};

const PLATFORM_LABELS: Record<PlatformName, string> = {
  INSTAGRAM: "Instagram",
  YOUTUBE: "YouTube",
  TIKTOK: "TikTok",
  TWITTER: "Twitter / X",
  LINKEDIN: "LinkedIn",
  PINTEREST: "Pinterest",
};

function AvatarFallback({ handle, platform }: { handle: string; platform: PlatformName }) {
  const initials = handle.replace(/^@/, "").slice(0, 2).toUpperCase();
  return (
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${PLATFORM_COLORS[platform]} flex items-center justify-center shrink-0`}>
      <span className="text-white text-[13px] font-black tracking-wide">{initials}</span>
    </div>
  );
}

interface Props {
  status: "idle" | "loading" | "found" | "not_found" | "error" | "no_key";
  data: SocialPreviewData | null;
  platform: PlatformName;
  handle: string;
}

export function SocialPreviewCard({ status, data, platform, handle }: Props) {
  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-black/[0.02] border border-black/6 mt-2.5">
        <Loader2 className="w-4 h-4 text-ink/30 animate-spin shrink-0" />
        <p className="text-[12px] text-ink/40">Looking up {PLATFORM_LABELS[platform]} profile…</p>
      </div>
    );
  }

  if (status === "no_key" && platform === "YOUTUBE") {
    return (
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 mt-2.5">
        <Key className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-[12px] font-semibold text-amber-700">YouTube preview not configured</p>
          <p className="text-[11px] text-amber-600/80 mt-0.5">
            Set <code className="font-mono bg-amber-100 px-1 rounded">VITE_YOUTUBE_API_KEY</code> in your .env to enable channel previews.
          </p>
        </div>
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-black/[0.02] border border-black/6 mt-2.5">
        <AlertCircle className="w-4 h-4 text-ink/25 shrink-0" />
        <p className="text-[12px] text-ink/40">
          No {PLATFORM_LABELS[platform]} channel found for <span className="font-semibold">@{handle.replace(/^@/, "")}</span>. Double-check the handle.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 mt-2.5">
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
        <p className="text-[12px] text-red-500">Could not fetch preview. You can still add the platform.</p>
      </div>
    );
  }

  if (status === "found" && data) {
    const isYouTube = data.platform === "YOUTUBE";

    return (
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-black/8 mt-2.5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
        {data.avatarUrl ? (
          <img
            src={data.avatarUrl}
            alt={data.name}
            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-black/6"
          />
        ) : (
          <AvatarFallback handle={data.handle} platform={data.platform} />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {isYouTube && <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />}
            <p className="text-[13px] font-bold text-ink truncate">{data.name}</p>
          </div>

          <p className="text-[11px] text-ink-muted truncate">{data.handle}</p>

          {data.subscribers && (
            <p className="text-[11px] font-semibold text-ink/60 mt-1">{data.subscribers}</p>
          )}

          {data.description && (
            <p className="text-[11px] text-ink-muted mt-1.5 line-clamp-2 leading-relaxed">{data.description}</p>
          )}

          {!isYouTube && (
            <p className="text-[11px] text-ink/40 mt-1.5 italic">
              Profile preview not available for {PLATFORM_LABELS[data.platform]} — link will be saved.
            </p>
          )}
        </div>

        <a
          href={data.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-2 rounded-lg text-ink/25 hover:text-brand hover:bg-violet-50 transition-all"
          title={`Open ${PLATFORM_LABELS[data.platform]}`}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return null;
}
