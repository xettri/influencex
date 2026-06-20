import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Target, BarChart3, Shield, UserCheck, ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Precision Targeting",
    desc: "Set exact criteria — platform, niche, follower range, engagement rate, region. Only qualified creators see your campaign.",
  },
  {
    icon: BarChart3,
    title: "Real Campaign Analytics",
    desc: "Track clicks, conversions, and CPA in real-time with unique campaign codes. Know exactly what's working.",
  },
  {
    icon: Shield,
    title: "Escrow-Protected Budget",
    desc: "Your budget is locked and held. Creators only get paid after delivery. Full refund if terms aren't met.",
  },
  {
    icon: UserCheck,
    title: "AI-Recommended Creators",
    desc: "InfluenceX surfaces the top 5% of matching creators for your campaign automatically — saving hours of review.",
  },
];

const painPoints = [
  "Chasing influencers who ghost after payment",
  "Paying premium agencies for average results",
  "Guessing ROI with no real tracking",
  "Contracts that protect nobody",
];

export function ForBrands() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="for-brands" ref={ref} className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className="section-tag mb-4">For Brands</div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
                Stop gambling on <br />
                <span className="text-gradient">influencer ROI</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Every product launch deserves creators who are accountable. InfluenceX gives you
                the tools to find, vet, contract, and track — all in one place.
              </p>

              {/* Pain points */}
              <div className="mb-8">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Sound familiar?
                </p>
                <div className="space-y-2">
                  {painPoints.map((pain) => (
                    <div key={pain} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-400 text-xs font-bold">✕</span>
                      </div>
                      <span className="text-sm text-slate-400">{pain}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a href="#waitlist" className="btn-primary group">
                Post Your First Campaign Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </div>

          {/* Right: Feature cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                  className="glass border border-violet-500/10 rounded-2xl p-5 glass-hover"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 glass border border-violet-500/10 rounded-2xl p-6 flex flex-wrap items-center justify-center gap-8"
        >
          {[
            "Flat fee clarity",
            "Digital contracts included",
            "Escrow payment protection",
            "Dedicated campaign manager",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-slate-300 font-medium">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
