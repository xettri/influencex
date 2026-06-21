import { Zap, Twitter, Instagram, Linkedin, Github, ArrowRight } from "lucide-react";

const linkGroups = {
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">

        {/* Main grid: brand col + link cols */}
        <div className="flex flex-col sm:flex-row gap-10 sm:gap-12 pb-10 border-b border-white/8 mb-8">
          {/* Brand */}
          <div className="shrink-0 sm:w-[200px]">
            <a href="#" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-brand-glow">
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} fill="white" />
              </div>
              <span className="font-display font-extrabold text-[17px] text-white tracking-tight">
                Influence<span className="text-violet-400">X</span>
              </span>
            </a>
            <p className="text-[13px] text-white/40 leading-relaxed mb-5">
              The exclusive marketplace for product launch campaigns. India's creator economy, structured.
            </p>
            <div className="flex items-center gap-2">
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

          {/* Link groups — 2-col on mobile, 3-col on sm+ */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(linkGroups).map(([group, items]) => (
              <div key={group}>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">{group}</p>
                <ul className="space-y-2.5">
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
        </div>

        {/* Footer CTA strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/5 border border-white/8 mb-8">
          <div>
            <p className="text-[14px] font-bold text-white mb-0.5">Ready to launch smarter?</p>
            <p className="text-[12px] text-white/40">Join 500+ brands and creators already on the waitlist.</p>
          </div>
          <a href="#waitlist" className="btn-primary shrink-0 text-[13px] py-2.5 px-5 w-full sm:w-auto justify-center">
            Get Early Access
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[12px] text-white/25">
            © {new Date().getFullYear()} InfluenceX. Built for India's creator economy.
          </p>
          <p className="text-[12px] text-white/25">Launching December 2026</p>
        </div>
      </div>
    </footer>
  );
}
