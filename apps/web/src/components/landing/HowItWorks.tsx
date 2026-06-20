import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Megaphone, Users, FileCheck, Banknote } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Megaphone,
    title: "Brand posts a campaign",
    desc: "Define your product launch, set flat-fee or CPA budget, and specify creator criteria. No auction. No bidding.",
    accent: "violet",
  },
  {
    num: "02",
    icon: Users,
    title: "Creators apply or get invited",
    desc: "Matched creators apply with a pitch. Or invite directly from the marketplace. Our algorithm surfaces the top 5%.",
    accent: "indigo",
  },
  {
    num: "03",
    icon: FileCheck,
    title: "Contracts signed, budget locked",
    desc: "Digital contracts through InfluenceX. 50% goes into escrow before work begins — fully protected for both sides.",
    accent: "blue",
  },
  {
    num: "04",
    icon: Banknote,
    title: "Deliver, track, get paid",
    desc: "Campaign goes live. Performance tracked via unique code. Payment releases automatically after 15-day hold.",
    accent: "emerald",
  },
];

const accentColors: Record<string, { bg: string; border: string; text: string; num: string }> = {
  violet: {
    bg: "bg-violet-500/8",
    border: "border-violet-500/20",
    text: "text-violet-400",
    num: "text-violet-600/30",
  },
  indigo: {
    bg: "bg-indigo-500/8",
    border: "border-indigo-500/20",
    text: "text-indigo-400",
    num: "text-indigo-600/30",
  },
  blue: {
    bg: "bg-blue-500/8",
    border: "border-blue-500/20",
    text: "text-blue-400",
    num: "text-blue-600/30",
  },
  emerald: {
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    num: "text-emerald-600/30",
  },
};

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" ref={ref} className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 max-w-lg"
        >
          <div className="section-label mb-4">Process</div>
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold text-white leading-tight mb-4">
            From campaign to payout<br />
            <span className="text-gradient">in four clean steps</span>
          </h2>
          <p className="text-zinc-500 text-[15px] leading-relaxed">
            No ambiguity. No chasing invoices. A structured flow that protects everyone.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const c = accentColors[step.accent];
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.09 }}
                className="glass-card rounded-2xl p-6 relative overflow-hidden"
              >
                {/* Large step number watermark */}
                <span className={`absolute -top-3 -right-1 text-7xl font-black select-none pointer-events-none ${c.num}`}>
                  {step.num}
                </span>

                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-5 ${c.bg} ${c.border}`}>
                  <Icon className={`w-5 h-5 ${c.text}`} strokeWidth={1.75} />
                </div>

                <h3 className="text-[15px] font-bold text-white mb-2 leading-snug">{step.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
