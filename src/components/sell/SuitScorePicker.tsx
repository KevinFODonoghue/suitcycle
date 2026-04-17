import type { SuitCondition } from "@prisma/client";
import { Check } from "lucide-react";

const TIERS: {
  id: SuitCondition;
  label: string;
  races: string;
  performance: string;
  color: string;
  bg: string;
  criteria: string[];
}[] = [
  {
    id: "gold",
    label: "Gold",
    races: "0–2 races",
    performance: "100% performance",
    color: "#EAB308",
    bg: "#FEF9C3",
    criteria: [
      "Label fully visible, no fading or peeling",
      "Snaps back immediately when stretched",
      "Water beads and rolls off instantly",
    ],
  },
  {
    id: "podium",
    label: "Podium",
    races: "3–6 races",
    performance: "90% performance",
    color: "#6366F1",
    bg: "#EEF2FF",
    criteria: [
      "Label slightly faded, no lifting",
      "Mostly firm with slight softness",
      "Water beads on 80–90% of surface",
    ],
  },
  {
    id: "prelim",
    label: "Prelim",
    races: "7–10 races",
    performance: "70–80% performance",
    color: "#22C55E",
    bg: "#DCFCE7",
    criteria: [
      "Label faded but readable, light peeling",
      "Moderate stretch recovery",
      "Water beads on 50–75% of surface",
    ],
  },
  {
    id: "backup",
    label: "Backup",
    races: "11–14 races",
    performance: "40–60% performance",
    color: "#F97316",
    bg: "#FFF7ED",
    criteria: [
      "Label faded/cracked, edges lifting",
      "Noticeable looseness at seams",
      "Water beads on <50% of surface",
    ],
  },
  {
    id: "practice",
    label: "Practice",
    races: "15+ races",
    performance: "0–20% performance",
    color: "#EF4444",
    bg: "#FEF2F2",
    criteria: [
      "Label missing, illegible, or peeled",
      "Loose throughout, no compression",
      "No water beading, soaks in immediately",
    ],
  },
];

interface SuitScorePickerProps {
  value: SuitCondition | null;
  onChange: (value: SuitCondition) => void;
}

export function SuitScorePicker({ value, onChange }: SuitScorePickerProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#64748B]">
        Choose the tier that best matches your suit&apos;s current condition.
        Be honest, buyers trust SuitScore™.
      </p>

      <div className="flex flex-col gap-3">
        {TIERS.map((tier) => {
          const selected = value === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onChange(tier.id)}
              className={`relative flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                selected
                  ? "shadow-md"
                  : "border-slate-100 hover:border-slate-200 bg-white"
              }`}
              style={
                selected
                  ? { borderColor: tier.color, backgroundColor: tier.bg }
                  : undefined
              }
            >
              {/* Color dot + label */}
              <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: selected ? tier.color : "#F1F5F9" }}
                >
                  {selected ? (
                    <Check size={18} className="text-white" strokeWidth={3} />
                  ) : (
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tier.color }}
                    />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-[#1A1A2E]">{tier.label}</span>
                  <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                    {tier.races}
                  </span>
                  <span
                    className="text-xs font-semibold rounded-full px-2 py-0.5"
                    style={{ color: tier.color, backgroundColor: `${tier.color}18` }}
                  >
                    {tier.performance}
                  </span>
                </div>
                <ul className="space-y-0.5">
                  {tier.criteria.map((c) => (
                    <li key={c} className="text-xs text-[#64748B] flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: tier.color }} />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-500 text-center">
        Not sure?{" "}
        <a href="/suitscore" target="_blank" className="text-[#00B4FF] hover:underline">
          Read the full SuitScore™ guide
        </a>
      </p>
    </div>
  );
}
