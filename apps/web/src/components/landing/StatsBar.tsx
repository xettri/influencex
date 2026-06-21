import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Building2, ShieldCheck, Clock } from "lucide-react";

const stats = [
  { to: 10000, suffix: "+", label: "Creators targeted", icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
  { to: 100, suffix: "+", label: "Brand slots at launch", icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
  { to: 50, suffix: "%", label: "Upfront secured in escrow", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { to: 15, suffix: " days", label: "Guaranteed payment hold", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
];

function Counter({ to, suffix, active }: { to: number; suffix: string; active: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const dur = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(tick);
      else setVal(to);
    };
    requestAnimationFrame(tick);
  }, [active, to]);
  return <>{val.toLocaleString("en-IN")}{suffix}</>;
}

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="bg-section-alt py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-10"
        >
          Built for scale from day one
        </motion.p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="card-white-hover p-6 text-center flex flex-col items-center"
              >
                <div className={`w-11 h-11 rounded-2xl ${s.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${s.color}`} strokeWidth={1.75} />
                </div>
                <div className="text-[2.25rem] font-display font-black text-brand-gradient tabular-nums leading-none mb-1">
                  <Counter to={s.to} suffix={s.suffix} active={inView} />
                </div>
                <p className="text-[12px] font-medium text-ink-muted leading-snug">{s.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
