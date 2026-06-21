import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";

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
          ? "glass-white shadow-sm border-b border-black/5"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand-glow group-hover:shadow-brand-glow-lg transition-shadow duration-200">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} fill="white" />
          </div>
          <span className="font-display text-[17px] font-extrabold tracking-tight leading-none text-ink">
            Influence<span className="text-brand">X</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3.5 py-2 rounded-lg text-[14px] font-medium text-ink-muted hover:text-ink hover:bg-brand-faint transition-all duration-150"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <a href="#waitlist" className="btn-outline py-2 px-4 text-sm">
            Join Waitlist
          </a>
          <a href="#waitlist" className="btn-primary py-2 px-4 text-sm">
            Get Early Access
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-xl text-ink-muted hover:bg-brand-faint hover:text-ink transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="md:hidden overflow-hidden glass-white border-t border-black/5"
          >
            <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-ink-muted hover:text-ink hover:bg-brand-faint py-2.5 px-3 rounded-xl transition-all"
                >
                  {l.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-black/5">
                <a href="#waitlist" onClick={() => setOpen(false)} className="btn-outline">
                  Join Waitlist
                </a>
                <a href="#waitlist" onClick={() => setOpen(false)} className="btn-primary">
                  Get Early Access
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
