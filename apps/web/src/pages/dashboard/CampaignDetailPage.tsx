import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, Clock, Circle, Loader2, Send, Users,
  ChevronDown, ChevronUp, ExternalLink, Megaphone, CalendarDays, ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { toast } from "@/store/toast";

type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
type AppStatus = "PENDING" | "SHORTLISTED" | "APPROVED" | "REJECTED" | "WITHDRAWN";

interface CampaignDetail {
  id: string;
  brandId: string;
  title: string;
  description: string;
  budget: number;
  budgetType: string;
  status: CampaignStatus;
  campaignCode: string;
  criteria: {
    minFollowers?: number;
    maxFollowers?: number;
    platforms?: string[];
    niches?: string[];
    regions?: string[];
  };
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  brand: { name: string; logo?: string | null; website?: string | null; industry?: string | null; verified: boolean };
  _count?: { applications: number };
}

interface ApplicationItem {
  id: string;
  campaignId: string;
  influencerId: string;
  status: AppStatus;
  pitch?: string;
  createdAt: string;
  influencer?: {
    id: string;
    displayName: string;
    avatar: string | null;
    followersCount: number;
    niche: string[];
    platforms: { id: string; name: string; handle: string; followers: number }[];
    verified: boolean;
  };
  campaign?: {
    id: string;
    title: string;
    brand: { name: string; logo?: string | null; verified: boolean };
    budget: number;
    budgetType: string;
  };
}

const STATUS_STYLES: Record<CampaignStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PAUSED: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-violet-50 text-violet-700 border-violet-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

const APP_STATUS_STYLES: Record<AppStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  SHORTLISTED: "bg-blue-50 text-blue-700 border-blue-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-600 border-red-200",
  WITHDRAWN: "bg-slate-100 text-slate-500 border-slate-200",
};

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: "bg-pink-500",
  YOUTUBE: "bg-red-500",
  TIKTOK: "bg-black",
  TWITTER: "bg-sky-500",
  LINKEDIN: "bg-blue-700",
  PINTEREST: "bg-red-600",
};

