/**
 * Auto-verification services for social platforms.
 *
 * YouTube: Fully automated via YouTube Data API v3.
 *   - Checks if channel description contains the verification code.
 *   - Pulls real subscriber count, total views, and video count.
 *   - Calculates a real engagement rate (avg views per video / subscribers).
 *
 * Other platforms: No reliable public API available yet.
 *   - Instagram: Instagram's public API was deprecated Dec 2024.
 *     Scalable path: Instagram Login API (OAuth) — user authenticates,
 *     proving account ownership. Requires FB Developer app review (~2 weeks).
 *   - Twitter/X: API v2 Basic ($100/mo). Worth adding at scale.
 *   - TikTok/LinkedIn/Pinterest: Manual admin review for now.
 */

export interface AutoVerifyResult {
  verified: boolean;
  apiFollowerCount?: number;
  apiEngagementRate?: number;
  reason?: string; // why verification failed
}

export async function tryAutoVerifyYouTube(
  handle: string,
  verificationCode: string,
  apiKey: string
): Promise<AutoVerifyResult> {
  const cleanHandle = handle.replace(/^@/, "");

  // Try forHandle (modern) then forUsername (legacy)
  for (const [param, value] of [
    ["forHandle", cleanHandle],
    ["forUsername", cleanHandle],
  ] as const) {
    let data: YouTubeChannelResponse;
    try {
      const url =
        `https://www.googleapis.com/youtube/v3/channels` +
        `?part=snippet,statistics` +
        `&${param}=${encodeURIComponent(value)}` +
        `&key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      data = (await res.json()) as YouTubeChannelResponse;
    } catch {
      continue;
    }

    const item = data.items?.[0];
    if (!item) continue;

    const description = item.snippet.description ?? "";
    if (!description.includes(verificationCode)) {
      return {
        verified: false,
        reason: `Verification code not found in channel description. Please add "${verificationCode}" to your YouTube About/Description section.`,
      };
    }

    // Code found — pull real stats
    const subscribers = parseInt(item.statistics.subscriberCount ?? "0", 10);
    const totalViews = parseInt(item.statistics.viewCount ?? "0", 10);
    const videoCount = parseInt(item.statistics.videoCount ?? "1", 10);

    const avgViewsPerVideo = videoCount > 0 ? totalViews / videoCount : 0;
    const engagementRate =
      subscribers > 0 ? Math.min((avgViewsPerVideo / subscribers) * 100, 100) : 0;

    return {
      verified: true,
      apiFollowerCount: subscribers,
      apiEngagementRate: parseFloat(engagementRate.toFixed(2)),
    };
  }

  return {
    verified: false,
    reason: `YouTube channel "@${cleanHandle}" not found. Check that the handle is correct.`,
  };
}

interface YouTubeChannelResponse {
  items?: Array<{
    snippet: { description?: string };
    statistics: { subscriberCount?: string; viewCount?: string; videoCount?: string };
  }>;
}
