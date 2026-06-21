import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SlidersHorizontal, BarChart3, Lock, Cpu, ArrowRight, X, Check, Target } from "lucide-react";

const bentoCells = [
  {
    icon: Target,
    title: "Post your campaign in 5 minutes",
    desc: "Set budget, criteria, timeline, and fee model. Your campaign goes live instantly.",
    span: "lg:col-span-2",
    accent: "from-violet-500 to-indigo-600",
    light: "bg-violet-50",
    iconColor: "text-violet-600",
    large: true,
  },
  {
    icon: Cpu,
    title: "AI creator matching",
    desc: "Our algorithm surfaces the top 5% of relevant creators for your specific product launch.",
    span: "lg:col-span-1",
    accent: "from-indigo-500 to-blue-600",
    light: "bg-indigo-50",
    iconColor: "text-indigo-600",
    large: false,
  },
  {
    icon: SlidersHorizontal,
    title: "Precision targeting",
    desc: "Filter by platform, niche, follower band, engagement rate, and region.",
    span: "lg:col-span-1",
    accent: "from-blue-500 to-cyan-600",
    light: "bg-blue-50",
    iconColor: "text-blue-600",
    large: false,
  },
  {
    icon: BarChart3,
    title: "Real-time analytics",
    desc: "CPC, CPA, and conversion tracked via unique campaign codes. Live dashboards.",
    span: "lg:col-span-1",
    accent: "from-emerald-500 to-teal-600",
    light: "bg-emerald-50",
    iconColor: "text-emerald-600",
    large: false,
  },
  {
    icon: Lock,
    title: "Escrow payment protection",
    desc: "Funds locked before work starts. Creators only paid after delivery is confirmed.",
    span: "lg:col-span-2",
    accent: "from-amber-500 to-orange-600",
    light: "bg-amber-50",
    iconColor: "text-amber-600",
    large: false,
  },
];

const pains = [
  "Influencers ghost after receiving payment",
  "Agencies charge 30% with zero guarantees",
  "No real ROI visibility — pure guesswork",
  "Agreements have no legal backing",
];

const gains = [
  "Flat fee agreed before work begins",
  "Escrow holds budget until delivery",
  "CPA tracked per campaign code",
  "Digital contracts via InfluenceX",
];

export function ForBrands() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="for-brands" ref={ref} className="py-24 sm:py-32 bg-section-alt">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="section-pill mb-5">For Brands</div>
            <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.25rem)] text-ink leading-tight tracking-tight mb-4">
              Stop gambling on
              <br />
              <span className="text-brand-gradient">influencer ROI</span>
            </h2>
            <p className="text-ink-muted text-[15px] leading-relaxed max-w-md">
              Product launches deserve accountability. InfluenceX gives you structure,
              tracking, and legal protection that ad-hoc influencer deals never could.
            </p>
          </motion.div>

          {/* Before / After */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {/* Before */}
            <div className="card-white p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-4">Without InfluenceX</p>
              <div className="space-y-3">
                {pains.map((p) => (
                  <div key={p} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-red-500" strokeWidth={2.5} />
                    </div>
                    <span className="text-[12px] text-ink-muted leading-snug">{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* After */}
            <div className="rounded-[1.25rem] bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500 mb-4">With InfluenceX</p>
              <div className="space-y-3">
                {gains.map((g) => (
                  <div key={g} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-white border border-emerald-200 shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-500" strokeWidth={2.5} />
                    </div>
                    <span className="text-[12px] text-ink font-medium leading-snug">{g}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bento grid */}
        <div className="grid lg:grid-cols-3 gap-4 mb-10">
          {bentoCells.map((cell, i) => {
            const Icon = cell.icon;
            return (
              <motion.div
                key={cell.title}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.15 + i * 0.07 }}
                className={`card-white-hover p-6 ${cell.span} ${cell.large ? "lg:row-span-1" : ""}`}
              >
                <div className={`w-10 h-10 rounded-2xl ${cell.light} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${cell.iconColor}`} strokeWidth={1.75} />
                </div>
                <h3 className="font-display font-bold text-[15px] text-ink mb-2">{cell.title}</h3>
                <p className="text-[13px] text-ink-muted leading-relaxed">{cell.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.5 }}
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
