import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Creator",
    badge: null,
    price: "Free",
    per: "forever",
    desc: "For influencers ready to work with serious, paying brands.",
    features: [
      "Full creator profile & portfolio",
      "Apply to unlimited campaigns",
      "Receive brand invitations",
      "Contract signing via platform",
      "Escrow payment protection",
      "Campaign performance dashboard",
    ],
    cta: "Join as Creator",
    highlight: false,
  },
  {
    name: "Brand",
    badge: "Most Popular",
    price: "Flat fee",
    per: "per campaign",
    desc: "Launch your product with zero guesswork and full accountability.",
    features: [
      "Post up to 3 campaigns/month",
      "AI creator recommendations",
      "Criteria-based filtering",
      "Digital contract generation",
      "Campaign code tracking (CPC / CPA)",
      "Lock & Hold payment escrow",
      "Onboarding support included",
    ],
    cta: "Launch First Campaign",
    highlight: true,
  },
  {
    name: "Brand Pro",
    badge: null,
    price: "Custom",
    per: "volume pricing",
    desc: "For brands running multiple launches at scale.",
    features: [
      "Unlimited campaigns",
      "Priority creator matching",
      "Dedicated account manager",
      "Advanced analytics & exports",
      "Custom contract templates",
      "Team collaboration tools",
      "SLA guarantee",
    ],
    cta: "Talk to Sales",
    highlight: false,
  },
];

export function Pricing() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" ref={ref} className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-14 max-w-lg"
        >
          <div className="section-label mb-4">Pricing</div>
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold text-white leading-tight mb-4">
            Transparent. Flat. <span className="text-gradient">Fair.</span>
          </h2>
          <p className="text-zinc-500 text-[15px] leading-relaxed">
            No surprise commissions. No percentage cuts hidden in fine print.
            You see the number before you commit.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.09 }}
              className={`relative flex flex-col rounded-2xl p-6 ${
                plan.highlight
                  ? "bg-violet-500/8 border border-violet-500/25 shadow-xl shadow-violet-950/30"
                  : "glass-card"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-6">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-violet-600 text-white shadow-md shadow-violet-900/50">
                    <Sparkles className="w-2.5 h-2.5" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-3">{plan.name}</p>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className={`text-3xl font-black ${plan.highlight ? "text-gradient" : "text-white"}`}>
                    {plan.price}
                  </span>
                  <span className="text-xs text-zinc-600">/ {plan.per}</span>
                </div>
                <p className="text-[13px] text-zinc-500 leading-snug">{plan.desc}</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-7">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="text-[12px] text-zinc-400 leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className={plan.highlight ? "btn-primary" : "btn-secondary"}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-center text-[12px] text-zinc-600 mt-7"
        >
          Exact rates announced at launch. Early access members get locked-in pricing.
        </motion.p>
      </div>
    </section>
  );
}
