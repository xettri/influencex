// In-memory mock database — mutated by mock-handler for stateful interactions.
// Resets on page refresh (acceptable for demo purposes).

export const MOCK_USERS = {
  "mock-user-brand-001": {
    id: "mock-user-brand-001",
    email: "brand@demo.com",
    role: "BRAND" as const,
    createdAt: "2025-01-15T10:00:00Z",
  },
  "mock-user-creator-001": {
    id: "mock-user-creator-001",
    email: "creator@demo.com",
    role: "INFLUENCER" as const,
    createdAt: "2025-01-20T10:00:00Z",
  },
};

export const DEMO_CREDENTIALS: Record<string, { userId: string; password: string }> = {
  "brand@demo.com": { userId: "mock-user-brand-001", password: "demo123" },
  "creator@demo.com": { userId: "mock-user-creator-001", password: "demo123" },
};

// ── Influencer directory (visible to all) ────────────────────────────────────

export const MOCK_DIRECTORY = [
  {
    id: "mock-influencer-001",
    displayName: "Priya Sharma",
    avatar: null,
    bio: "Fashion & lifestyle creator from Mumbai. I create authentic content that connects brands with real people.",
    niche: ["Fashion", "Lifestyle", "Beauty"],
    location: "Mumbai, India",
    followersCount: 170000,
    engagementRate: 3.8,
    minRate: 5000,
    rateCard: { perPost: 15000, perReel: 25000, perStory: 5000, perVideo: 35000 },
    verified: true,
    platforms: [
      { id: "plat-001", name: "INSTAGRAM" as const, handle: "priya.sharma", followers: 125000 },
      { id: "plat-002", name: "YOUTUBE" as const, handle: "PriyaSharmaVlogs", followers: 45000 },
    ],
  },
  {
    id: "mock-influencer-002",
    displayName: "Rohit Mehta",
    avatar: null,
    bio: "Tech reviewer & gaming streamer. Honest reviews, zero sponsorship bias.",
    niche: ["Tech", "Gaming", "Reviews"],
    location: "Bengaluru, India",
    followersCount: 280000,
    engagementRate: 4.2,
    minRate: 12000,
    rateCard: { perPost: 18000, perReel: 30000, perVideo: 55000 },
    verified: true,
    platforms: [
      { id: "plat-003", name: "YOUTUBE" as const, handle: "RohitTechReviews", followers: 210000 },
      { id: "plat-004", name: "INSTAGRAM" as const, handle: "rohit.techie", followers: 70000 },
    ],
  },
  {
    id: "mock-influencer-003",
    displayName: "Aisha Khan",
    avatar: null,
    bio: "Beauty & skincare expert. Cruelty-free, inclusive beauty for everyone.",
    niche: ["Beauty", "Skincare", "Wellness"],
    location: "Delhi, India",
    followersCount: 450000,
    engagementRate: 5.1,
    minRate: 30000,
    rateCard: { perPost: 35000, perReel: 55000, perStory: 10000 },
    verified: true,
    platforms: [
      { id: "plat-005", name: "INSTAGRAM" as const, handle: "aisha.beauty", followers: 380000 },
      { id: "plat-006", name: "YOUTUBE" as const, handle: "AishaKhanBeauty", followers: 70000 },
    ],
  },
  {
    id: "mock-influencer-004",
    displayName: "Vikram Nair",
    avatar: null,
    bio: "Adventure travel blogger. Exploring hidden India one trip at a time.",
    niche: ["Travel", "Adventure", "Photography"],
    location: "Kochi, India",
    followersCount: 89000,
    engagementRate: 6.3,
    minRate: 8000,
    rateCard: { perPost: 10000, perReel: 18000, perStory: 4000 },
    verified: true,
    platforms: [
      { id: "plat-007", name: "INSTAGRAM" as const, handle: "vikram.travels", followers: 72000 },
      { id: "plat-008", name: "YOUTUBE" as const, handle: "VikramExplores", followers: 17000 },
    ],
  },
  {
    id: "mock-influencer-005",
    displayName: "Sneha Gupta",
    avatar: null,
    bio: "Home chef & food blogger. Authentic Indian recipes with a modern twist.",
    niche: ["Food", "Cooking", "Lifestyle"],
    location: "Pune, India",
    followersCount: 200000,
    engagementRate: 4.7,
    minRate: 20000,
    rateCard: { perPost: 22000, perReel: 35000, perStory: 8000, perVideo: 45000 },
    verified: true,
    platforms: [
      { id: "plat-009", name: "INSTAGRAM" as const, handle: "sneha.cooks", followers: 155000 },
      { id: "plat-010", name: "YOUTUBE" as const, handle: "SnehaKitchen", followers: 45000 },
    ],
  },
  {
    id: "mock-influencer-006",
    displayName: "Aryan Kapoor",
    avatar: null,
    bio: "Certified fitness trainer. Helping 500K+ people achieve their health goals.",
    niche: ["Fitness", "Health", "Nutrition"],
    location: "Mumbai, India",
    followersCount: 520000,
    engagementRate: 5.8,
    minRate: 25000,
    rateCard: { perPost: 30000, perReel: 50000, perStory: 12000, perVideo: 80000 },
    verified: true,
    platforms: [
      { id: "plat-011", name: "INSTAGRAM" as const, handle: "aryan.fitness", followers: 420000 },
      { id: "plat-012", name: "YOUTUBE" as const, handle: "AryanFit", followers: 100000 },
    ],
  },
];

