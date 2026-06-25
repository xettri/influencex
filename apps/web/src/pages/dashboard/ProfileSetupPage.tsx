import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Plus, Trash2, CheckCircle2, Clock, Loader2, X, ShieldCheck, Copy, AlertCircle,
} from "lucide-react";
import type { InfluencerProfile, Platform, PlatformName, RateCard } from "@influencex/shared";
import { UpdateInfluencerProfileSchema, AddPlatformSchema } from "@influencex/shared";
import { api } from "@/lib/api";
import { toast } from "@/store/toast";
import { useSocialPreview } from "@/hooks/useSocialPreview";
import { SocialPreviewCard } from "@/components/dashboard/SocialPreviewCard";
import { AuthenticityPanel } from "@/components/dashboard/AuthenticityPanel";

const PLATFORMS: { value: PlatformName; label: string; color: string; url: (handle: string) => string }[] = [
  { value: "INSTAGRAM", label: "Instagram", color: "bg-pink-500", url: (h) => `https://instagram.com/${h}` },
  { value: "YOUTUBE", label: "YouTube", color: "bg-red-500", url: (h) => `https://youtube.com/@${h}` },
  { value: "TIKTOK", label: "TikTok", color: "bg-black", url: (h) => `https://tiktok.com/@${h}` },
  { value: "TWITTER", label: "Twitter / X", color: "bg-sky-500", url: (h) => `https://x.com/${h}` },
  { value: "LINKEDIN", label: "LinkedIn", color: "bg-blue-700", url: (h) => `https://linkedin.com/in/${h}` },
  { value: "PINTEREST", label: "Pinterest", color: "bg-red-600", url: (h) => `https://pinterest.com/${h}` },
];

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-black/6 p-6">
      <div className="mb-5">
        <h3 className="font-display font-bold text-[15px] text-ink">{title}</h3>
        {subtitle && <p className="text-[12px] text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function TagInput({ tags, onAdd, onRemove, placeholder }: {
  tags: string[];
  onAdd: (t: string) => void;
  onRemove: (t: string) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");
  const commit = () => {
    const v = input.trim().replace(/,$/, "");
    if (v && !tags.includes(v)) onAdd(v);
    setInput("");
  };
  return (
    <div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 text-[12px] font-semibold">
              {t}
              <button type="button" onClick={() => onRemove(t)} className="text-violet-400 hover:text-violet-700 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); } }}
        placeholder={placeholder}
        className="input-light text-[14px]"
      />
      <p className="text-[11px] text-ink-muted mt-1">Press Enter or comma to add</p>
    </div>
  );
}

interface PlatformCardProps {
  platform: Platform;
  onRemove: (id: string) => void;
  onRequestVerify: (id: string) => void;
  removing: boolean;
  requestingVerify: boolean;
}

