import { useState, useEffect, useRef } from "react";
import type { PlatformName } from "@influencex/shared";

export interface SocialPreviewData {
  name: string;
  handle: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  subscribers: string | null;
  description: string | null;
  profileUrl: string;
  platform: PlatformName;
}

type Status = "idle" | "loading" | "found" | "not_found" | "error" | "no_key";

export interface SocialPreviewState {
  status: Status;
  data: SocialPreviewData | null;
}

const PROFILE_URLS: Record<PlatformName, (h: string) => string> = {
  INSTAGRAM: (h) => `https://instagram.com/${h}`,
  YOUTUBE: (h) => `https://youtube.com/@${h}`,
  TIKTOK: (h) => `https://tiktok.com/@${h}`,
  TWITTER: (h) => `https://x.com/${h}`,
  LINKEDIN: (h) => `https://linkedin.com/in/${h}`,
  PINTEREST: (h) => `https://pinterest.com/${h}`,
};

function formatCount(n: string | number): string {
  const v = typeof n === "string" ? parseInt(n, 10) : n;
  if (isNaN(v)) return "";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

async function fetchYouTubePreview(handle: string): Promise<SocialPreviewData | null> {
  const key = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;
  if (!key) return null;

  const cleanHandle = handle.replace(/^@/, "");

  // Try forHandle first (modern), then forUsername (legacy)
  for (const [param, value] of [["forHandle", cleanHandle], ["forUsername", cleanHandle]] as const) {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&${param}=${encodeURIComponent(value)}&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) continue;
    const json = await res.json() as {
      items?: Array<{
        snippet: {
          title: string;
          description: string;
          customUrl?: string;
          thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
        };
        statistics: { subscriberCount?: string; videoCount?: string };
      }>;
    };

    const item = json.items?.[0];
    if (!item) continue;

    const thumb = item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url ?? item.snippet.thumbnails.default?.url ?? null;
    const subCount = item.statistics.subscriberCount;

    return {
      platform: "YOUTUBE",
      name: item.snippet.title,
      handle: item.snippet.customUrl ?? `@${cleanHandle}`,
      avatarUrl: thumb,
      bannerUrl: null,
      subscribers: subCount ? `${formatCount(subCount)} subscribers` : null,
      description: item.snippet.description?.slice(0, 120) || null,
      profileUrl: `https://youtube.com/${item.snippet.customUrl ?? `@${cleanHandle}`}`,
    };
  }

  return null;
}

export function useSocialPreview(platform: PlatformName, handle: string): SocialPreviewState {
  const [state, setState] = useState<SocialPreviewState>({ status: "idle", data: null });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const clean = handle.replace(/^@/, "").trim();

    if (!clean || clean.length < 2) {
      setState({ status: "idle", data: null });
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    timerRef.current = setTimeout(async () => {
      setState({ status: "loading", data: null });

      try {
        if (platform === "YOUTUBE") {
          const key = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;
          if (!key) {
            setState({ status: "no_key", data: null });
            return;
          }
          const data = await fetchYouTubePreview(clean);
          setState(data ? { status: "found", data } : { status: "not_found", data: null });
        } else {
          // For other platforms, we can't fetch thumbnails — emit a link-only preview
          setState({
            status: "found",
            data: {
              platform,
              name: clean,
              handle: `@${clean}`,
              avatarUrl: null,
              bannerUrl: null,
              subscribers: null,
              description: null,
              profileUrl: PROFILE_URLS[platform](clean),
            },
          });
        }
      } catch {
        setState({ status: "error", data: null });
      }
    }, 600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [platform, handle]);

  return state;
}
