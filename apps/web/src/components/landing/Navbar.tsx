import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, ArrowRight } from "lucide-react";

const links = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "For Brands", href: "#for-brands" },
  { label: "For Creators", href: "#for-creators" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.07)]"
          : "bg-white/60 backdrop-blur-md"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav className="h-[62px] flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-[0_2px_8px_rgba(109,40,217,0.30)] group-hover:shadow-[0_4px_16px_rgba(109,40,217,0.40)] transition-all duration-200">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} fill="white" />
            </div>
            <span className="font-display text-[17px] font-extrabold tracking-tight text-ink leading-none">
              Influence<span className="text-brand">X</span>
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-violet-50 border border-violet-200 text-violet-700 text-[9px] font-black uppercase tracking-widest leading-none">
              Beta
            </span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3.5 py-2 text-[13.5px] font-semibold text-ink/55 hover:text-ink hover:bg-brand-faint rounded-lg transition-all duration-150"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right side: CTA + hamburger */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/login"
              className="hidden lg:inline-block text-[13px] font-semibold text-ink/50 hover:text-ink transition-colors"
            >
              Sign in
            </Link>
            <div className="hidden lg:block w-px h-4 bg-black/10" />
            <a href="#waitlist" className="hidden sm:inline-flex btn-primary py-2 px-4 text-[13px]">
              Get Early Access
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            {/* Hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-black/[0.05] hover:bg-black/[0.09] text-ink transition-all"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {open
                  ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X className="w-5 h-5" />
                    </motion.span>
                  : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu className="w-5 h-5" />
                    </motion.span>
                }
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden bg-white border-t border-black/6 shadow-lg"
          >
            <div className="max-w-6xl mx-auto px-4 py-2 pb-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center h-12 px-3 rounded-xl text-[15px] font-semibold text-ink-muted hover:text-ink hover:bg-brand-faint transition-all"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-2 pt-3 border-t border-black/6 flex flex-col gap-2.5">
                <a href="#waitlist" onClick={() => setOpen(false)} className="btn-primary w-full">
                  Get Early Access — Free
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-outline w-full">
                  Sign in
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
