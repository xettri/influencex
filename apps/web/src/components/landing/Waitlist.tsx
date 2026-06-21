import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle2, Building2, Video, Sparkles, ShieldCheck, BadgeDollarSign, Zap } from "lucide-react";

type Role = "BRAND" | "INFLUENCER";

const perks = [
  { icon: BadgeDollarSign, label: "Locked-in early rates" },
  { icon: Zap, label: "Priority platform access" },
  { icon: ShieldCheck, label: "Exclusive early-member badge" },
];

export function Waitlist() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [role, setRole] = useState<Role>("BRAND");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = import.meta.env.VITE_API_URL ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!apiBase) {
      await new Promise((r) => setTimeout(r, 900));
      setSuccess(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/v1/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? "Something went wrong."); return; }
      setSuccess(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" ref={ref} className="py-24 sm:py-32 relative overflow-hidden bg-cta-gradient">
      {/* Dot grid overlay */}
      <div className="absolute inset-0 dot-grid opacity-20" />

      {/* Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 60%)" }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-[11px] font-black uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" />
              Early Access
            </div>
            <h2 className="font-display font-extrabold text-[clamp(2.2rem,5vw,3.5rem)] text-white leading-tight tracking-tight mb-5">
              Be first.
              <br />
              Get ahead.
            </h2>
            <p className="text-violet-200 text-[16px] leading-relaxed mb-10 max-w-md">
              Join the waitlist and secure your spot before we open to the public.
              Early members get permanent rate advantages.
            </p>

            <div className="space-y-4">
              {perks.map((perk) => {
                const Icon = perk.icon;
                return (
                  <div key={perk.label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-[15px] font-semibold text-white">{perk.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="bg-white rounded-3xl p-7 sm:p-8 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.3)]">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-10"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="font-display font-extrabold text-2xl text-ink mb-2">You're on the list!</h3>
                    <p className="text-[14px] text-ink-muted">
                      We'll reach out to{" "}
                      <span className="text-ink font-semibold">{email}</span>{" "}
                      when we're ready for you.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div>
                      <p className="font-display font-bold text-[18px] text-ink mb-1">Secure your spot</p>
                      <p className="text-[13px] text-ink-muted">No credit card. No commitment.</p>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="text-[11px] font-bold text-ink-muted uppercase tracking-widest block mb-2">I am a</label>
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          { role: "BRAND" as Role, label: "Brand", Icon: Building2 },
                          { role: "INFLUENCER" as Role, label: "Creator", Icon: Video },
                        ] as const).map(({ role: r, label, Icon }) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold border-2 transition-all duration-150 ${
                              role === r
                                ? "bg-brand-faint border-brand text-brand"
                                : "bg-transparent border-black/10 text-ink-muted hover:border-black/25 hover:text-ink"
                            }`}
                          >
                            <Icon className="w-4 h-4" strokeWidth={2} />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="text-[11px] font-bold text-ink-muted uppercase tracking-widest block mb-2">
                        {role === "BRAND" ? "Brand / Company name" : "Your name or handle"}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={role === "BRAND" ? "e.g. Mamaearth" : "e.g. @yourhandle"}
                        className="input-light"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-[11px] font-bold text-ink-muted uppercase tracking-widest block mb-2">Email address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input-light"
                      />
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                      >
                        {error}
                      </motion.p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full py-4 text-[15px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100"
                    >
                      {loading
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <><span>Secure My Spot</span><ArrowRight className="w-5 h-5" /></>
                      }
                    </button>

                    <p className="text-[11px] text-center text-ink-faint">
                      No spam. No credit card. Unsubscribe anytime.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
