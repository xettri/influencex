import { Zap } from "lucide-react";

const links = {
  Product: ["How it Works", "For Brands", "For Creators", "Pricing"],
  Company: ["About", "Blog", "Careers", "Press"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export function Footer() {
  return (
    <footer className="border-t border-white/6 pt-14 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} fill="white" />
              </div>
              <span className="text-[15px] font-bold">
                <span className="text-white">Influence</span>
                <span className="text-violet-400">X</span>
              </span>
            </a>
            <p className="text-[13px] text-zinc-600 leading-relaxed max-w-[200px]">
              The exclusive marketplace for product launch campaigns.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-4">{group}</p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/6 pt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-zinc-700">
            © {new Date().getFullYear()} InfluenceX. Built for India's creator economy.
          </p>
          <p className="text-[12px] text-zinc-700">
            Launching Dec 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
