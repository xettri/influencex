import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell, CheckCheck, Trash2, Megaphone, CheckCircle2, ShieldCheck, Briefcase, X,
} from "lucide-react";
import type { Notification, NotificationType } from "@influencex/shared";
import { useNotificationStore } from "@/store/notifications";

const TYPE_META: Record<NotificationType, { icon: typeof Bell; color: string; label: string }> = {
  APPLICATION_RECEIVED:    { icon: Megaphone,    color: "bg-violet-50 text-violet-600 border-violet-200",  label: "New application" },
  APPLICATION_SHORTLISTED: { icon: CheckCircle2, color: "bg-blue-50 text-blue-600 border-blue-200",        label: "Shortlisted" },
  APPLICATION_APPROVED:    { icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600 border-emerald-200",label: "Approved" },
  APPLICATION_REJECTED:    { icon: X,            color: "bg-red-50 text-red-500 border-red-200",            label: "Rejected" },
  VERIFICATION_APPROVED:   { icon: ShieldCheck,  color: "bg-emerald-50 text-emerald-600 border-emerald-200",label: "Verified" },
  VERIFICATION_FAILED:     { icon: ShieldCheck,  color: "bg-red-50 text-red-500 border-red-200",            label: "Verification failed" },
  HIRE_REQUEST:            { icon: Briefcase,    color: "bg-amber-50 text-amber-600 border-amber-200",      label: "Hire request" },
  HIRE_ACCEPTED:           { icon: Briefcase,    color: "bg-emerald-50 text-emerald-600 border-emerald-200",label: "Hire accepted" },
  HIRE_DECLINED:           { icon: Briefcase,    color: "bg-red-50 text-red-500 border-red-200",            label: "Hire declined" },
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
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function groupByDate(items: Notification[]): { label: string; items: Notification[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86_400_000;
  const weekAgo = today - 7 * 86_400_000;

  const groups: Record<string, Notification[]> = {};
  for (const n of items) {
    const t = new Date(n.createdAt).getTime();
    const key = t >= today ? "Today" : t >= yesterday ? "Yesterday" : t >= weekAgo ? "This week" : "Earlier";
    (groups[key] ??= []).push(n);
  }

  const order = ["Today", "Yesterday", "This week", "Earlier"];
  return order.filter((k) => groups[k]?.length).map((label) => ({ label, items: groups[label] }));
}

export function NotificationsPage() {
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const navigate = useNavigate();
  const { items, unreadCount, loading, markRead, markAllRead, remove } = useNotificationStore();

  const filtered = filter === "UNREAD" ? items.filter((n) => !n.read) : items;
  const groups = groupByDate(filtered);

  const handleClick = async (notif: Notification) => {
    if (!notif.read) await markRead(notif.id);
    if (notif.link) navigate(notif.link);
  };

  return (
    <div className="max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <p className="text-[12px] font-semibold text-ink-muted uppercase tracking-widest mb-1">Account</p>
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display font-extrabold text-[1.75rem] text-ink tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-ink/50 hover:text-ink hover:bg-black/[0.04] transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>
        <p className="text-[14px] text-ink-muted mt-1">
          {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up."}
        </p>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5">
        {(["ALL", "UNREAD"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
              filter === f
                ? "bg-violet-50 border border-violet-200 text-violet-700"
                : "bg-black/[0.03] text-ink/50 hover:text-ink hover:bg-black/[0.06] border border-transparent"
            }`}
          >
            {f === "ALL" ? `All (${items.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {loading && !items.length ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white border border-black/6 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/6 py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-6 h-6 text-violet-400" strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-ink text-[14px] mb-1">
            {filter === "UNREAD" ? "All caught up!" : "No notifications yet"}
          </p>
          <p className="text-[13px] text-ink-muted">
            {filter === "UNREAD" ? "No unread notifications right now." : "Activity from campaigns, applications, and verifications will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(({ label, items: groupItems }) => (
            <div key={label}>
              <p className="text-[11px] font-bold text-ink/40 uppercase tracking-widest mb-2.5 px-1">{label}</p>
              <div className="bg-white rounded-2xl border border-black/6 overflow-hidden divide-y divide-black/4">
                {groupItems.map((notif, i) => {
                  const meta = TYPE_META[notif.type];
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`group flex items-start gap-4 px-5 py-4 hover:bg-black/[0.015] transition-colors cursor-pointer ${!notif.read ? "bg-violet-50/30" : ""}`}
                      onClick={() => handleClick(notif)}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${meta.color}`}>
                        <Icon className="w-4 h-4" strokeWidth={1.75} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-[13px] leading-snug ${notif.read ? "text-ink/70" : "text-ink font-semibold"}`}>
                            {notif.title}
                          </p>
                          <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${meta.color} border`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-[12px] text-ink-muted mt-0.5 line-clamp-2 leading-relaxed">{notif.body}</p>
                        <p className="text-[10px] text-ink/30 mt-1.5">{timeAgo(notif.createdAt)}</p>
                      </div>

                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-violet-500 mt-2 shrink-0" />
                      )}

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); remove(notif.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-ink/25 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
