import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ArrowRight, Megaphone, CheckCircle2, ShieldCheck, Briefcase, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Notification, NotificationType } from "@influencex/shared";
import { useNotificationStore } from "@/store/notifications";

const TYPE_META: Record<NotificationType, { icon: typeof Bell; color: string }> = {
  APPLICATION_RECEIVED:   { icon: Megaphone,    color: "bg-violet-50 text-violet-600" },
  APPLICATION_SHORTLISTED:{ icon: CheckCircle2, color: "bg-blue-50 text-blue-600" },
  APPLICATION_APPROVED:   { icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
  APPLICATION_REJECTED:   { icon: X,            color: "bg-red-50 text-red-500" },
  VERIFICATION_APPROVED:  { icon: ShieldCheck,  color: "bg-emerald-50 text-emerald-600" },
  VERIFICATION_FAILED:    { icon: ShieldCheck,  color: "bg-red-50 text-red-500" },
  HIRE_REQUEST:           { icon: Briefcase,    color: "bg-amber-50 text-amber-600" },
  HIRE_ACCEPTED:          { icon: Briefcase,    color: "bg-emerald-50 text-emerald-600" },
  HIRE_DECLINED:          { icon: Briefcase,    color: "bg-red-50 text-red-500" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function NotifItem({ notif, onAction }: { notif: Notification; onAction: () => void }) {
  const navigate = useNavigate();
  const { markRead } = useNotificationStore();
  const meta = TYPE_META[notif.type];
  const Icon = meta.icon;

  const handleClick = async () => {
    if (!notif.read) await markRead(notif.id);
    if (notif.link) navigate(notif.link);
    onAction();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-black/[0.025] transition-colors ${!notif.read ? "bg-violet-50/40" : ""}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${meta.color}`}>
        <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[12.5px] leading-snug ${notif.read ? "text-ink/70" : "text-ink font-semibold"}`}>
          {notif.title}
        </p>
        <p className="text-[11px] text-ink-muted mt-0.5 line-clamp-1">{notif.body}</p>
        <p className="text-[10px] text-ink/30 mt-1">{timeAgo(notif.createdAt)}</p>
      </div>
      {!notif.read && (
        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 shrink-0" />
      )}
    </button>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { items, unreadCount, markAllRead } = useNotificationStore();
  const preview = items.slice(0, 6);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const displayCount = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-black/[0.04] hover:bg-black/[0.07] text-ink/50 hover:text-ink transition-all relative"
        aria-label="Notifications"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-violet-600 text-white text-[9px] font-black px-1 leading-none">
            {displayCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2.5 w-[340px] bg-white rounded-2xl border border-black/8 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.16)] overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/6">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-bold text-ink">Notifications</p>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-black">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead()}
                  className="flex items-center gap-1 text-[11px] font-semibold text-ink/40 hover:text-ink transition-colors"
                >
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            {/* Items */}
            {preview.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-ink/10 mx-auto mb-3" />
                <p className="text-[12px] text-ink-muted">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-black/4 max-h-[360px] overflow-y-auto">
                {preview.map((notif) => (
                  <NotifItem key={notif.id} notif={notif} onAction={() => setOpen(false)} />
                ))}
              </div>
            )}

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-black/6">
                <button
                  type="button"
                  onClick={() => { navigate("/dashboard/notifications"); setOpen(false); }}
                  className="w-full flex items-center justify-center gap-1.5 py-3 text-[12px] font-semibold text-brand hover:bg-violet-50/50 transition-colors"
                >
                  View all notifications <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
