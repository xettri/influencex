import { Shield } from "lucide-react";

interface Props {
  score: number;
  size?: "sm" | "md";
  showLabel?: boolean;
}

function scoreColor(score: number) {
  if (score >= 80) return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (score >= 60) return "bg-amber-50 border-amber-200 text-amber-700";
  if (score >= 40) return "bg-orange-50 border-orange-200 text-orange-700";
  return "bg-red-50 border-red-200 text-red-700";
}

function scoreLabel(score: number) {
  if (score >= 80) return "High";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Low";
}

export function AuthenticityBadge({ score, size = "sm", showLabel = false }: Props) {
  if (score === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/[0.04] border border-black/8 text-ink/40 text-[10px] font-bold whitespace-nowrap">
        <Shield className="w-2.5 h-2.5" />
        Not rated
      </span>
    );
  }

  const colors = scoreColor(score);
  const textSize = size === "sm" ? "text-[10px]" : "text-[12px]";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${colors} ${textSize} font-bold whitespace-nowrap`}>
      <Shield className="w-2.5 h-2.5" />
      {score}/100
      {showLabel && <span className="ml-0.5 opacity-75">{scoreLabel(score)}</span>}
    </span>
  );
}
