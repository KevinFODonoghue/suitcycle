import type { SuitCondition } from "@prisma/client";

const TIER_CONFIG: Record<
  SuitCondition,
  { label: string; bg: string; text: string; border: string; races: string }
> = {
  gold: {
    label: "Gold",
    bg: "#FEF9C3",
    text: "#92400E",
    border: "#EAB308",
    races: "0–2 races",
  },
  podium: {
    label: "Podium",
    bg: "#EEF2FF",
    text: "#3730A3",
    border: "#6366F1",
    races: "3–6 races",
  },
  prelim: {
    label: "Prelim",
    bg: "#DCFCE7",
    text: "#14532D",
    border: "#22C55E",
    races: "7–10 races",
  },
  backup: {
    label: "Backup",
    bg: "#FFF7ED",
    text: "#9A3412",
    border: "#F97316",
    races: "11–14 races",
  },
  practice: {
    label: "Practice",
    bg: "#FEF2F2",
    text: "#991B1B",
    border: "#EF4444",
    races: "15+ races",
  },
};

interface SuitScoreBadgeProps {
  condition: SuitCondition;
  showRaces?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SuitScoreBadge({
  condition,
  showRaces = false,
  size = "md",
}: SuitScoreBadgeProps) {
  const cfg = TIER_CONFIG[condition];

  const padding =
    size === "sm" ? "px-2 py-0.5 text-xs" : size === "lg" ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border ${padding}`}
      style={{
        backgroundColor: cfg.bg,
        color: cfg.text,
        borderColor: cfg.border,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: cfg.border }}
      />
      {cfg.label}
      {showRaces && (
        <span className="opacity-70 font-normal ml-0.5">· {cfg.races}</span>
      )}
    </span>
  );
}
