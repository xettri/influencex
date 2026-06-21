import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Megaphone, Users, FileCheck, Banknote, ArrowRight } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Megaphone,
    title: "Brand posts a campaign",
    desc: "Set your product launch goal, flat-fee or CPA budget, and creator criteria. No bidding. No auctions.",
    color: "from-violet-500 to-purple-600",
    light: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    num: "02",
    icon: Users,
    title: "Creators apply or get invited",
    desc: "Top-matched creators apply. Or brands invite directly from the marketplace. AI surfaces the best 5%.",
    color: "from-indigo-500 to-blue-600",
    light: "bg-indigo-50",
    text: "text-indigo-600",
  },
  {
    num: "03",
    icon: FileCheck,
    title: "Contracts & budget locked",
    desc: "Digital contracts via InfluenceX. 50% budget goes into escrow before any work begins.",
    color: "from-blue-500 to-cyan-600",
    light: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    num: "04",
    icon: Banknote,
    title: "Deliver, track & get paid",
    desc: "Creator delivers content. CPA tracked via campaign code. Payment auto-releases after 15 days.",
    color: "from-emerald-500 to-teal-600",
    light: "bg-emerald-50",
    text: "text-emerald-600",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" ref={ref} className="py-24 sm:py-32 bg-canvas relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 dot-grid opacity-40" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="section-pill mb-5 mx-auto inline-flex">Process</div>
          <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.25rem)] text-ink leading-tight tracking-tight mb-4">
            From campaign to payout
            <br />
            <span className="text-brand-gradient">in four clean steps</span>
          </h2>
          <p className="text-ink-muted text-[15px] max-w-md mx-auto leading-relaxed">
            No ambiguity. No chasing invoices. A structured flow that protects both sides.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px">
            <div className="h-px bg-gradient-to-r from-violet-300 via-blue-300 to-emerald-300" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 28 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="card-white-hover p-6 relative"
                >
                  {/* Step badge */}
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-md relative z-10`}>
                    <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>

                  {/* Step number watermark */}
                  <span className="absolute top-4 right-4 text-6xl font-black text-ink/4 select-none font-display leading-none">
                    {step.num}
                  </span>

                  <h3 className="font-display font-bold text-[15px] text-ink mb-2 leading-snug">{step.title}</h3>
                  <p className="text-[13px] text-ink-muted leading-relaxed">{step.desc}</p>

                  {/* Arrow for mobile/tablet */}
                  {i < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-5">
                      <ArrowRight className="w-4 h-4 text-ink-faint rotate-90 sm:rotate-0" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