function formatBudget(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1).replace(".0", "")}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v.toLocaleString("en-IN")}`;
}

function ApplicationCard({
  app,
  onStatusChange,
  acting,
}: {
  app: ApplicationItem;
  onStatusChange: (appId: string, status: AppStatus) => void;
  acting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const inf = app.influencer!;
  const initials = inf.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-black/6 p-5"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[12px] font-bold shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + verified + followers */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Link
              to={`/dashboard/influencers/${inf.id}`}
              className="text-[14px] font-bold text-ink hover:text-brand transition-colors"
            >
              {inf.displayName}
            </Link>
            {inf.verified && <ShieldCheck className="w-3.5 h-3.5 text-violet-500 shrink-0" />}
            <span className="text-[11px] text-ink-muted">
              {inf.followersCount.toLocaleString("en-IN")} followers
            </span>
          </div>

          {/* Niche tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {inf.niche.slice(0, 4).map((n) => (
              <span key={n} className="px-1.5 py-0.5 rounded bg-black/[0.04] text-[10px] text-ink/60 font-medium">{n}</span>
            ))}
          </div>

          {/* Platform chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {inf.platforms.slice(0, 3).map((p) => (
              <span
                key={p.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${PLATFORM_COLORS[p.name] ?? "bg-gray-400"} text-white text-[10px] font-bold`}
              >
                {p.name.slice(0, 2)} {(p.followers / 1000).toFixed(0)}K
              </span>
            ))}
          </div>

          {/* Pitch */}
          {app.pitch && (
            <div className="mb-3">
              <p className={`text-[12px] text-ink-muted leading-relaxed ${!expanded ? "line-clamp-2" : ""}`}>
                {app.pitch}
              </p>
              {app.pitch.length > 120 && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="flex items-center gap-1 text-[11px] text-brand font-semibold mt-1 hover:underline"
                >
                  {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
                </button>
              )}
            </div>
          )}

          {/* Applied date + status + actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-ink-muted">
              Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${APP_STATUS_STYLES[app.status]}`}>
              {app.status}
            </span>

            {acting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-muted" />
            ) : (
              <>
                {app.status !== "SHORTLISTED" && app.status !== "APPROVED" && app.status !== "REJECTED" && (
                  <button
                    type="button"
                    onClick={() => onStatusChange(app.id, "SHORTLISTED")}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold hover:bg-blue-100 transition-colors"
                  >
                    Shortlist
                  </button>
                )}
                {app.status !== "APPROVED" && app.status !== "REJECTED" && (
                  <button
                    type="button"
                    onClick={() => onStatusChange(app.id, "APPROVED")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                  >
                    Approve
                  </button>
                )}
                {app.status !== "REJECTED" && app.status !== "APPROVED" && (
                  <button
                    type="button"
                    onClick={() => onStatusChange(app.id, "REJECTED")}
                    className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold hover:bg-red-100 transition-colors"
                  >
                    Reject
                  </button>
                )}
              </>
            )}

            <Link
              to={`/dashboard/influencers/${inf.id}`}
              className="flex items-center gap-1 text-[10px] text-ink/40 hover:text-brand transition-colors ml-auto"
            >
              View profile <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [userApp, setUserApp] = useState<ApplicationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<AppStatus | "ALL">("ALL");

  const [showApply, setShowApply] = useState(false);
  const [pitch, setPitch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actingAppId, setActingAppId] = useState<string | null>(null);

  const isBrand = user?.role === "BRAND";

  useEffect(() => {
    if (!id) return;
    api.get<CampaignDetail>(`/api/v1/campaigns/${id}`)
      .then(async (camp) => {
        setCampaign(camp);
        if (isBrand) {
          const apps = await api.get<ApplicationItem[]>(`/api/v1/campaigns/${id}/applications`).catch(() => []);
          setApplications(apps);
        } else {
          const myApps = await api.get<ApplicationItem[]>("/api/v1/campaigns/applications/my").catch(() => []);
          setUserApp(myApps.find((a) => a.campaignId === id) ?? null);
        }
      })
      .catch(() => { toast.error("Campaign not found"); navigate(isBrand ? "/dashboard/campaigns" : "/dashboard/explore"); })
      .finally(() => setLoading(false));
  }, [id, isBrand, navigate]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      const app = await api.post<ApplicationItem>(`/api/v1/campaigns/${id}/apply`, { pitch });
      setUserApp({ ...app, campaignId: id });
      setShowApply(false);
      setPitch("");
      toast.success("Application submitted! We'll notify you of any updates.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to apply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (appId: string, status: AppStatus) => {
    if (!id) return;
    setActingAppId(appId);
    try {
      const updated = await api.patch<ApplicationItem>(`/api/v1/campaigns/${id}/applications/${appId}/status`, { status });
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: updated.status } : a)));
      toast.success(`Application ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActingAppId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="h-8 w-32 rounded-lg bg-black/[0.04] animate-pulse" />
        <div className="h-64 rounded-2xl bg-white border border-black/6 animate-pulse" />
        <div className="h-48 rounded-2xl bg-white border border-black/6 animate-pulse" />
      </div>
    );
  }

  if (!campaign) return null;

  const filteredApps = filterStatus === "ALL"
    ? applications
    : applications.filter((a) => a.status === filterStatus);

  const filterCounts: Record<string, number> = { ALL: applications.length };
  (["PENDING", "SHORTLISTED", "APPROVED", "REJECTED"] as AppStatus[]).forEach((s) => {
    filterCounts[s] = applications.filter((a) => a.status === s).length;
  });

  const crit = campaign.criteria ?? {};
  const backTo = isBrand ? "/dashboard/campaigns" : "/dashboard/explore";
  const backLabel = isBrand ? "My Campaigns" : "Browse Campaigns";

  return (
    <div className="max-w-3xl">
      {/* Back nav */}
      <button
        type="button"
        onClick={() => navigate(backTo)}
        className="flex items-center gap-1.5 text-[12px] font-semibold text-ink/50 hover:text-ink mb-5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> {backLabel}
      </button>

      {/* Campaign card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-black/6 p-6 mb-5"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-bold text-ink/50 uppercase tracking-wide">{campaign.brand.name}</span>
              {campaign.brand.verified && <CheckCircle2 className="w-3 h-3 text-violet-500 shrink-0" strokeWidth={2.5} />}
            </div>
            <h1 className="font-display font-extrabold text-[1.4rem] text-ink tracking-tight leading-snug">
              {campaign.title}
            </h1>
          </div>
          <span className={`shrink-0 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${STATUS_STYLES[campaign.status]}`}>
            {campaign.status}
          </span>
        </div>

        <p className="text-[13.5px] text-ink-muted leading-relaxed mb-5">{campaign.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-black/[0.025] border border-black/6">
            <p className="text-[10px] font-semibold text-ink/50 uppercase tracking-wide mb-0.5">Budget</p>
            <p className="font-display font-bold text-[1.1rem] text-ink">{formatBudget(campaign.budget)}</p>
            <p className="text-[10px] text-ink-muted">{campaign.budgetType.replace(/_/g, " ")}</p>
          </div>
          <div className="p-3 rounded-xl bg-black/[0.025] border border-black/6">
            <p className="text-[10px] font-semibold text-ink/50 uppercase tracking-wide mb-0.5">Applications</p>
            <p className="font-display font-bold text-[1.1rem] text-ink">{campaign._count?.applications ?? applications.length}</p>
            <p className="text-[10px] text-ink-muted">submitted</p>
          </div>
          {(campaign.startDate || campaign.endDate) && (
            <div className="p-3 rounded-xl bg-black/[0.025] border border-black/6">
              <p className="text-[10px] font-semibold text-ink/50 uppercase tracking-wide mb-0.5">Dates</p>
              <p className="text-[12px] font-semibold text-ink">
                {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                {" – "}
                {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Ongoing"}
              </p>
            </div>
          )}
        </div>

        {/* Requirements */}
        {(crit.minFollowers || crit.platforms?.length || crit.niches?.length) && (
          <div className="pt-4 border-t border-black/6">
            <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wide mb-3">Requirements</p>
            <div className="flex flex-wrap gap-2">
              {crit.minFollowers && (
                <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/[0.03] border border-black/6 text-[12px] font-medium text-ink/70">
                  <Users className="w-3 h-3 text-ink/40" />
                  {crit.minFollowers.toLocaleString("en-IN")}+ followers
                </span>
              )}
              {crit.platforms?.map((p) => (
                <span key={p} className={`px-2.5 py-1.5 rounded-lg ${PLATFORM_COLORS[p] ?? "bg-gray-400"} text-white text-[11px] font-bold`}>
                  {p}
                </span>
              ))}
              {crit.niches?.map((n) => (
                <span key={n} className="px-2.5 py-1.5 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 text-[12px] font-medium">
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ── CREATOR VIEW: Apply section ── */}
      {!isBrand && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {userApp ? (
            <div className={`rounded-2xl border p-5 ${APP_STATUS_STYLES[userApp.status].replace("text-", "border-").split(" ")[1]}`}
              style={{ background: "white" }}>
              <div className={`p-4 rounded-2xl border ${APP_STATUS_STYLES[userApp.status]}`}>
                <div className="flex items-center gap-2 mb-1">
                  {userApp.status === "APPROVED" ? <CheckCircle2 className="w-4 h-4" /> :
                    userApp.status === "SHORTLISTED" ? <Clock className="w-4 h-4" /> :
                      userApp.status === "REJECTED" ? <Circle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  <p className="font-semibold text-[13px]">Your application is <strong>{userApp.status.toLowerCase()}</strong></p>
                </div>
                {userApp.status === "PENDING" && (
                  <p className="text-[12px] opacity-80">The brand is reviewing your pitch. We'll notify you when there's an update.</p>
                )}
                {userApp.status === "SHORTLISTED" && (
                  <p className="text-[12px] opacity-80">You've been shortlisted! The brand may reach out to finalize the collaboration.</p>
                )}
                {userApp.status === "APPROVED" && (
                  <p className="text-[12px] opacity-80">Congratulations! You've been approved for this campaign. Expect to hear from the brand soon.</p>
                )}
                {userApp.status === "REJECTED" && (
                  <p className="text-[12px] opacity-80">Unfortunately your application wasn't selected for this campaign. Keep applying!</p>
                )}
                {userApp.pitch && (
                  <p className="text-[12px] opacity-70 mt-2 pt-2 border-t border-current/20 italic">"{userApp.pitch}"</p>
                )}
              </div>
            </div>
          ) : campaign.status === "ACTIVE" ? (
            <div className="bg-white rounded-2xl border border-black/6 p-6">
              <AnimatePresence mode="wait">
                {!showApply ? (
                  <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                        <Megaphone className="w-5 h-5 text-white" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-ink">Apply to this campaign</p>
                        <p className="text-[12px] text-ink-muted">Write a short pitch about why you're the right fit</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowApply(true)}
                      className="btn-primary text-[13px] py-2.5 px-5"
                    >
                      <Send className="w-4 h-4" /> Apply Now
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleApply}
                  >
                    <p className="text-[13px] font-bold text-ink mb-3">Your pitch</p>
                    <textarea
                      value={pitch}
                      onChange={(e) => setPitch(e.target.value)}
                      placeholder="Tell the brand why you're the perfect fit for this campaign. Mention your audience, past work, and content ideas..."
                      rows={5}
                      maxLength={1000}
                      className="input-light text-[13px] resize-none leading-relaxed mb-2"
                    />
                    <p className="text-[11px] text-ink-muted text-right mb-4">{pitch.length} / 1000</p>
                    <div className="flex items-center gap-3">
                      <button type="submit" disabled={submitting} className="btn-primary text-[13px] py-2.5 px-5 disabled:opacity-60">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Submit Application</>}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowApply(false); setPitch(""); }}
                        className="text-[13px] font-semibold text-ink-muted hover:text-ink transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-black/[0.02] rounded-2xl border border-black/6 p-5 text-center">
              <p className="text-[13px] text-ink-muted font-medium">This campaign is not accepting applications right now.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ── BRAND VIEW: Applications ── */}
      {isBrand && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-[15px] text-ink">
              Applications <span className="text-ink/40 font-normal ml-1">({applications.length})</span>
            </h2>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-0.5">
            {(["ALL", "PENDING", "SHORTLISTED", "APPROVED", "REJECTED"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all ${
                  filterStatus === s
                    ? "bg-violet-50 border border-violet-200 text-violet-700"
                    : "bg-black/[0.03] text-ink/50 hover:text-ink hover:bg-black/[0.06] border border-transparent"
                }`}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()} ({filterCounts[s] ?? 0})
              </button>
            ))}
          </div>

          {filteredApps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/6 py-16 text-center">
              <CalendarDays className="w-8 h-8 text-ink/20 mx-auto mb-3" />
              <p className="text-[14px] font-semibold text-ink mb-1">No applications {filterStatus !== "ALL" ? `with status "${filterStatus}"` : "yet"}</p>
              <p className="text-[12px] text-ink-muted">Once influencers apply, their pitches will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApps.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  onStatusChange={handleStatusChange}
                  acting={actingAppId === app.id}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
