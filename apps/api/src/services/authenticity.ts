/**
 * Authenticity scoring engine.
 *
 * Computes a 0–100 score from three components:
 *
 *  1. Verification (40 pts) — proportion of platforms verified and HOW they
 *     were verified (API auto-verify > admin manual > pending > unverified).
 *
 *  2. Engagement health (40 pts) — engagement rate vs. tier benchmark.
 *     Skipped entirely if engagement rate is 0 (field not set by creator).
 *     Benchmarks are conservative industry averages (HypeAuditor/Modash data):
 *       Nano  <10K:     5% min
 *       Micro 10K-100K: 3% min
 *       Mid   100K-500K:2% min
 *       Macro 500K-1M:  1.5% min
 *       Mega  1M+:      1% min
 *
 *  3. API data consistency (20 pts) — only for platforms verified via API.
 *     Measures deviation between claimed and real follower count.
 *     Skipped if no API-verified platforms exist.
 *
 * Quality flags (array of string codes surfaced to brands):
 *   UNVERIFIED_HANDLES    — no platforms confirmed yet
 *   LOW_ENGAGEMENT        — below 40% of tier minimum (likely bought followers)
 *   ENGAGEMENT_PODS       — above 20% (unusually high, possible paid engagement)
 *   STATS_MISMATCH        — claimed followers differ >30% from API-verified count
 *   SELF_REPORTED_ONLY    — all data is self-reported, no API verification done
 *   NO_PLATFORMS          — no platforms connected at all
 */

import type { PrismaClient } from "@prisma/client";

const ENGAGEMENT_BENCHMARKS: { maxFollowers: number; minRate: number }[] = [
  { maxFollowers: 10_000,   minRate: 5.0 },
  { maxFollowers: 100_000,  minRate: 3.0 },
  { maxFollowers: 500_000,  minRate: 2.0 },
  { maxFollowers: 1_000_000,minRate: 1.5 },
  { maxFollowers: Infinity, minRate: 1.0 },
];

function getMinEngagement(followers: number): number {
  return ENGAGEMENT_BENCHMARKS.find((b) => followers <= b.maxFollowers)!.minRate;
}

export async function computeAndSaveAuthenticityScore(
  prisma: PrismaClient,
  influencerId: string
): Promise<{ score: number; flags: string[] }> {
  const profile = await prisma.influencerProfile.findUnique({
    where: { id: influencerId },
    include: { platforms: true },
  });

  if (!profile) return { score: 0, flags: [] };

  const platforms = profile.platforms;
  const flags: string[] = [];
  let score = 0;

  // ── Component 1: Verification (40 pts) ─────────────────────────────────
  if (platforms.length === 0) {
    flags.push("NO_PLATFORMS");
    // No verification possible
  } else {
    const verificationPoints = platforms.map((p) => {
      if (p.verificationStatus === "VERIFIED" && p.verificationMethod === "AUTO_API") return 40;
      if (p.verificationStatus === "VERIFIED") return 30;
      if (p.verificationStatus === "PENDING") return 15;
      return 5;
    });
    const avgVerif = verificationPoints.reduce((s, v) => s + v, 0) / platforms.length;
    score += avgVerif;

    if (platforms.every((p) => p.verificationStatus === "UNVERIFIED" || p.verificationStatus === "FAILED")) {
      flags.push("UNVERIFIED_HANDLES");
    }

    const hasApiVerified = platforms.some((p) => p.verificationMethod === "AUTO_API");
    if (!hasApiVerified && platforms.some((p) => p.verificationStatus === "VERIFIED")) {
      flags.push("SELF_REPORTED_ONLY");
    }
  }

  // ── Component 2: Engagement health (40 pts) ─────────────────────────────
  const engRate = profile.engagementRate ?? 0;
  if (engRate > 0) {
    const minRate = getMinEngagement(profile.followersCount);

    if (engRate >= minRate) {
      score += 40;
    } else if (engRate >= minRate * 0.7) {
      score += 28;
    } else if (engRate >= minRate * 0.4) {
      score += 12;
      flags.push("LOW_ENGAGEMENT");
    } else {
      score += 0;
      flags.push("LOW_ENGAGEMENT");
    }

    if (engRate > 20) {
      flags.push("ENGAGEMENT_PODS");
    }
  }
  // If engRate === 0: skip this component entirely (not set, not fake)

  // ── Component 3: API consistency (20 pts) ───────────────────────────────
  const apiPlatforms = platforms.filter(
    (p) => p.verificationMethod === "AUTO_API" && p.apiFollowerCount != null
  );

  if (apiPlatforms.length > 0) {
    const consistencyPoints: number[] = apiPlatforms.map((p) => {
      const claimed = p.followers;
      const actual = p.apiFollowerCount!;
      if (actual === 0) return 0;
      const deviation = Math.abs(claimed - actual) / actual;
      if (deviation <= 0.10) return 20;
      if (deviation <= 0.30) return 10;
      return 0;
    });
    const avgConsistency = consistencyPoints.reduce((s, v) => s + v, 0) / apiPlatforms.length;
    score += avgConsistency;

    if (apiPlatforms.some((p) => {
      const actual = p.apiFollowerCount!;
      return actual > 0 && Math.abs(p.followers - actual) / actual > 0.3;
    })) {
      flags.push("STATS_MISMATCH");
    }
  }
  // If no API platforms: component not applicable, no deduction

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  await prisma.influencerProfile.update({
    where: { id: influencerId },
    data: {
      authenticityScore: finalScore,
      qualityFlags: flags,
    },
  });

  return { score: finalScore, flags };
}