// ── Mutable state ─────────────────────────────────────────────────────────────

export const db = {
  campaigns: [
    {
      id: "mock-camp-001",
      brandId: "mock-brand-001",
      brand: { name: "Zara Lifestyle", logo: null, verified: true },
      title: "Summer Fashion Collection 2025",
      description:
        "We're launching our summer collection and need micro + macro influencers in fashion and lifestyle to showcase our new arrivals in authentic, engaging content. Looking for creators who align with our brand values of style, sustainability, and inclusivity.",
      budget: 200000,
      budgetType: "FLAT_FEE",
      criteria: { minFollowers: 10000, platforms: ["INSTAGRAM", "YOUTUBE"], niches: ["Fashion", "Lifestyle", "Beauty"] },
      status: "ACTIVE",
      campaignCode: "ZARA-SUMMER-2025",
      startDate: "2025-07-01T00:00:00Z",
      endDate: "2025-08-31T00:00:00Z",
      createdAt: "2025-06-01T10:00:00Z",
      _count: { applications: 12 },
    },
    {
      id: "mock-camp-002",
      brandId: "mock-brand-001",
      brand: { name: "Zara Lifestyle", logo: null, verified: true },
      title: "Winter Wardrobe Festive Campaign",
      description:
        "Festive season campaign targeting fashion-forward audiences. We need creators to style our winter collection pieces and share their looks. Ideal for creators with strong fashion engagement.",
      budget: 350000,
      budgetType: "MIXED",
      criteria: { minFollowers: 50000, platforms: ["INSTAGRAM"], niches: ["Fashion"] },
      status: "ACTIVE",
      campaignCode: "ZARA-WINTER-2025",
      startDate: "2025-10-15T00:00:00Z",
      endDate: "2025-12-31T00:00:00Z",
      createdAt: "2025-06-10T10:00:00Z",
      _count: { applications: 7 },
    },
    {
      id: "mock-camp-003",
      brandId: "mock-brand-001",
      brand: { name: "Zara Lifestyle", logo: null, verified: true },
      title: "Brand Awareness Drive Q4",
      description:
        "Performance-based campaign for Q4 brand awareness. We track clicks and conversions with affiliate codes. Best for creators with highly engaged audiences.",
      budget: 120000,
      budgetType: "CPA",
      criteria: { minFollowers: 5000, platforms: ["INSTAGRAM", "YOUTUBE", "TWITTER"] },
      status: "DRAFT",
      campaignCode: "ZARA-Q4-AWARENESS",
      startDate: null,
      endDate: null,
      createdAt: "2025-06-15T10:00:00Z",
      _count: { applications: 0 },
    },
  ],

  hires: [
    {
      id: "mock-hire-001",
      brandId: "mock-brand-001",
      influencerId: "mock-influencer-001",
      title: "Instagram Reel for Summer Collection",
      description:
        "We'd love you to create an authentic Instagram Reel showcasing our Summer Collection 2025. The video should feel natural and reflect your personal style while featuring at least 3 pieces from our collection.",
      budget: 25000,
      deliverables: "1 Instagram Reel (60s min), 2 Stories with product tag, 1 feed post",
      deadline: "2025-08-15T00:00:00Z",
      status: "PENDING",
      brandMessage: "Hi Priya! We love your content and think you'd be a perfect fit for our summer campaign. Looking forward to working together!",
      createdAt: "2025-06-18T10:00:00Z",
      brand: { id: "mock-brand-001", name: "Zara Lifestyle", logo: null, verified: true, industry: "Fashion & Apparel" },
      influencer: { id: "mock-influencer-001", displayName: "Priya Sharma", avatar: null, verified: false, niche: ["Fashion", "Lifestyle", "Beauty"] },
    },
    {
      id: "mock-hire-002",
      brandId: "mock-brand-001",
      influencerId: "mock-influencer-002",
      title: "YouTube Review — Summer Style Guide",
      description:
        "Create a YouTube video reviewing and styling our summer collection pieces. Include an honest review and outfit ideas for different occasions.",
      budget: 45000,
      deliverables: "1 YouTube video (8–10 min), 3 Instagram Stories, 1 YouTube Community post",
      deadline: "2025-09-01T00:00:00Z",
      status: "ACCEPTED",
      brandMessage: "Hey Rohit! Big fan of your style review content. Would love you to cover our summer line.",
      createdAt: "2025-06-12T10:00:00Z",
      brand: { id: "mock-brand-001", name: "Zara Lifestyle", logo: null, verified: true, industry: "Fashion & Apparel" },
      influencer: { id: "mock-influencer-002", displayName: "Rohit Mehta", avatar: null, verified: true, niche: ["Tech", "Gaming", "Reviews"] },
    },
  ],

  applications: [
    {
      id: "mock-app-001",
      campaignId: "mock-camp-001",
      influencerId: "mock-influencer-001",
      status: "PENDING",
      pitch: "I would love to collaborate on the Summer Collection campaign! Fashion is my niche and I have a highly engaged audience in Mumbai. My Instagram reels average 15K+ views.",
      createdAt: "2025-06-20T10:00:00Z",
      campaign: {
        id: "mock-camp-001",
        title: "Summer Fashion Collection 2025",
        brand: { name: "Zara Lifestyle", logo: null, verified: true },
        budget: 200000,
        budgetType: "FLAT_FEE",
      },
    },
  ],

  // The logged-in creator's own editable profile
  influencerProfile: {
    id: "mock-influencer-001",
    userId: "mock-user-creator-001",
    displayName: "Priya Sharma",
    avatar: null as string | null,
    bio: "Fashion & lifestyle creator from Mumbai. I create authentic content that connects brands with real people.",
    niche: ["Fashion", "Lifestyle", "Beauty"],
    location: "Mumbai, India",
    followersCount: 170000,
    engagementRate: 3.8,
    rateCard: { perPost: 15000, perReel: 25000, perStory: 5000, perVideo: 35000 } as Record<string, number> | null,
    minRate: 5000 as number | null,
    profileCompleted: true,
    verified: false,
    platforms: [
      { id: "plat-001", name: "INSTAGRAM" as const, handle: "priya.sharma", followers: 125000, verified: false },
      { id: "plat-002", name: "YOUTUBE" as const, handle: "PriyaSharmaVlogs", followers: 45000, verified: false },
    ],
    _count: { applications: 2, directHires: 1 },
    createdAt: "2025-01-20T10:00:00Z",
  },
};
