import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Creator",
    badge: null,
    price: "Free",
    per: "forever",
    desc: "For creators ready to work with serious, paying brands.",
    color: "card-white-hover",
    features: [
      "Full profile & portfolio",
      "Apply to unlimited campaigns",
      "Receive brand invitations",
      "Platform contract signing",
      "Escrow payment protection",
      "Campaign dashboard",
    ],
    cta: "Join as Creator",
    ctaClass: "btn-outline w-full",
    highlight: false,
  },
  {
    name: "Brand",
    badge: "Most Popular",
    price: "Flat fee",
    per: "per campaign",
    desc: "Launch your product with zero guesswork and full accountability.",
    color: "bg-gradient-to-b from-[#5B21B6] to-[#4F46E5] border border-violet-600/30",
    features: [
      "Up to 3 campaigns/month",
      "AI creator recommendations",
      "Criteria-based filtering",
      "Digital contract generation",
      "CPC / CPA tracking codes",
      "Lock & Hold escrow",
      "Onboarding support",
    ],
    cta: "Launch First Campaign",
    ctaClass: "btn-white w-full",
    highlight: true,
  },
  {
    name: "Brand Pro",
    badge: null,
    price: "Custom",
    per: "volume pricing",
    desc: "For brands running multiple launches at scale.",
    color: "card-white-hover",
    features: [
      "Unlimited campaigns",
      "Priority creator matching",
      "Dedicated account manager",
      "Advanced analytics",
      "Custom contract templates",
      "Team collaboration",
      "SLA guarantee",
    ],
    cta: "Talk to Sales",
    ctaClass: "btn-outline w-full",
    highlight: false,
  },
];

export function Pricing() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" ref={ref} className="py-24 sm:py-32 bg-section-alt">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="section-pill mb-5 mx-auto inline-flex">Pricing</div>
          <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.25rem)] text-ink leading-tight tracking-tight mb-4">
            Transparent. Flat. <span className="text-brand-gradient">Fair.</span>
          </h2>
          <p className="text-ink-muted text-[15px] max-w-md mx-auto leading-relaxed">
            No surprise commissions. No percentage cuts in fine print.
            You see the number before you commit.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex flex-col rounded-2xl p-7 ${plan.color}`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-white text-violet-700 shadow-md border border-violet-200 tracking-wide">
                    <Sparkles className="w-3 h-3 text-violet-500" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-7">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${plan.highlight ? "text-violet-200" : "text-ink-faint"}`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className={`font-display font-black text-[2.25rem] leading-none ${plan.highlight ? "text-white" : "text-brand-gradient"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-[12px] font-medium ${plan.highlight ? "text-violet-300" : "text-ink-muted"}`}>
                    / {plan.per}
                  </span>
                </div>
                <p className={`text-[13px] leading-snug ${plan.highlight ? "text-violet-200" : "text-ink-muted"}`}>
                  {plan.desc}
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      plan.highlight ? "bg-white/20" : "bg-emerald-50 border border-emerald-200"
                    }`}>
                      <Check className={`w-3 h-3 ${plan.highlight ? "text-white" : "text-emerald-600"}`} strokeWidth={2.5} />
                    </div>
                    <span className={`text-[13px] leading-snug ${plan.highlight ? "text-violet-100" : "text-ink-muted"}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <a href="#waitlist" className={plan.ctaClass}>
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-[12px] text-ink-faint mt-8"
        >
          Exact rates announced at launch. Early access members get locked-in pricing.
        </motion.p>
      </div>
    </section>
  );
}
