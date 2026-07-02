export interface YtVideoStats {
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

interface YtApiResponse {
  items?: {
    statistics: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
    };
  }[];
}

export async function fetchYouTubeVideoStats(videoId: string): Promise<YtVideoStats | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${encodeURIComponent(videoId)}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as YtApiResponse;
    const item = data.items?.[0];
    if (!item) return null;
    return {
      viewCount: parseInt(item.statistics.viewCount ?? "0", 10) || 0,
      likeCount: parseInt(item.statistics.likeCount ?? "0", 10) || 0,
      commentCount: parseInt(item.statistics.commentCount ?? "0", 10) || 0,
    };
  } catch {
    return null;
  }
}

export function extractYouTubeVideoId(input: string): string | null {
  // Accept bare ID (11 chars), full URL, or shorts URL
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const re of patterns) {
    const m = input.match(re);
    if (m) return m[1];
  }
  return null;
}