function PlatformCard({ platform, onRemove, onRequestVerify, removing, requestingVerify }: PlatformCardProps) {
  const meta = PLATFORMS.find((pl) => pl.value === platform.name);
  const status = platform.verificationStatus ?? "UNVERIFIED";

  const copyCode = () => {
    if (!platform.verificationCode) return;
    navigator.clipboard.writeText(platform.verificationCode);
    toast.success("Code copied to clipboard!");
  };

  return (
    <motion.div
      key={platform.id}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="rounded-xl border border-black/6 overflow-hidden"
    >
      {/* Header row */}
      <div className="flex items-center gap-3 p-3.5 bg-black/[0.02]">
        <div className={`w-8 h-8 rounded-lg ${meta?.color ?? "bg-gray-400"} flex items-center justify-center shrink-0`}>
          <span className="text-white text-[10px] font-black">{platform.name.slice(0, 2)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-ink">{meta?.label ?? platform.name}</p>
          <p className="text-[11px] text-ink-muted">@{platform.handle} · {platform.followers.toLocaleString("en-IN")} followers</p>
        </div>

        {status === "VERIFIED" && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </span>
        )}
        {status === "PENDING" && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold whitespace-nowrap">
            <Clock className="w-3 h-3" /> Pending
          </span>
        )}
        {status === "FAILED" && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold whitespace-nowrap">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        )}
        {status === "UNVERIFIED" && (
          <span className="px-2 py-0.5 rounded-full bg-black/[0.04] border border-black/8 text-ink/40 text-[10px] font-bold whitespace-nowrap">
            Unverified
          </span>
        )}

        <button
          type="button"
          onClick={() => onRemove(platform.id)}
          disabled={removing}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-ink/25 hover:text-red-500 hover:bg-red-50 transition-all ml-1"
        >
          {removing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Verification panel — UNVERIFIED or FAILED */}
      {(status === "UNVERIFIED" || status === "FAILED") && platform.verificationCode && (
        <div className={`p-4 border-t border-black/6 ${status === "FAILED" ? "bg-red-50/40" : "bg-violet-50/30"}`}>
          {status === "FAILED" && (
            <p className="text-[11px] font-bold text-red-600 uppercase tracking-wide mb-3">
              Verification failed — please try again
            </p>
          )}
          {status === "UNVERIFIED" && (
            <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wide mb-3">
              Verify your {meta?.label} account
            </p>
          )}

          <div className="flex items-center gap-2 mb-3">
            <code className="flex-1 py-2 px-3 rounded-lg bg-white border border-violet-200 font-mono text-[15px] font-bold text-violet-700 tracking-widest text-center select-all">
              {platform.verificationCode}
            </code>
            <button
              type="button"
              onClick={copyCode}
              title="Copy code"
              className="shrink-0 p-2.5 rounded-lg bg-white border border-violet-200 text-violet-600 hover:bg-violet-50 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-ink-muted leading-relaxed mb-3">
            Add this code anywhere in your {meta?.label} bio or profile description.
            Once added, click <strong>Request Verification</strong> — our team will verify within 24–48 hours.{" "}
            {meta?.url && (
              <a href={meta.url(platform.handle)} target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">
                Open {meta.label} →
              </a>
            )}
          </p>

          <button
            type="button"
            onClick={() => onRequestVerify(platform.id)}
            disabled={requestingVerify}
            className="btn-primary text-[12px] py-2 px-4 disabled:opacity-60"
          >
            {requestingVerify
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <><ShieldCheck className="w-3.5 h-3.5" /> Request Verification</>
            }
          </button>
        </div>
      )}

      {/* Pending panel */}
      {status === "PENDING" && (
        <div className="p-4 border-t border-black/6 bg-amber-50/40">
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[12px] font-semibold text-amber-800">Verification in progress</p>
              <p className="text-[11px] text-amber-700/70 mt-0.5 leading-relaxed">
                Our team is reviewing your {meta?.label} profile. This usually takes 24–48 hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function ProfileSetupPage() {
  const [profile, setProfile] = useState<InfluencerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingPlatform, setAddingPlatform] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [requestingVerifyId, setRequestingVerifyId] = useState<string | null>(null);

  const [form, setForm] = useState({ displayName: "", bio: "", location: "" });
  const [niches, setNiches] = useState<string[]>([]);
  const [rateCard, setRateCard] = useState<RateCard>({});

  const [newPlatform, setNewPlatform] = useState<{ name: PlatformName; handle: string; followers: string }>({
    name: "INSTAGRAM",
    handle: "",
    followers: "",
  });

  const socialPreview = useSocialPreview(newPlatform.name, newPlatform.handle);

  useEffect(() => {
    api.get<InfluencerProfile>("/api/v1/influencers/me")
      .then((data) => {
        setProfile(data);
        setForm({ displayName: data.displayName, bio: data.bio ?? "", location: data.location ?? "" });
        setNiches(data.niche ?? []);
        setRateCard((data.rateCard as RateCard) ?? {});
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      displayName: form.displayName || undefined,
      bio: form.bio || undefined,
      location: form.location || undefined,
      niche: niches,
      rateCard,
    };
    const result = UpdateInfluencerProfileSchema.safeParse(payload);
    if (!result.success) { toast.error(result.error.errors[0]?.message ?? "Validation error"); return; }

    setSaving(true);
    try {
      const updated = await api.patch<InfluencerProfile>("/api/v1/influencers/me", payload);
      setProfile(updated);
      toast.success("Profile saved!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: newPlatform.name, handle: newPlatform.handle, followers: Number(newPlatform.followers) };
    const result = AddPlatformSchema.safeParse(payload);
    if (!result.success) { toast.error(result.error.errors[0]?.message ?? "Validation error"); return; }

    setAddingPlatform(true);
    try {
      await api.post<Platform>("/api/v1/influencers/me/platforms", payload);
      const updated = await api.get<InfluencerProfile>("/api/v1/influencers/me");
      setProfile(updated);
      setNewPlatform({ name: "INSTAGRAM", handle: "", followers: "" });
      toast.success(`${newPlatform.name} added! Check the verification code below.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add platform");
    } finally {
      setAddingPlatform(false);
    }
  };

  const handleRemovePlatform = async (platformId: string) => {
    setRemovingId(platformId);
    try {
      await api.del(`/api/v1/influencers/me/platforms/${platformId}`);
      const updated = await api.get<InfluencerProfile>("/api/v1/influencers/me");
      setProfile(updated);
      toast.success("Platform removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setRemovingId(null);
    }
  };

  const handleRequestVerify = async (platformId: string) => {
    setRequestingVerifyId(platformId);
    try {
      await api.post(`/api/v1/influencers/me/platforms/${platformId}/request-verify`, {});
      const updated = await api.get<InfluencerProfile>("/api/v1/influencers/me");
      setProfile(updated);
      toast.success("Verification requested! We'll review within 24–48 hours.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to request verification");
    } finally {
      setRequestingVerifyId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-2xl bg-white border border-black/6 animate-pulse" />)}
      </div>
    );
  }

  const verifiedCount = profile?.platforms.filter((p) => p.verificationStatus === "VERIFIED").length ?? 0;
  const pendingCount = profile?.platforms.filter((p) => p.verificationStatus === "PENDING").length ?? 0;

  return (
    <div className="max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Creator Account</p>
        <h1 className="font-display font-extrabold text-[1.75rem] text-ink tracking-tight">My Profile</h1>

        {profile && (
          <div className={`mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border ${
            profile.verified
              ? "bg-emerald-50 border-emerald-200"
              : pendingCount > 0
              ? "bg-amber-50 border-amber-200"
              : profile.profileCompleted
              ? "bg-violet-50 border-violet-200"
              : "bg-black/[0.02] border-black/8"
          }`}>
            {profile.verified ? (
              <><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-[13px] font-semibold text-emerald-700">
                  Your profile is verified — you're visible in the creator directory.
                  {verifiedCount > 0 && ` ${verifiedCount} platform${verifiedCount > 1 ? "s" : ""} verified.`}
                </p></>
            ) : pendingCount > 0 ? (
              <><Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-[13px] font-semibold text-amber-700">
                  {pendingCount} platform{pendingCount > 1 ? "s" : ""} pending verification — our team will review within 24–48 hours.
                </p></>
            ) : profile.profileCompleted ? (
              <><ShieldCheck className="w-4 h-4 text-violet-600 shrink-0" />
                <p className="text-[13px] font-semibold text-violet-700">
                  Profile complete! Verify your social handles below to unlock full visibility.
                </p></>
            ) : (
              <><ShieldCheck className="w-4 h-4 text-ink/40 shrink-0" />
                <p className="text-[13px] font-semibold text-ink/50">
                  Complete your profile to appear in the creator directory and receive hire requests.
                </p></>
            )}
          </div>
        )}
      </motion.div>

      {/* Authenticity score */}
      {profile && (profile.authenticityScore > 0 || profile.platforms.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-4">
          <div className="bg-white rounded-2xl border border-black/6 p-6">
            <h3 className="font-display font-bold text-[15px] text-ink mb-5">Your authenticity score</h3>
            <AuthenticityPanel
              score={profile.authenticityScore}
              flags={profile.qualityFlags ?? []}
              platforms={(profile.platforms ?? []).map((p) => ({
                name: p.name,
                handle: p.handle,
                verificationStatus: p.verificationStatus,
                verificationMethod: p.verificationMethod ?? null,
                followers: p.followers,
                apiFollowerCount: p.apiFollowerCount ?? null,
                apiEngagementRate: p.apiEngagementRate ?? null,
              }))}
              isOwner
            />
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Section title="Basic info">
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">Display name *</label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                  placeholder="Your creator name"
                  className="input-light text-[14px]"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell brands about you, your audience, and what makes your content unique..."
                  rows={4}
                  maxLength={500}
                  className="input-light text-[14px] resize-none leading-relaxed"
                />
                <p className="text-[11px] text-ink-muted text-right mt-1">{form.bio.length} / 500</p>
              </div>
              <div>
                <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Mumbai, India"
                  className="input-light text-[14px]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">Niches / Categories</label>
                <TagInput
                  tags={niches}
                  onAdd={(t) => setNiches((p) => [...p, t])}
                  onRemove={(t) => setNiches((p) => p.filter((n) => n !== t))}
                  placeholder="e.g. fitness, fashion, tech..."
                />
              </div>
            </div>
          </Section>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Section title="Your rate card" subtitle="Brands see this when browsing your profile. You're free to negotiate.">
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "perPost" as keyof RateCard, label: "Per Post (₹)" },
                { key: "perReel" as keyof RateCard, label: "Per Reel / Short (₹)" },
                { key: "perVideo" as keyof RateCard, label: "Per Long Video (₹)" },
                { key: "perStory" as keyof RateCard, label: "Per Story (₹)" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wide block mb-1.5">{label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-[14px] font-semibold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={rateCard[key] ?? ""}
                      onChange={(e) => setRateCard((p) => ({ ...p, [key]: e.target.value ? Number(e.target.value) : undefined }))}
                      placeholder="0"
                      className="input-light text-[14px] pl-7"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <button type="submit" disabled={saving} className="btn-primary text-[14px] py-3 px-6 disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save profile</>}
          </button>
        </motion.div>
      </form>

      {/* Social Platforms */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-4">
        <Section
          title="Social platforms"
          subtitle="Add your platforms and verify each handle so brands know they're authentic."
        >
          <AnimatePresence>
            {(profile?.platforms ?? []).length > 0 && (
              <div className="space-y-3 mb-5">
                {(profile?.platforms ?? []).map((p) => (
                  <PlatformCard
                    key={p.id}
                    platform={p}
                    onRemove={handleRemovePlatform}
                    onRequestVerify={handleRequestVerify}
                    removing={removingId === p.id}
                    requestingVerify={requestingVerifyId === p.id}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAddPlatform} className="space-y-3">
            <p className="text-[11px] font-bold text-ink/60 uppercase tracking-wide">Add a platform</p>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] text-ink-muted mb-1 block">Platform</label>
                <select
                  value={newPlatform.name}
                  onChange={(e) => setNewPlatform((p) => ({ ...p, name: e.target.value as PlatformName }))}
                  className="input-light text-[13px] py-2.5"
                >
                  {PLATFORMS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-ink-muted mb-1 block">Handle</label>
                <input
                  type="text"
                  value={newPlatform.handle}
                  onChange={(e) => setNewPlatform((p) => ({ ...p, handle: e.target.value }))}
                  placeholder="@yourhandle"
                  className="input-light text-[13px]"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-ink-muted mb-1 block">Followers</label>
                <input
                  type="number"
                  min="0"
                  value={newPlatform.followers}
                  onChange={(e) => setNewPlatform((p) => ({ ...p, followers: e.target.value }))}
                  placeholder="10000"
                  className="input-light text-[13px]"
                  required
                />
              </div>
            </div>

            <SocialPreviewCard
              status={socialPreview.status}
              data={socialPreview.data}
              platform={newPlatform.name}
              handle={newPlatform.handle}
            />

            <button type="submit" disabled={addingPlatform} className="btn-outline text-[13px] py-2.5 px-4 disabled:opacity-60">
              {addingPlatform ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Plus className="w-3.5 h-3.5" /> Add platform</>}
            </button>
          </form>
        </Section>
      </motion.div>
    </div>
  );
}
