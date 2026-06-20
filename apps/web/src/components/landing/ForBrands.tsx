import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  SlidersHorizontal,
  BarChart3,
  Lock,
  Cpu,
  ArrowRight,
  X,
  Check,
} from "lucide-react";

const features = [
  {
    icon: SlidersHorizontal,
    title: "Precision targeting",
    desc: "Filter by platform, niche, follower band, engagement rate, and region. Only eligible creators see your campaign.",
  },
  {
    icon: BarChart3,
    title: "Real attribution",
    desc: "Track clicks and conversions via unique campaign codes. Know your CPC and CPA in real time, not estimates.",
  },
  {
    icon: Lock,
    title: "Escrow-protected budget",
    desc: "Funds are locked before work starts. Creators get paid only after delivery is confirmed.",
  },
  {
    icon: Cpu,
    title: "AI-matched creators",
    desc: "Our ranking model surfaces the top 5% of qualified applicants so you skip hours of manual review.",
  },
];

const pains = [
  "Chasing influencers who ghost after payment",
  "Paying agencies 30% for average matching",
  "Zero ROI visibility, pure guesswork",
  "Verbal agreements with no legal backing",
];

const gains = [
  "Flat-fee clarity before you commit",
  "Escrow holds funds until delivery",
  "CPA tracking via unique campaign codes",
  "Digital contracts signed via InfluenceX",
];

export function ForBrands() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="for-brands" ref={ref} className="py-24 sm:py-32 relative">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <div className="section-label mb-4">For Brands</div>
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold text-white leading-tight mb-4">
            Stop gambling on<br />
            <span className="text-gradient">influencer ROI</span>
          </h2>
          <p className="text-zinc-500 text-[15px] max-w-md leading-relaxed">
            Every product launch deserves measurable results. InfluenceX gives you the structure that ad-hoc influencer deals never could.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Before / After */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="glass-card rounded-2xl p-6"
          >
            <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-5">Without InfluenceX</p>
            <div className="space-y-3">
              {pains.map((p) => (
                <div key={p} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-red-400" strokeWidth={2.5} />
                  </div>
                  <span className="text-[13px] text-zinc-500 leading-snug">{p}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6"
          >
            <p className="text-[11px] font-bold text-violet-400/70 uppercase tracking-widest mb-5">With InfluenceX</p>
            <div className="space-y-3">
              {gains.map((g) => (
                <div key={g} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" strokeWidth={2.5} />
                  </div>
                  <span className="text-[13px] text-zinc-300 leading-snug">{g}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                className="glass-card rounded-xl p-5"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-500/8 border border-violet-500/18 flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4 text-violet-400" strokeWidth={1.75} />
                </div>
                <h3 className="text-[13px] font-semibold text-white mb-1.5">{f.title}</h3>
                <p className="text-[12px] text-zinc-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <a href="#waitlist" className="btn-primary">
            Post Your First Campaign Free
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
