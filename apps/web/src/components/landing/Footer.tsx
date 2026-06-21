import { Zap, Twitter, Instagram, Linkedin, Github } from "lucide-react";

const links = {
  Product: ["How it Works", "For Brands", "For Creators", "Pricing"],
  Company: ["About", "Blog", "Careers", "Press"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

const socials = [
  { Icon: Twitter, href: "#" },
  { Icon: Instagram, href: "#" },
  { Icon: Linkedin, href: "#" },
  { Icon: Github, href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-brand-glow">
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} fill="white" />
              </div>
              <span className="font-display font-extrabold text-[17px] text-white tracking-tight">
                Influence<span className="text-violet-400">X</span>
              </span>
            </a>
            <p className="text-[13px] text-white/40 leading-relaxed max-w-[200px]">
              The exclusive marketplace for product launch campaigns. India's creator economy, structured.
            </p>
            <div className="flex items-center gap-2 mt-6">
              {socials.map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-8 h-8 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/12 hover:border-white/20 transition-all duration-150"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-5">{group}</p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[13px] text-white/50 hover:text-white transition-colors duration-150">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/25">
            © {new Date().getFullYear()} InfluenceX. Built for India's creator economy.
          </p>
          <p className="text-[12px] text-white/25">Launching December 2026</p>
        </div>
      </div>
    </footer>
  );
}
