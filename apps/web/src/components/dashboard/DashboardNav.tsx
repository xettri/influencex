import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  BarChart3,
  Settings,
  Zap,
  Search,
  Bookmark,
  DollarSign,
} from "lucide-react";
import type { AuthUser } from "@/store/auth";

const brandLinks = [
  { icon: LayoutDashboard, label: "Overview", to: "/dashboard" },
  { icon: Megaphone, label: "My Campaigns", to: "/dashboard/campaigns" },
  { icon: Users, label: "Applications", to: "/dashboard/applications" },
  { icon: DollarSign, label: "Payments", to: "/dashboard/payments" },
  { icon: BarChart3, label: "Analytics", to: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", to: "/dashboard/settings" },
];

const creatorLinks = [
  { icon: LayoutDashboard, label: "Overview", to: "/dashboard" },
  { icon: Search, label: "Browse Campaigns", to: "/dashboard/explore" },
  { icon: Bookmark, label: "My Applications", to: "/dashboard/applications" },
  { icon: DollarSign, label: "Earnings", to: "/dashboard/earnings" },
  { icon: BarChart3, label: "Analytics", to: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", to: "/dashboard/settings" },
];

interface DashboardNavProps {
  user: AuthUser;
  onClose?: () => void;
}

export function DashboardNav({ user, onClose }: DashboardNavProps) {
  const links = user.role === "BRAND" ? brandLinks : creatorLinks;

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-black/6">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-[0_2px_8px_rgba(109,40,217,0.3)]">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} fill="white" />
          </div>
          <span className="font-display text-[16px] font-extrabold tracking-tight text-ink leading-none">
            Influence<span className="text-brand">X</span>
          </span>
        </a>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3 border-b border-black/6">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
          user.role === "BRAND"
            ? "bg-violet-50 border border-violet-200 text-violet-700"
            : "bg-emerald-50 border border-emerald-200 text-emerald-700"
        }`}>
          {user.role === "BRAND" ? "Brand Account" : "Creator Account"}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-violet-50 text-violet-700 border border-violet-100"
                  : "text-ink/55 hover:text-ink hover:bg-black/[0.04]"
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom user info */}
      <div className="px-4 py-4 border-t border-black/6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-ink truncate">{user.email}</p>
            <p className="text-[10px] text-ink-muted">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
