import { Building2, ShoppingBag, Coffee, Dumbbell, Shirt, Smartphone, HeartPulse, Sparkles } from "lucide-react";

const brands = [
  { name: "Mamaearth", icon: HeartPulse, color: "text-green-600", bg: "bg-green-50" },
  { name: "boAt", icon: Smartphone, color: "text-blue-600", bg: "bg-blue-50" },
  { name: "Lenskart", icon: Sparkles, color: "text-violet-600", bg: "bg-violet-50" },
  { name: "Nykaa", icon: ShoppingBag, color: "text-pink-600", bg: "bg-pink-50" },
  { name: "Bewakoof", icon: Shirt, color: "text-amber-600", bg: "bg-amber-50" },
  { name: "Cult.fit", icon: Dumbbell, color: "text-red-600", bg: "bg-red-50" },
  { name: "WOW Skin", icon: Coffee, color: "text-emerald-600", bg: "bg-emerald-50" },
  { name: "Noise", icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
];

const doubled = [...brands, ...brands];

export function Marquee() {
  return (
    <div className="bg-white border-y border-black/5 py-6 overflow-hidden">
      <p className="text-center text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-5">
        Loved by India's fastest-growing brands
      </p>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee-left gap-6 w-max">
          {doubled.map((brand, i) => {
            const Icon = brand.icon;
            return (
              <div
                key={i}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-black/5 ${brand.bg} shrink-0`}
              >
                <div className={`w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${brand.color}`} strokeWidth={2} />
                </div>
                <span className="text-[13px] font-semibold text-ink whitespace-nowrap">{brand.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
