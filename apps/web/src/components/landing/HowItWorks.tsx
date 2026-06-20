import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Megaphone, Users, FileCheck, Banknote, ArrowRight } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Megaphone,
    title: "Brand Posts a Campaign",
    desc: "Define your product launch goal, budget, and creator criteria. Set flat-fee or CPA terms — no bidding wars.",
    color: "violet",
    gradient: "from-violet-600/20 to-purple-600/20",
    border: "border-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    num: "02",
    icon: Users,
    title: "Creators Apply or Get Invited",
    desc: "Top-matched creators apply with a pitch, or brands invite directly from the marketplace. AI recommends the best fit.",
    color: "blue",
    gradient: "from-blue-600/20 to-cyan-600/20",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    num: "03",
    icon: FileCheck,
    title: "Contracts & Upfront Secured",
    desc: "Digital contracts signed through InfluenceX. 50% budget locked into escrow before any work begins.",
    color: "emerald",
    gradient: "from-emerald-600/20 to-teal-600/20",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    num: "04",
    icon: Banknote,
    title: "Deliver & Get Paid",
    desc: "Creator delivers content. Payment releases automatically after 15 days. CPA bonuses tracked via campaign code.",
    color: "amber",
    gradient: "from-amber-600/20 to-orange-600/20",
    border: "border-amber-500/20",
    iconColor: "text-amber-400",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" ref={ref} className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="section-tag mb-4 mx-auto inline-flex">Process</div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            From campaign to payout <br />
            <span className="text-gradient">in 4 steps</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            No ambiguity. No chasing payments. No surprise fees. Just a clean process that works for both sides.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-violet-500/30 via-blue-500/30 via-emerald-500/30 to-amber-500/30" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                <div className={`glass border ${step.border} rounded-2xl p-6 h-full glass-hover`}>
                  {/* Icon circle */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} border ${step.border} flex items-center justify-center mb-5 relative z-10`}>
                    <Icon className={`w-6 h-6 ${step.iconColor}`} />
                  </div>

                  {/* Step number */}
                  <div className="absolute top-4 right-4 text-4xl font-black text-white/4 select-none">
                    {step.num}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>

                  {/* Arrow for non-last items */}
                  {i < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-4">
                      <ArrowRight className="w-4 h-4 text-slate-600 rotate-90" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
