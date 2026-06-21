import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  ArrowRight, TrendingUp, Star, Zap,
  Users, IndianRupee, Lock, CheckCircle2,
} from "lucide-react";

/* ── 3D Tilt Card ── */
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [10, -10]), { stiffness: 180, damping: 22 });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-10, 10]), { stiffness: 180, damping: 22 });
  const glareX = useTransform(rawX, [-0.5, 0.5], ["15%", "85%"]);
  const glareY = useTransform(rawY, [-0.5, 0.5], ["15%", "85%"]);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { rawX.set(0); rawY.set(0); };

  return (
    <div className="perspective-1200 w-full" onMouseMove={onMove} onMouseLeave={onLeave}>
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full"
      >
        {children}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) => `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.35) 0%, transparent 65%)`
            ),
          }}
        />
      </motion.div>
    </div>
  );
}

/* ── Campaign Dashboard Card ── */
function CampaignCard() {
  const creators = ["#7C3AED", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];
  return (
    <TiltCard>
      <div className="card-white p-5 w-full shadow-float-brand">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-sm shrink-0">
              <span className="text-white text-sm font-black">N</span>
            </div>
            <div>
              <p className="text-[13px] font-bold text-ink leading-tight">Nike Air Max Launch</p>
              <p className="text-[11px] text-ink-muted">Product Campaign</p>
            </div>
          </div>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            LIVE
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "ROI", value: "340%", color: "text-ink", bg: "bg-[#F8F7FF]" },
            { label: "CPA", value: "₹48", color: "text-brand", bg: "bg-[#F5F3FF]" },
            { label: "Reach", value: "1.2M", color: "text-indigo-600", bg: "bg-indigo-50" },
          ].map((m) => (
            <div key={m.label} className={`${m.bg} rounded-xl p-3 text-center`}>
              <p className={`text-[15px] font-extrabold ${m.color} leading-none mb-0.5`}>{m.value}</p>
              <p className="text-[10px] text-ink-faint font-medium">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-ink-muted">Budget used</span>
            <span className="text-[11px] font-bold text-ink">₹1.2L / ₹2L</span>
          </div>
          <div className="h-2 bg-[#F0EEFF] rounded-full overflow-hidden">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-brand to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: "62%" }}
              transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {creators.map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shrink-0" style={{ background: c, zIndex: 5 - i }}>
                  <Users className="w-3 h-3 text-white/80" />
                </div>
              ))}
            </div>
            <span className="text-[11px] font-medium text-ink-muted">8 creators active</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            Signed
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

/* ── Floating Badges ── */
const badges = [
  {
    icon: IndianRupee,
    label: "₹2.4L earned",
    sub: "this month",
    className: "top-4 -left-12 lg:-left-16 animate-float-a",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    icon: Lock,
    label: "Escrow active",
    sub: "15-day release",
    className: "-bottom-4 -left-10 lg:-left-14 animate-float-b",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: TrendingUp,
    label: "+340% ROI",
    sub: "verified result",
    className: "top-8 -right-12 lg:-right-16 animate-float-c",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
];

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.1 } } },
  item: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
};

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Mesh background */}
      <div className="absolute inset-0 bg-hero-mesh" />

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-50" />

      {/* Animated orbs */}
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 65%)", top: "-200px", right: "-150px" }}
        animate={{ scale: [1, 1.08, 1], x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)", bottom: "-100px", left: "-80px" }}
        animate={{ scale: [1, 1.12, 1], x: [0, -15, 0], y: [0, 20, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Content — vertically centered, with top padding for navbar */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 min-h-screen flex flex-col justify-center pt-20 pb-14 sm:pt-24 sm:pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">

          {/* ── Left: Copy ── */}
          <motion.div
            variants={stagger.container}
            initial="initial"
            animate="animate"
            className="order-2 lg:order-1 flex flex-col items-start w-full"
          >
            <motion.div variants={stagger.item} className="w-full">
              <div className="section-pill mb-6 inline-flex">
                <Zap className="w-3 h-3" fill="currentColor" />
                Exclusive · Flat-fee · Escrow-protected
              </div>
            </motion.div>

            <motion.h1
              variants={stagger.item}
              className="font-display font-extrabold text-[clamp(2.2rem,6vw,4.5rem)] leading-[1.05] tracking-tight text-ink mb-5 w-full"
            >
              Launch Products.
              <br />
              <span className="text-brand-gradient">Not Guesses.</span>
            </motion.h1>

            <motion.p
              variants={stagger.item}
              className="text-[clamp(1rem,2vw,1.175rem)] text-ink-muted leading-relaxed mb-8 w-full max-w-[500px]"
            >
              The only marketplace built exclusively for{" "}
              <span className="text-ink font-semibold">product launch campaigns</span>. Brands find
              vetted creators, agree on flat fees, sign contracts, and pay through escrow — all in one place.
            </motion.p>

            {/* Buttons — stack on mobile, row on sm+ */}
            <motion.div variants={stagger.item} className="flex flex-col sm:flex-row gap-3 mb-10 w-full sm:w-auto">
              <a href="#waitlist" className="btn-primary text-base w-full sm:w-auto justify-center">
                Get Early Access — Free
                <ArrowRight className="w-4 h-4 shrink-0" />
              </a>
              <a href="#waitlist" className="btn-outline text-base w-full sm:w-auto justify-center">
                See How It Works
              </a>
            </motion.div>

            {/* Trust strip */}
            <motion.div variants={stagger.item} className="flex flex-wrap items-center gap-5 w-full">
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2 shrink-0">
                  {["#7c3aed", "#6366f1", "#8b5cf6", "#4f46e5", "#a78bfa"].map((bg, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center" style={{ background: bg, zIndex: 5 - i }}>
                      <Users className="w-3.5 h-3.5 text-white/80" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-ink leading-tight">500+ creators</p>
                  <p className="text-[11px] text-ink-muted">on the waitlist</p>
                </div>
              </div>

              <div className="w-px h-8 bg-black/8 hidden xs:block shrink-0" />

              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                <div className="ml-1">
                  <p className="text-[13px] font-bold text-ink leading-tight">5.0 rating</p>
                  <p className="text-[11px] text-ink-muted">from pilot brands</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: 3D Card ── */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="order-1 lg:order-2 flex items-center justify-center"
          >
            <div className="relative w-full max-w-[360px] mx-auto">
              <CampaignCard />

              {/* Floating badges — sm+ only */}
              {badges.map((b) => {
                const Icon = b.icon;
                return (
                  <motion.div
                    key={b.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                    className={`absolute hidden sm:flex ${b.className} items-center gap-2.5 card-white px-3 py-2.5 shadow-card`}
                    style={{ borderRadius: "0.875rem", minWidth: "148px" }}
                  >
                    <div className={`w-8 h-8 rounded-lg ${b.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${b.iconColor}`} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-ink leading-tight">{b.label}</p>
                      <p className="text-[10px] text-ink-muted">{b.sub}</p>
                    </div>
                  </motion.div>
                );
              })}

              {/* Glow behind card */}
              <div className="absolute inset-0 -z-10 blur-3xl opacity-30 rounded-3xl" style={{ background: "linear-gradient(135deg, #7C3AED, #6366F1)" }} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-canvas to-transparent pointer-events-none" />
    </section>
  );
}
