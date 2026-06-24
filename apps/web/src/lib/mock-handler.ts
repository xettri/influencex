import { db, MOCK_USERS, MOCK_DIRECTORY, DEMO_CREDENTIALS } from "./mock-db";
import type { PaginatedResponse, NotificationType } from "@influencex/shared";

function addNotification(userId: string, type: NotificationType, title: string, body: string, link?: string) {
  const bucket = db.notifications[userId as keyof typeof db.notifications];
  if (!bucket) return;
  bucket.unshift({
    id: `notif-${mockId()}`,
    type,
    title,
    body,
    read: false,
    link: link ?? null,
    createdAt: new Date().toISOString(),
  });
}

// Simulate realistic network latency (150–350 ms)
function delay(): Promise<void> {
  return new Promise((r) => setTimeout(r, 150 + Math.random() * 200));
}

function paginate<T>(items: T[], page: number, limit: number): PaginatedResponse<T> {
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
    hasMore: start + limit < items.length,
  };
}

function getUserFromToken(token: string | null) {
  if (!token) return null;
  const userId = token.replace("mock-token-", "");
  return MOCK_USERS[userId as keyof typeof MOCK_USERS] ?? null;
}

function mockId() {
  return `mock-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function mockVerifCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "IFX-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function mockRequest<T>(
  path: string,
  opts: RequestInit,
  token: string | null
): Promise<T> {
  await delay();

  const method = (opts.method ?? "GET").toUpperCase();
  const body = opts.body ? (JSON.parse(opts.body as string) as Record<string, unknown>) : undefined;
  const user = getUserFromToken(token);

  const [pathname, queryStr] = path.split("?");
  const q = new URLSearchParams(queryStr ?? "");

  // ── AUTH ───────────────────────────────────────────────────────────────────

  if (method === "POST" && pathname === "/api/v1/auth/login") {
    const email = String(body?.email ?? "");
    const password = String(body?.password ?? "");
    const cred = DEMO_CREDENTIALS[email];
    if (!cred || password !== cred.password) {
      throw mkError(401, "Invalid email or password");
    }
    const mockUser = MOCK_USERS[cred.userId as keyof typeof MOCK_USERS];
    return {
      user: mockUser,
      tokens: {
        accessToken: `mock-token-${mockUser.id}`,
        refreshToken: `mock-refresh-${mockUser.id}`,
        expiresIn: 3600,
      },
    } as T;
  }

  if (method === "POST" && pathname === "/api/v1/auth/register") {
    const role = body?.role as "BRAND" | "INFLUENCER";
    const userId = role === "BRAND" ? "mock-user-brand-001" : "mock-user-creator-001";
    const mockUser = { ...MOCK_USERS[userId as keyof typeof MOCK_USERS], email: String(body?.email ?? "") };
    return {
      user: mockUser,
      tokens: {
        accessToken: `mock-token-${userId}`,
        refreshToken: `mock-refresh-${userId}`,
        expiresIn: 3600,
      },
    } as T;
  }

  if (method === "POST" && pathname === "/api/v1/auth/logout") {
    return { success: true } as T;
  }

  if (method === "GET" && pathname === "/api/v1/auth/me") {
    if (!user) throw mkError(401, "Unauthorized");
    return user as T;
  }

  // ── CAMPAIGNS ──────────────────────────────────────────────────────────────

  if (method === "GET" && pathname === "/api/v1/campaigns") {
    let list = db.campaigns.filter((c) => c.status === "ACTIVE");
    const search = q.get("search");
    const budgetType = q.get("budgetType");
    if (search) list = list.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));
    if (budgetType) list = list.filter((c) => c.budgetType === budgetType);
    return paginate(list, Number(q.get("page") ?? "1"), Number(q.get("limit") ?? "12")) as T;
  }

  if (method === "GET" && pathname === "/api/v1/campaigns/my") {
    if (!user || user.role !== "BRAND") throw mkError(403, "Brand account required");
    return db.campaigns as T;
  }

  if (method === "POST" && pathname === "/api/v1/campaigns") {
    const newCamp = {
      id: mockId(),
      brandId: "mock-brand-001",
      brand: { name: "Zara Lifestyle", logo: null, verified: true },
      ...body,
      status: "ACTIVE",
      campaignCode: `CAMP-${Date.now()}`,
      createdAt: new Date().toISOString(),
      _count: { applications: 0 },
    };
    db.campaigns.push(newCamp as (typeof db.campaigns)[number]);
    return newCamp as T;
  }

  // Creator's own applications — must come before the /:id matcher
  if (method === "GET" && pathname === "/api/v1/campaigns/applications/my") {
    if (!user || user.role !== "INFLUENCER") throw mkError(403, "Creator account required");
    const mine = db.applications.filter((a) => a.influencerId === "mock-influencer-001");
    return mine as T;
  }

  // Brand views applications for a campaign
  const campApplicationsMatch = pathname.match(/^\/api\/v1\/campaigns\/([^/]+)\/applications$/);
  if (method === "GET" && campApplicationsMatch) {
    if (!user || user.role !== "BRAND") throw mkError(403, "Brand account required");
    const campId = campApplicationsMatch[1];
    const apps = db.applications.filter((a) => a.campaignId === campId);
    return apps as T;
  }

  // Brand updates application status
  const campAppStatusMatch = pathname.match(/^\/api\/v1\/campaigns\/([^/]+)\/applications\/([^/]+)\/status$/);
  if (method === "PATCH" && campAppStatusMatch) {
    if (!user || user.role !== "BRAND") throw mkError(403, "Brand account required");
    const appId = campAppStatusMatch[2];
    const app = db.applications.find((a) => a.id === appId);
    if (!app) throw mkError(404, "Application not found");
    const newStatus = String(body?.status ?? app.status) as typeof app.status;
    app.status = newStatus;

    const camp = db.campaigns.find((c) => c.id === app.campaignId);
    const campTitle = camp?.title ?? "a campaign";
    const NOTIF_MAP: Record<string, NotificationType> = {
      SHORTLISTED: "APPLICATION_SHORTLISTED",
      APPROVED: "APPLICATION_APPROVED",
      REJECTED: "APPLICATION_REJECTED",
    };
    const notifType = NOTIF_MAP[newStatus];
    if (notifType) {
      const labels: Record<string, string> = {
        SHORTLISTED: "You've been shortlisted!",
        APPROVED: "Application approved",
        REJECTED: "Application not selected",
      };
      const bodies: Record<string, string> = {
        SHORTLISTED: `Zara Lifestyle shortlisted your application for "${campTitle}".`,
        APPROVED: `Your application for "${campTitle}" has been approved! Get ready to collaborate.`,
        REJECTED: `Unfortunately your application for "${campTitle}" was not selected this time.`,
      };
      addNotification("mock-user-creator-001", notifType, labels[newStatus], bodies[newStatus], "/dashboard/applications");
    }

    return app as T;
  }

  // Apply to campaign — must come before the single-campaign matcher
  const applyMatch = pathname.match(/^\/api\/v1\/campaigns\/([^/]+)\/apply$/);
  if (method === "POST" && applyMatch) {
    const campaignId = applyMatch[1];
    const already = db.applications.find((a) => a.campaignId === campaignId && a.influencerId === "mock-influencer-001");
    if (already) throw mkError(409, "You have already applied to this campaign", "CONFLICT");
    const campaign = db.campaigns.find((c) => c.id === campaignId);
    const newApp = {
      id: mockId(),
      campaignId,
      influencerId: "mock-influencer-001",
      status: "PENDING",
      pitch: String(body?.pitch ?? ""),
      createdAt: new Date().toISOString(),
      campaign: campaign
        ? { id: campaign.id, title: campaign.title, brand: campaign.brand, budget: campaign.budget, budgetType: campaign.budgetType }
        : undefined,
    };
    db.applications.push(newApp as (typeof db.applications)[number]);
    // Notify the brand
    addNotification(
      "mock-user-brand-001",
      "APPLICATION_RECEIVED",
      `New application — ${campaign?.title ?? "your campaign"}`,
      `Priya Sharma applied to your campaign with a pitch.`,
      `/dashboard/campaigns/${campaignId}`
    );
    return newApp as T;
  }

  // Single campaign
  const campMatch = pathname.match(/^\/api\/v1\/campaigns\/([^/]+)$/);
  if (method === "GET" && campMatch) {
    const camp = db.campaigns.find((c) => c.id === campMatch[1]);
    if (!camp) throw mkError(404, "Campaign not found");
    return camp as T;
  }

  // ── INFLUENCERS ────────────────────────────────────────────────────────────

  if (method === "GET" && pathname === "/api/v1/influencers") {
    let list = [...MOCK_DIRECTORY];
    const search = q.get("search");
    const minF = q.get("minFollowers");
    const maxF = q.get("maxFollowers");
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((i) => i.displayName.toLowerCase().includes(s) || i.niche.some((n) => n.toLowerCase().includes(s)));
    }
    if (minF) list = list.filter((i) => i.followersCount >= Number(minF));
    if (maxF) list = list.filter((i) => i.followersCount <= Number(maxF));
    return paginate(list, Number(q.get("page") ?? "1"), Number(q.get("limit") ?? "12")) as T;
  }

  if (method === "GET" && pathname === "/api/v1/influencers/me") {
    if (!user || user.role !== "INFLUENCER") throw mkError(403, "Creator account required");
    return db.influencerProfile as T;
  }

  if (method === "PATCH" && pathname === "/api/v1/influencers/me") {
    if (body?.rateCard && typeof body.rateCard === "object") {
      const rc = body.rateCard as Record<string, number>;
      db.influencerProfile.rateCard = rc;
      const vals = Object.values(rc).filter(Boolean) as number[];
      db.influencerProfile.minRate = vals.length > 0 ? Math.min(...vals) : null;
      delete body.rateCard;
    }
    Object.assign(db.influencerProfile, body);
    db.influencerProfile.profileCompleted =
      !!db.influencerProfile.displayName && db.influencerProfile.platforms.length > 0;
    return db.influencerProfile as T;
  }

  if (method === "POST" && pathname === "/api/v1/influencers/me/platforms") {
    const existing = db.influencerProfile.platforms.find((p) => p.name === body?.name);
    if (existing) throw mkError(409, "You already have this platform connected");
    const newPlatform = {
      id: mockId(),
      name: body?.name as "INSTAGRAM",
      handle: String(body?.handle ?? ""),
      followers: Number(body?.followers ?? 0),
      verified: false,
      verificationCode: mockVerifCode(),
      verificationStatus: "UNVERIFIED" as import("@influencex/shared").VerificationStatus,
      verifiedAt: null as string | null,
      createdAt: new Date().toISOString(),
    };
    db.influencerProfile.platforms.push(newPlatform);
    db.influencerProfile.followersCount = db.influencerProfile.platforms.reduce((s, p) => s + p.followers, 0);
    db.influencerProfile.profileCompleted = true;
    return db.influencerProfile as T;
  }

  // Request verify — must come before deletePlatMatch
  const requestVerifyMatch = pathname.match(/^\/api\/v1\/influencers\/me\/platforms\/([^/]+)\/request-verify$/);
  if (method === "POST" && requestVerifyMatch) {
    if (!user || user.role !== "INFLUENCER") throw mkError(403, "Creator account required");
    const platform = db.influencerProfile.platforms.find((p) => p.id === requestVerifyMatch[1]);
    if (!platform) throw mkError(404, "Platform not found");
    if (platform.verificationStatus === "VERIFIED") throw mkError(400, "Platform is already verified");
    platform.verificationStatus = "PENDING";
    return db.influencerProfile as T;
  }

  const deletePlatMatch = pathname.match(/^\/api\/v1\/influencers\/me\/platforms\/([^/]+)$/);
  if (method === "DELETE" && deletePlatMatch) {
    db.influencerProfile.platforms = db.influencerProfile.platforms.filter((p) => p.id !== deletePlatMatch[1]);
    db.influencerProfile.followersCount = db.influencerProfile.platforms.reduce((s, p) => s + p.followers, 0);
    return db.influencerProfile as T;
  }

  // Single influencer — must come after /me routes
  const infMatch = pathname.match(/^\/api\/v1\/influencers\/([^/]+)$/);
  if (method === "GET" && infMatch) {
    const inf = MOCK_DIRECTORY.find((i) => i.id === infMatch[1]);
    if (!inf) throw mkError(404, "Influencer not found");
    return {
      ...inf,
      platforms: inf.platforms.map((p) => ({ ...p, verified: false })),
      _count: { applications: 3, directHires: 2 },
    } as T;
  }

  // Admin verify (no-op in mock)
  if (method === "PATCH" && pathname.match(/^\/api\/v1\/influencers\/[^/]+\/verify$/)) {
    return { verified: true } as T;
  }

  // ── HIRES ─────────────────────────────────────────────────────────────────

  if (method === "GET" && pathname === "/api/v1/hires/my") {
    if (!user) throw mkError(401, "Unauthorized");
    if (user.role === "BRAND") {
      return db.hires as T;
    }
    // Creator sees only hires addressed to them
    return db.hires.filter((h) => h.influencerId === "mock-influencer-001") as T;
  }

  if (method === "POST" && pathname === "/api/v1/hires") {
    const inf = MOCK_DIRECTORY.find((i) => i.id === body?.influencerId);
    const newHire = {
      id: mockId(),
      brandId: "mock-brand-001",
      ...body,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      brand: { id: "mock-brand-001", name: "Zara Lifestyle", logo: null, verified: true, industry: "Fashion & Apparel" },
      influencer: inf
        ? { id: inf.id, displayName: inf.displayName, avatar: null, verified: inf.verified, niche: inf.niche }
        : undefined,
    };
    db.hires.push(newHire as (typeof db.hires)[number]);
    // Notify the influencer
    addNotification(
      "mock-user-creator-001",
      "HIRE_REQUEST",
      `New hire request from Zara Lifestyle`,
      `You've been invited: "${String(body?.title ?? "Hire request")}". Budget: ₹${Number(body?.budget ?? 0).toLocaleString("en-IN")}.`,
      "/dashboard/hires"
    );
    return newHire as T;
  }

  const hireStatusMatch = pathname.match(/^\/api\/v1\/hires\/([^/]+)\/status$/);
  if (method === "PATCH" && hireStatusMatch) {
    const hire = db.hires.find((h) => h.id === hireStatusMatch[1]);
    if (!hire) throw mkError(404, "Hire not found");
    const prevStatus = hire.status;
    hire.status = String(body?.status ?? hire.status);
    // Notify the brand when creator responds
    if (prevStatus !== hire.status && (hire.status === "ACCEPTED" || hire.status === "DECLINED")) {
      const notifType: NotificationType = hire.status === "ACCEPTED" ? "HIRE_ACCEPTED" : "HIRE_DECLINED";
      addNotification(
        "mock-user-brand-001",
        notifType,
        `Hire ${hire.status === "ACCEPTED" ? "accepted" : "declined"} — ${hire.influencer?.displayName ?? "Influencer"}`,
        `"${hire.title}" was ${hire.status === "ACCEPTED" ? "accepted" : "declined"}.`,
        "/dashboard/hires"
      );
    }
    return hire as T;
  }

  const hireMatch = pathname.match(/^\/api\/v1\/hires\/([^/]+)$/);
  if (method === "GET" && hireMatch) {
    const hire = db.hires.find((h) => h.id === hireMatch[1]);
    if (!hire) throw mkError(404, "Hire not found");
    return hire as T;
  }

  // ── ADMIN ─────────────────────────────────────────────────────────────────

  if (method === "GET" && pathname === "/api/v1/admin/verifications") {
    if (!user || user.role !== "ADMIN") throw mkError(403, "Admin access required");
    const pending = db.influencerProfile.platforms
      .filter((p) => p.verificationStatus === "PENDING")
      .map((p) => ({
        ...p,
        influencer: {
          id: db.influencerProfile.id,
          displayName: db.influencerProfile.displayName,
          avatar: db.influencerProfile.avatar,
          user: { email: "creator@demo.com" },
        },
      }));
    return pending as T;
  }

  const adminVerifyMatch = pathname.match(/^\/api\/v1\/admin\/platforms\/([^/]+)\/(verify|fail)$/);
  if (method === "PATCH" && adminVerifyMatch) {
    if (!user || user.role !== "ADMIN") throw mkError(403, "Admin access required");
    const [, platId, action] = adminVerifyMatch;
    const platform = db.influencerProfile.platforms.find((p) => p.id === platId);
    if (!platform) throw mkError(404, "Platform not found");
    if (action === "verify") {
      platform.verified = true;
      platform.verificationStatus = "VERIFIED";
      platform.verifiedAt = new Date().toISOString();
      addNotification(
        "mock-user-creator-001",
        "VERIFICATION_APPROVED",
        `${platform.name} account verified!`,
        `Your @${platform.handle} ${platform.name} account is now verified and visible to brands.`,
        "/dashboard/profile"
      );
    } else {
      platform.verificationStatus = "FAILED";
      addNotification(
        "mock-user-creator-001",
        "VERIFICATION_FAILED",
        `${platform.name} verification failed`,
        `We couldn't verify @${platform.handle}. Please ensure the code is in your bio and try again.`,
        "/dashboard/profile"
      );
    }
    return platform as T;
  }

  // ── ANALYTICS ─────────────────────────────────────────────────────────────

  if (method === "GET" && pathname === "/api/v1/analytics/brand") {
    if (!user || user.role !== "BRAND") throw mkError(403, "Brand account required");

    // Compute from live mock data
    const camps = db.campaigns;
    const apps = db.applications;
    const approvedCount = apps.filter((a) => a.status === "APPROVED").length;
    const activeCamps = camps.filter((c) => c.status === "ACTIVE");

    // Realistic-looking applications over last 30 days
    const now = Date.now();
    const byDay: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86_400_000);
      const dateStr = d.toISOString().slice(0, 10);
      // Seed with a pattern that looks real
      const seed = (i * 7 + 13) % 17;
      byDay.push({ date: dateStr, count: i % 5 === 0 ? seed % 4 : seed % 7 });
    }
    // Spike the last few days with actual application count
    byDay[27].count = 4;
    byDay[28].count = 3;
    byDay[29].count = 5;

    const appsByStatus: Record<string, number> = { PENDING: 0, SHORTLISTED: 0, APPROVED: 0, REJECTED: 0 };
    for (const a of apps) appsByStatus[a.status] = (appsByStatus[a.status] ?? 0) + 1;

    const campsByStatus: Record<string, number> = {};
    for (const c of camps) campsByStatus[c.status] = (campsByStatus[c.status] ?? 0) + 1;

    const topCampaigns = camps.map((c) => ({
      id: c.id,
      title: c.title,
      applications: apps.filter((a) => a.campaignId === c.id).length,
      approved: apps.filter((a) => a.campaignId === c.id && a.status === "APPROVED").length,
      budget: c.budget,
    })).sort((a, b) => b.applications - a.applications).slice(0, 5);

    return {
      overview: {
        totalCampaigns: camps.length,
        activeCampaigns: activeCamps.length,
        totalApplications: apps.length,
        approvedCount,
        approvalRate: apps.length > 0 ? Math.round((approvedCount / apps.length) * 100) : 0,
        totalBudgetActive: activeCamps.reduce((s, c) => s + c.budget, 0),
      },
      applicationsByStatus: appsByStatus,
      campaignsByStatus: campsByStatus,
      applicationsOverTime: byDay,
      topCampaigns,
    } as T;
  }

  if (method === "GET" && pathname === "/api/v1/analytics/creator") {
    if (!user || user.role !== "INFLUENCER") throw mkError(403, "Creator account required");

    const apps = db.applications.filter((a) => a.influencerId === "mock-influencer-001");
    const approvedCount = apps.filter((a) => a.status === "APPROVED").length;

    const appsByStatus: Record<string, number> = { PENDING: 0, SHORTLISTED: 0, APPROVED: 0, REJECTED: 0 };
    for (const a of apps) appsByStatus[a.status] = (appsByStatus[a.status] ?? 0) + 1;

    // Activity by month (last 6 months) — realistic pattern
    const now = new Date();
    const activityByMonth = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      const counts = [0, 1, 0, 2, 1, apps.length]; // ramp up to current
      return { month: label, applications: counts[i] };
    });

    const earningsPipeline = apps
      .filter((a) => a.status === "APPROVED" || a.status === "SHORTLISTED")
      .map((a) => ({
        campaignId: a.campaignId,
        title: a.campaign?.title ?? "Campaign",
        brand: a.campaign?.brand.name ?? "Brand",
        budget: a.campaign?.budget ?? 0,
        status: a.status,
      }));

    const estimatedEarnings = earningsPipeline
      .filter((e) => e.status === "APPROVED")
      .reduce((s, e) => s + e.budget * 0.1, 0);

    return {
      overview: {
        totalApplications: apps.length,
        approvedCount,
        approvalRate: apps.length > 0 ? Math.round((approvedCount / apps.length) * 100) : 0,
        pendingCount: appsByStatus["PENDING"] ?? 0,
        estimatedEarnings,
        directHires: db.hires.filter((h) => h.influencerId === "mock-influencer-001" && ["ACCEPTED", "COMPLETED"].includes(h.status)).length,
      },
      applicationsByStatus: appsByStatus,
      earningsPipeline,
      activityByMonth,
    } as T;
  }

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────

  if (method === "GET" && pathname === "/api/v1/notifications") {
    if (!user) throw mkError(401, "Unauthorized");
    const bucket = db.notifications[user.id as keyof typeof db.notifications] ?? [];
    return [...bucket].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as T;
  }

  if (method === "GET" && pathname === "/api/v1/notifications/unread-count") {
    if (!user) throw mkError(401, "Unauthorized");
    const bucket = db.notifications[user.id as keyof typeof db.notifications] ?? [];
    return { count: bucket.filter((n) => !n.read).length } as T;
  }

  if (method === "PATCH" && pathname === "/api/v1/notifications/read-all") {
    if (!user) throw mkError(401, "Unauthorized");
    const bucket = db.notifications[user.id as keyof typeof db.notifications];
    if (bucket) bucket.forEach((n) => { n.read = true; });
    return { success: true } as T;
  }

  const notifReadMatch = pathname.match(/^\/api\/v1\/notifications\/([^/]+)\/read$/);
  if (method === "PATCH" && notifReadMatch) {
    if (!user) throw mkError(401, "Unauthorized");
    const bucket = db.notifications[user.id as keyof typeof db.notifications];
    const notif = bucket?.find((n) => n.id === notifReadMatch[1]);
    if (!notif) throw mkError(404, "Notification not found");
    notif.read = true;
    return notif as T;
  }

  const notifDeleteMatch = pathname.match(/^\/api\/v1\/notifications\/([^/]+)$/);
  if (method === "DELETE" && notifDeleteMatch) {
    if (!user) throw mkError(401, "Unauthorized");
    const key = user.id as keyof typeof db.notifications;
    const bucket = db.notifications[key];
    if (bucket) {
      db.notifications[key] = bucket.filter((n) => n.id !== notifDeleteMatch[1]) as typeof bucket;
    }
    return { success: true } as T;
  }

  // ── MISC ──────────────────────────────────────────────────────────────────

  if (method === "POST" && pathname === "/api/v1/waitlist") {
    return { message: "Added to waitlist" } as T;
  }

  console.warn("[mock] Unhandled:", method, pathname);
  throw mkError(404, `Mock: no handler for ${method} ${pathname}`);
}

function mkError(status: number, message: string, code?: string): Error & { status: number; code?: string } {
  return Object.assign(new Error(message), { status, code });
}
