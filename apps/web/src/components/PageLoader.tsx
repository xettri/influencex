import { Zap, Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-3">
        <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-[0_4px_20px_rgba(109,40,217,0.35)]">
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-violet-400" strokeWidth={2.5} fill="currentColor" />
          <span className="text-[12px] text-ink-muted font-semibold tracking-wide">InfluenceX</span>
        </div>
      </div>
    </div>
  );
}
