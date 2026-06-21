import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/toast";

const features = [
  { icon: ShieldCheck, text: "Escrow-protected campaigns" },
  { icon: TrendingUp, text: "Real-time ROI tracking" },
  { icon: CheckCircle2, text: "Verified creator network" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";

  const { login, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch {}
  };

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full bg-violet-400/20 -translate-y-1/2" />

        <div className="relative">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-white/15 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} fill="white" />
            </div>
            <span className="font-display text-[18px] font-extrabold tracking-tight text-white leading-none">
              InfluenceX
            </span>
          </a>
        </div>

        <div className="relative space-y-8">
          <div>
            <p className="text-white/50 text-[13px] font-semibold uppercase tracking-widest mb-3">For Brands & Creators</p>
            <h2 className="font-display font-extrabold text-[2.4rem] text-white leading-tight">
              India's smartest<br />
              influencer marketplace
            </h2>
          </div>

          <div className="space-y-3.5">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white/80" strokeWidth={1.75} />
                </div>
                <span className="text-[14px] text-white/75 font-medium">{text}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-white/8 border border-white/12">
            <p className="text-white/60 text-[12px] mb-2">Joining the waitlist</p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["V", "M", "R", "P"].map((l) => (
                  <div key={l} className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 border-2 border-white/20 flex items-center justify-center text-white text-[9px] font-bold">
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-white/70 text-[12px] font-semibold">500+ brands & creators</p>
            </div>
          </div>
        </div>

        <p className="relative text-white/25 text-[12px]">© 2026 InfluenceX · Made for India</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-brand-glow">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} fill="white" />
            </div>
            <span className="font-display text-[17px] font-extrabold tracking-tight text-ink">
              Influence<span className="text-brand">X</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="font-display font-extrabold text-[1.9rem] text-ink leading-tight tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-[14px] text-ink-muted">Sign in to your InfluenceX account</p>
          </div>

          {import.meta.env.VITE_MOCK === "true" && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest mb-2.5">Demo accounts</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ email: "brand@demo.com", password: "demo123" })}
                  className="flex-1 py-2 px-3 rounded-lg bg-white border border-amber-200 text-[12px] font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  Brand Account
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ email: "creator@demo.com", password: "demo123" })}
                  className="flex-1 py-2 px-3 rounded-lg bg-white border border-amber-200 text-[12px] font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  Creator Account
                </button>
              </div>
              <p className="text-[10px] text-amber-600 mt-2 text-center">Password: <span className="font-bold">demo123</span> · No backend needed</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600 font-medium"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-ink/70 uppercase tracking-wide">Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-light w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-ink/70 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-light w-full pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-3 text-[14px] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-ink-muted">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-brand hover:underline">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
