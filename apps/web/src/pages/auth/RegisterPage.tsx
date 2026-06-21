import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Building2,
  Star,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/toast";

type Role = "BRAND" | "INFLUENCER";

const roleCards = [
  {
    role: "BRAND" as Role,
    icon: Building2,
    label: "I'm a Brand",
    desc: "Launch campaigns and find creators",
  },
  {
    role: "INFLUENCER" as Role,
    icon: Star,
    label: "I'm a Creator",
    desc: "Browse campaigns and earn",
  },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [role, setRole] = useState<Role>("BRAND");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ ...form, role });
      toast.success("Account created! Welcome to InfluenceX.");
      navigate("/dashboard");
    } catch {}
  };

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-indigo-700 via-violet-600 to-violet-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/5" />

        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-white/15 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} fill="white" />
            </div>
            <span className="font-display text-[18px] font-extrabold tracking-tight text-white">InfluenceX</span>
          </Link>
        </div>

        <div className="relative space-y-6">
          <div>
            <p className="text-white/50 text-[13px] font-semibold uppercase tracking-widest mb-3">Join the platform</p>
            <h2 className="font-display font-extrabold text-[2.2rem] text-white leading-tight">
              Launch campaigns.<br />
              Build your brand.
            </h2>
            <p className="text-white/60 text-[14px] mt-3 leading-relaxed max-w-xs">
              Free to join. Post your first campaign or apply as a creator — no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "500+", label: "Early members" },
              { value: "₹0", label: "To join" },
              { value: "48h", label: "To go live" },
              { value: "100%", label: "Transparent" },
            ].map(({ value, label }) => (
              <div key={label} className="p-3.5 rounded-xl bg-white/8 border border-white/10">
                <p className="font-display font-extrabold text-[1.5rem] text-white">{value}</p>
                <p className="text-white/50 text-[11px] font-medium mt-0.5">{label}</p>
              </div>
            ))}
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
          className="w-full max-w-[420px]"
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

          <div className="mb-7">
            <h1 className="font-display font-extrabold text-[1.9rem] text-ink leading-tight tracking-tight mb-2">
              Create your account
            </h1>
            <p className="text-[14px] text-ink-muted">Join InfluenceX — it's free</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {roleCards.map(({ role: r, icon: Icon, label, desc }) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  role === r
                    ? "border-violet-500 bg-violet-50/70"
                    : "border-black/8 bg-white hover:border-black/20 hover:bg-white"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                  role === r
                    ? "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm"
                    : "bg-black/6"
                }`}>
                  <Icon className={`w-4.5 h-4.5 w-[18px] h-[18px] ${role === r ? "text-white" : "text-ink/50"}`} strokeWidth={1.75} />
                </div>
                <p className={`text-[13px] font-bold mb-0.5 ${role === r ? "text-violet-700" : "text-ink"}`}>{label}</p>
                <p className="text-[11px] text-ink-muted leading-snug">{desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600 font-medium"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-ink/70 uppercase tracking-wide">
                {role === "BRAND" ? "Brand / Company Name" : "Display Name"}
              </label>
              <input
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder={role === "BRAND" ? "Acme Inc." : "Your creator name"}
                className="input-light w-full"
              />
            </div>

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
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
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
              className="btn-primary w-full justify-center py-3 text-[14px] mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create {role === "BRAND" ? "Brand" : "Creator"} Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-ink-muted pt-1">
              By signing up you agree to our{" "}
              <a href="#" className="underline hover:text-ink">Terms</a> and{" "}
              <a href="#" className="underline hover:text-ink">Privacy Policy</a>
            </p>
          </form>

          <p className="mt-5 text-center text-[13px] text-ink-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
