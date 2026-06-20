import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Creator",
    price: "Free",
    period: "forever",
    desc: "For influencers ready to work with serious brands.",
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
    name: "Brand Starter",
    price: "Flat Fee",
    period: "per campaign",
    desc: "Launch your first product with confidence.",
    features: [
      "Post up to 3 campaigns/month",
      "AI creator recommendations",
      "Campaign criteria & filtering",
      "Digital contract generation",
      "Campaign code tracking (CPC/CPA)",
      "Lock & Hold payment escrow",
      "Dedicated onboarding support",
    ],
    cta: "Launch First Campaign",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Brand Pro",
    price: "Custom",
    period: "volume pricing",
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
    cta: "Talk to Us",
    highlight: false,
  },
];

export function Pricing() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" ref={ref} className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-violet-950/20 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="section-tag mb-4 mx-auto inline-flex">Pricing</div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Transparent. Flat. <span className="text-gradient">Fair.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            No surprise commissions. No hidden fees. Pay a flat rate per campaign and keep full transparency on where your money goes.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 flex flex-col ${
                plan.highlight
                  ? "border-gradient bg-gradient-to-b from-violet-950/60 to-purple-950/40 shadow-2xl shadow-violet-900/30"
                  : "glass border border-white/5"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-violet-600 text-white shadow-lg shadow-violet-900/50">
                    <Sparkles className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-400 mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-4xl font-extrabold ${plan.highlight ? "text-gradient" : "text-white"}`}>
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-500">/ {plan.period}</span>
                </div>
                <p className="text-sm text-slate-400">{plan.desc}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className={plan.highlight ? "btn-primary justify-center" : "btn-secondary justify-center"}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-sm text-slate-500 mt-8"
        >
          Exact pricing announced at launch. Early access members get locked-in rates.
        </motion.p>
      </div>
    </section>
  );
}
