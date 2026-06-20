import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Shield, Star } from "lucide-react";
import { useRef } from "react";

const floatingCards = [
  {
    id: 1,
    type: "brand",
    name: "Nike Launch",
    metric: "+340% ROI",
    sub: "via InfluenceX",
    color: "from-orange-500/20 to-red-500/20",
    border: "border-orange-500/20",
    icon: TrendingUp,
    position: "top-32 -left-4 md:left-12",
    delay: 0,
  },
  {
    id: 2,
    type: "creator",
    name: "Sarah K.",
    metric: "₹2.4L earned",
    sub: "this month",
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/20",
    icon: Star,
    position: "top-48 -right-4 md:right-12",
    delay: 0.3,
  },
  {
    id: 3,
    type: "campaign",
    name: "Secure payment",
    metric: "Lock & Hold",
    sub: "15-day guarantee",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/20",
    icon: Shield,
    position: "bottom-32 -left-4 md:left-20",
    delay: 0.6,
  },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "3s" }} />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="section-tag">
            <Sparkles className="w-3 h-3" />
            Exclusive. Transparent. Results-first.
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.05] tracking-tight mb-6"
        >
          <span className="text-white">Launch Products.</span>
          <br />
          <span className="text-gradient">Not Guesses.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed mb-10"
        >
          The only platform built exclusively for{" "}
          <span className="text-white font-medium">product launch campaigns</span>. Brands meet
          vetted creators, campaigns ship with flat-fee clarity, and payments are locked until results
          are delivered.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a
            href="#waitlist"
            className="group btn-primary text-base py-3.5 px-8 glow-purple"
          >
            Get Early Access — Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="#how-it-works" className="btn-secondary text-base py-3.5 px-8">
            See How It Works
          </a>
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex items-center justify-center gap-6 flex-wrap"
        >
          <div className="flex -space-x-2">
            {["AB", "RK", "PG", "SM", "VT"].map((initials, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-bg-primary flex items-center justify-center text-xs font-bold text-white"
                style={{
                  background: `hsl(${250 + i * 15}, 70%, 45%)`,
                  zIndex: 5 - i,
                }}
              >
                {initials}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400">
            <span className="text-white font-semibold">500+ creators</span> already on the waitlist
          </p>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-sm text-slate-400 ml-1">5.0 pilot rating</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating cards */}
      {floatingCards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 + card.delay }}
            className={`absolute hidden lg:block ${card.position} z-20`}
            style={{ animation: `float ${6 + card.delay}s ease-in-out infinite` }}
          >
            <div
              className={`glass border ${card.border} rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[180px]`}
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} border ${card.border} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{card.name}</p>
                <p className="text-sm font-bold text-white">{card.metric}</p>
                <p className="text-xs text-slate-500">{card.sub}</p>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#05050f] to-transparent pointer-events-none" />
    </section>
  );
}
