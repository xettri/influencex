import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, ShieldCheck, Star, Zap, Users } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

const floatingCards = [
  {
    icon: TrendingUp,
    label: "Nike Air Launch",
    value: "+340% ROI",
    sub: "via InfluenceX",
    className: "top-[22%] -left-2 lg:left-10 animate-float-a",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-400/10 border-emerald-400/20",
  },
  {
    icon: Star,
    label: "Creator payout",
    value: "₹2.4L earned",
    sub: "this month",
    className: "top-[38%] -right-2 lg:right-10 animate-float-b",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-400/10 border-violet-400/20",
  },
  {
    icon: ShieldCheck,
    label: "Lock & Hold",
    value: "Escrow secured",
    sub: "15-day release",
    className: "bottom-[28%] -left-2 lg:left-16 animate-float-c",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-400/10 border-blue-400/20",
  },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-14">
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid opacity-100 pointer-events-none" />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-violet-700/12 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      {/* Top edge fade */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#030305] to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div {...fadeUp(0)} className="flex justify-center mb-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/8 border border-violet-500/18 text-violet-300 text-[11px] font-bold tracking-widest uppercase">
            <Zap className="w-3 h-3" fill="currentColor" />
            Exclusive · Transparent · Results-first
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.08)}
          className="text-[clamp(2.6rem,8vw,5.5rem)] font-black leading-[1.02] tracking-tight mb-6"
        >
          <span className="text-white">Launch Products.</span>
          <br />
          <span className="text-gradient">Not Guesses.</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          {...fadeUp(0.16)}
          className="max-w-xl mx-auto text-[clamp(1rem,2.5vw,1.15rem)] text-zinc-400 leading-relaxed mb-10"
        >
          The only platform built exclusively for{" "}
          <span className="text-zinc-200 font-medium">product launch campaigns</span>.
          Flat-fee pricing, escrow payments, and contracts — all in one place.
        </motion.p>

        {/* CTA row */}
        <motion.div
          {...fadeUp(0.22)}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14"
        >
          <a href="#waitlist" className="btn-primary text-sm py-3 px-7 glow-sm w-full sm:w-auto">
            Get Early Access — Free
            <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#how-it-works" className="btn-secondary text-sm py-3 px-7 w-full sm:w-auto">
            See How It Works
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          {...fadeUp(0.28)}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
        >
          {/* Avatars */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {["#7c3aed", "#6366f1", "#8b5cf6", "#4f46e5", "#a78bfa"].map((bg, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-[#030305] flex items-center justify-center"
                  style={{ background: bg, zIndex: 5 - i }}
                >
                  <Users className="w-3 h-3 text-white/80" />
                </div>
              ))}
            </div>
            <span className="text-[13px] text-zinc-500">
              <span className="text-zinc-300 font-semibold">500+ creators</span> on waitlist
            </span>
          </div>

          <div className="w-px h-4 bg-white/10 hidden sm:block" />

          {/* Stars */}
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-[13px] text-zinc-500">
              <span className="text-zinc-300 font-semibold">5.0</span> pilot rating
            </span>
          </div>
        </motion.div>
      </div>

      {/* Floating cards — hidden on small screens */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        {floatingCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`absolute ${card.className}`}>
              <div className="glass rounded-xl px-3.5 py-3 flex items-center gap-3 min-w-[176px] shadow-xl shadow-black/40">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${card.iconBg}`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 mb-0.5">{card.label}</p>
                  <p className="text-sm font-bold text-white leading-tight">{card.value}</p>
                  <p className="text-[11px] text-zinc-600">{card.sub}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#030305] to-transparent pointer-events-none" />
    </section>
  );
}
