import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useToastStore, type ToastType } from "@/store/toast";

const config: Record<ToastType, { icon: typeof Info; classes: string; iconClass: string }> = {
  success: {
    icon: CheckCircle2,
    classes: "bg-white border-emerald-200 shadow-emerald-100",
    iconClass: "text-emerald-500",
  },
  error: {
    icon: AlertCircle,
    classes: "bg-white border-red-200 shadow-red-100",
    iconClass: "text-red-500",
  },
  info: {
    icon: Info,
    classes: "bg-white border-violet-200 shadow-violet-100",
    iconClass: "text-violet-500",
  },
};

export function Toaster() {
  const { toasts, remove } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full pr-5">
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map(({ id, message, type }) => {
          const { icon: Icon, classes, iconClass } = config[type];
          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-lg text-[13px] font-medium ${classes}`}
            >
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconClass}`} strokeWidth={2} />
              <span className="flex-1 text-ink leading-snug">{message}</span>
              <button
                onClick={() => remove(id)}
                className="text-ink/25 hover:text-ink/60 transition-colors shrink-0 mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
