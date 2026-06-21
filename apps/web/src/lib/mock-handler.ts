import { db, MOCK_USERS, MOCK_DIRECTORY, DEMO_CREDENTIALS } from "./mock-db";
import type { PaginatedResponse } from "@influencex/shared";

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
    const newPlatform = { id: mockId(), name: body?.name as "INSTAGRAM", handle: String(body?.handle ?? ""), followers: Number(body?.followers ?? 0), verified: false };
    db.influencerProfile.platforms.push(newPlatform);
    db.influencerProfile.followersCount = db.influencerProfile.platforms.reduce((s, p) => s + p.followers, 0);
    db.influencerProfile.profileCompleted = true;
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
    return newHire as T;
  }

  const hireStatusMatch = pathname.match(/^\/api\/v1\/hires\/([^/]+)\/status$/);
  if (method === "PATCH" && hireStatusMatch) {
    const hire = db.hires.find((h) => h.id === hireStatusMatch[1]);
    if (!hire) throw mkError(404, "Hire not found");
    hire.status = String(body?.status ?? hire.status);
    return hire as T;
  }

  const hireMatch = pathname.match(/^\/api\/v1\/hires\/([^/]+)$/);
  if (method === "GET" && hireMatch) {
    const hire = db.hires.find((h) => h.id === hireMatch[1]);
    if (!hire) throw mkError(404, "Hire not found");
    return hire as T;
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
