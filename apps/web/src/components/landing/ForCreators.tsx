import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { DollarSign, Inbox, Award, TrendingUp, ArrowRight, Zap } from "lucide-react";

const perks = [
  {
    icon: DollarSign,
    title: "Flat Fee. Always.",
    desc: "No bidding. No race to the bottom. Brands post fixed budgets. You see it upfront and decide if it's worth your time.",
    highlight: true,
  },
  {
    icon: Inbox,
    title: "Get Invited by Top Brands",
    desc: "Build your profile once. Brands come to you. Get exclusive invitations to product launches that match your niche.",
    highlight: false,
  },
  {
    icon: Award,
    title: "CPA Bonuses on Top",
    desc: "Earn your flat fee plus performance bonuses when your audience converts. More impact = more income.",
    highlight: false,
  },
  {
    icon: TrendingUp,
    title: "Your Portfolio Does the Selling",
    desc: "Past campaigns, metrics, and engagement stats are showcased automatically. Let the numbers speak.",
    highlight: false,
  },
];

const tiers = [
  { label: "Nano", range: "1K – 10K", color: "from-slate-500/20 to-slate-600/20", border: "border-slate-500/20" },
  { label: "Micro", range: "10K – 100K", color: "from-violet-500/20 to-purple-600/20", border: "border-violet-500/20" },
  { label: "Mid-tier", range: "100K – 500K", color: "from-blue-500/20 to-cyan-600/20", border: "border-blue-500/20" },
  { label: "Macro", range: "500K+", color: "from-amber-500/20 to-orange-600/20", border: "border-amber-500/20" },
];

export function ForCreators() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="for-creators" ref={ref} className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="section-tag mb-4 mx-auto inline-flex">For Creators</div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Your influence. <br />
            <span className="text-gradient">Your price. Always.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            No more negotiating with 10 different brands. InfluenceX brings exclusive,
            well-paying campaigns to you — pre-filtered to your niche.
          </p>
        </motion.div>

        {/* Perks grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {perks.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`rounded-2xl p-6 glass-hover ${
                  perk.highlight
                    ? "border-gradient bg-gradient-to-br from-violet-950/50 to-purple-950/50"
                    : "glass border border-white/5"
                }`}
              >
                {perk.highlight && (
                  <div className="flex items-center gap-1.5 mb-4">
                    <Zap className="w-3 h-3 text-amber-400" fill="currentColor" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Our USP</span>
                  </div>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  perk.highlight
                    ? "bg-violet-500/20 border border-violet-500/30"
                    : "bg-white/5 border border-white/10"
                }`}>
                  <Icon className={`w-5 h-5 ${perk.highlight ? "text-violet-300" : "text-slate-400"}`} />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{perk.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{perk.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Creator tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass border border-white/5 rounded-3xl p-8"
        >
          <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">
            We work with all creator sizes
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
                className={`rounded-2xl bg-gradient-to-br ${tier.color} border ${tier.border} p-5 text-center glass-hover`}
              >
                <p className="text-lg font-extrabold text-white mb-1">{tier.label}</p>
                <p className="text-xs text-slate-400">{tier.range} followers</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a href="#waitlist" className="btn-primary group mx-auto">
              Join as a Creator
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
