import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 10000, suffix: "+", label: "Creator target", desc: "across all niches" },
  { value: 100, suffix: "+", label: "Brand slots", desc: "at launch" },
  { value: 50, suffix: "%", label: "Upfront secured", desc: "before any work" },
  { value: 15, suffix: "d", label: "Payment hold", desc: "then auto-release" },
];

function Counter({ to, suffix, active }: { to: number; suffix: string; active: boolean }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!active) return;
    const dur = 1400;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * to));
      if (p < 1) requestAnimationFrame(step);
      else setVal(to);
    };
    requestAnimationFrame(step);
  }, [active, to]);

  return (
    <>{val.toLocaleString("en-IN")}{suffix}</>
  );
}

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative py-14 border-y border-white/6">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-950/10 via-indigo-950/10 to-violet-950/10" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/6 rounded-2xl overflow-hidden">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-[#030305] px-6 py-8 text-center"
            >
              <div className="text-[2rem] font-black text-gradient mb-1 tabular-nums">
                <Counter to={s.value} suffix={s.suffix} active={inView} />
              </div>
              <p className="text-[13px] font-semibold text-zinc-300 mb-0.5">{s.label}</p>
              <p className="text-[11px] text-zinc-600">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
