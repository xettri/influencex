import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle2, Building2, Video, Sparkles } from "lucide-react";

type Role = "BRAND" | "INFLUENCER";

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
      if (!res.ok) {
        setError(data.message ?? "Something went wrong.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" ref={ref} className="py-24 sm:py-32 relative">
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[300px] bg-violet-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="section-label mb-4 mx-auto inline-flex">
            <Sparkles className="w-3 h-3" />
            Early Access
          </div>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold text-white leading-tight mb-3">
            Be first. <span className="text-gradient">Get ahead.</span>
          </h2>
          <p className="text-zinc-500 text-[15px] leading-relaxed">
            Join now and get locked-in rates, priority access, and an exclusive early-member badge.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="border-gradient rounded-2xl p-6 sm:p-8"
        >
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">You're on the list</h3>
                <p className="text-[14px] text-zinc-500">
                  We'll reach out to{" "}
                  <span className="text-zinc-300 font-medium">{email}</span> when we're ready for you.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Role toggle */}
                <div>
                  <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { role: "BRAND" as Role, label: "Brand", Icon: Building2 },
                        { role: "INFLUENCER" as Role, label: "Creator", Icon: Video },
                      ] as const
                    ).map(({ role: r, label, Icon }) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-150 ${
                          role === r
                            ? "bg-violet-500/12 border-violet-500/35 text-white"
                            : "bg-white/3 border-white/7 text-zinc-500 hover:text-zinc-300 hover:border-white/14"
                        }`}
                      >
                        <Icon className="w-4 h-4" strokeWidth={1.75} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                    {role === "BRAND" ? "Brand / Company name" : "Your name or handle"}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === "BRAND" ? "e.g. Mamaearth" : "e.g. @yourhandle"}
                    className="input-field"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[13px] text-red-400 bg-red-500/8 border border-red-500/18 rounded-lg px-4 py-3"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 mt-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Secure My Spot
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-zinc-700 pt-1">
                  No spam. No credit card. Unsubscribe anytime.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
