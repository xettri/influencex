import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BadgeDollarSign, MailOpen, TrendingUp, LayoutDashboard, ArrowRight, Zap, IndianRupee, Star } from "lucide-react";

const perks = [
  {
    icon: BadgeDollarSign,
    title: "Flat fee, always visible upfront",
    desc: "No negotiation. Brands post fixed budgets. You see it before you apply — zero race to the bottom.",
    usp: true,
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: MailOpen,
    title: "Top brands invite you directly",
    desc: "Build your profile once. Get exclusive invitations for product launches matched to your niche.",
    usp: false,
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: TrendingUp,
    title: "CPA bonuses on top of flat fee",
    desc: "Earn your guaranteed flat fee plus performance bonuses when your audience converts.",
    usp: false,
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: LayoutDashboard,
    title: "Your stats sell for you",
    desc: "Verified engagement rates and past campaign performance shown on your profile automatically.",
    usp: false,
    color: "from-amber-500 to-orange-600",
  },
];

const tiers = [
  { name: "Nano", range: "1K – 10K", color: "bg-slate-50 border-slate-200 text-slate-600" },
  { name: "Micro", range: "10K – 100K", color: "bg-violet-50 border-violet-200 text-violet-700" },
  { name: "Mid-tier", range: "100K – 500K", color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
  { name: "Macro", range: "500K+", color: "bg-amber-50 border-amber-200 text-amber-700" },
];

/* Mock creator earning card */
function EarningCard() {
  return (
    <div className="card-white p-5 shadow-float">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-md">
          <Star className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <p className="text-[14px] font-bold text-ink">Priya Sharma</p>
          <p className="text-[11px] text-ink-muted">Beauty · 84K followers</p>
        </div>
        <div className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-[10px] font-bold text-violet-600">Active</span>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        {[
          { brand: "Mamaearth", amount: "₹45,000", type: "Flat fee", status: "Paid", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
          { brand: "WOW Skin", amount: "₹32,000", type: "Flat fee", status: "In escrow", color: "text-blue-600 bg-blue-50 border-blue-200" },
          { brand: "Nykaa", amount: "₹18,500", type: "CPA bonus", status: "Pending", color: "text-amber-600 bg-amber-50 border-amber-200" },
        ].map((c) => (
          <div key={c.brand} className="flex items-center justify-between py-2.5 border-b border-black/5 last:border-0">
            <div>
              <p className="text-[13px] font-semibold text-ink">{c.brand}</p>
              <p className="text-[11px] text-ink-muted">{c.type}</p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-bold text-ink">{c.amount}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.color}`}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-[11px] text-ink-muted">This month</p>
          <div className="flex items-baseline gap-1">
            <IndianRupee className="w-4 h-4 text-brand" strokeWidth={2.5} />
            <span className="text-[24px] font-display font-black text-ink">95,500</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-emerald-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-[13px] font-bold">+42% vs last month</span>
        </div>
      </div>
    </div>
  );
}

export function ForCreators() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="for-creators" ref={ref} className="py-24 sm:py-32 bg-canvas relative overflow-hidden">
      <div className="absolute left-0 top-1/3 w-[500px] h-[500px] bg-violet-100/60 rounded-full blur-3xl pointer-events-none -translate-x-1/2" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          {/* Left: Copy + perks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55 }}
          >
            <div className="section-pill mb-5">For Creators</div>
            <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.25rem)] text-ink leading-tight tracking-tight mb-4">
              Your influence.
              <br />
              <span className="text-brand-gradient">Your price. Always.</span>
            </h2>
            <p className="text-ink-muted text-[15px] leading-relaxed mb-10 max-w-md">
              No more negotiating over DM with 10 brands. InfluenceX brings exclusive,
              well-paid campaigns to you — pre-matched to your niche and platform.
            </p>

            <div className="space-y-3 mb-10">
              {perks.map((perk, i) => {
                const Icon = perk.icon;
                return (
                  <motion.div
                    key={perk.title}
                    initial={{ opacity: 0, x: -16 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                    className={`flex gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-default group
                      ${perk.usp
                        ? "bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200"
                        : "bg-white border-black/6 hover:border-violet-200 hover:bg-violet-50/50"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${perk.color} flex items-center justify-center shrink-0 shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-[14px] text-ink">{perk.title}</h3>
                        {perk.usp && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wider">
                            <Zap className="w-2.5 h-2.5" fill="currentColor" />USP
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-ink-muted leading-relaxed">{perk.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Tiers */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="card-white p-5"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-ink-faint mb-4">All creator sizes welcome</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                {tiers.map((t) => (
                  <div key={t.name} className={`rounded-xl border px-3 py-3 text-center ${t.color}`}>
                    <p className="text-[14px] font-extrabold font-display mb-0.5">{t.name}</p>
                    <p className="text-[10px] font-medium opacity-70">{t.range}</p>
                  </div>
                ))}
              </div>
              <a href="#waitlist" className="btn-primary w-full">
                Join as a Creator <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>

          {/* Right: Earning card */}
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.96 }}
            animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <EarningCard />
            <div className="absolute inset-0 -z-10 blur-3xl opacity-20 rounded-3xl bg-violet-400" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
