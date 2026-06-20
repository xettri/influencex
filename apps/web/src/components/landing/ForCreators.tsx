import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  BadgeDollarSign,
  MailOpen,
  TrendingUp,
  LayoutDashboard,
  ArrowRight,
  Zap,
} from "lucide-react";

const perks = [
  {
    icon: BadgeDollarSign,
    title: "Flat fee, always visible",
    desc: "Brands post a fixed budget upfront. You see exactly what you'll earn before you apply — no negotiation, no race to the bottom.",
    usp: true,
  },
  {
    icon: MailOpen,
    title: "Brands come to you",
    desc: "Build your profile once. Top brands send direct invitations for exclusive launches matched to your niche and platform.",
    usp: false,
  },
  {
    icon: TrendingUp,
    title: "CPA bonuses on top",
    desc: "Earn your flat fee plus performance bonuses when your audience converts. Your actual impact, rewarded.",
    usp: false,
  },
  {
    icon: LayoutDashboard,
    title: "Your stats do the selling",
    desc: "Engagement rates, past campaign performance, and verified metrics are displayed automatically on your profile.",
    usp: false,
  },
];

const tiers = [
  { name: "Nano", range: "1K – 10K", color: "bg-white/4 border-white/8 text-zinc-400" },
  { name: "Micro", range: "10K – 100K", color: "bg-violet-500/8 border-violet-500/20 text-violet-300" },
  { name: "Mid-tier", range: "100K – 500K", color: "bg-indigo-500/8 border-indigo-500/20 text-indigo-300" },
  { name: "Macro", range: "500K+", color: "bg-amber-500/8 border-amber-500/20 text-amber-300" },
];

export function ForCreators() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="for-creators" ref={ref} className="py-24 sm:py-32 relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <div className="section-label mb-4">For Creators</div>
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold text-white leading-tight mb-4">
            Your influence.<br />
            <span className="text-gradient">Your price. Always.</span>
          </h2>
          <p className="text-zinc-500 text-[15px] max-w-md leading-relaxed">
            No more negotiating with 10 brands over DM. InfluenceX brings
            exclusive, well-paid campaigns to you — pre-filtered to your niche.
          </p>
        </motion.div>

        {/* Perk cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {perks.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className={`rounded-2xl p-5 relative overflow-hidden ${
                  perk.usp
                    ? "bg-violet-500/8 border border-violet-500/22"
                    : "glass-card"
                }`}
              >
                {perk.usp && (
                  <div className="flex items-center gap-1.5 mb-4">
                    <Zap className="w-3 h-3 text-amber-400" fill="currentColor" />
                    <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">Our USP</span>
                  </div>
                )}
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-4 ${
                  perk.usp
                    ? "bg-violet-500/12 border-violet-400/25"
                    : "bg-white/4 border-white/8"
                }`}>
                  <Icon className={`w-4 h-4 ${perk.usp ? "text-violet-300" : "text-zinc-400"}`} strokeWidth={1.75} />
                </div>
                <h3 className="text-[13px] font-semibold text-white mb-1.5">{perk.title}</h3>
                <p className="text-[12px] text-zinc-500 leading-relaxed">{perk.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Creator tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.32 }}
          className="glass-card rounded-2xl p-6"
        >
          <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-5 text-center">
            All creator sizes welcome
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`rounded-xl border px-4 py-4 text-center transition-all ${t.color}`}
              >
                <p className="text-[15px] font-bold mb-0.5">{t.name}</p>
                <p className="text-[11px] text-zinc-600">{t.range}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <a href="#waitlist" className="btn-primary">
              Join as a Creator
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
