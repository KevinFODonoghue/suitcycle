import { Check } from "lucide-react";

const STEPS = [
  { label: "Photos" },
  { label: "Suit Details" },
  { label: "SuitScore™" },
  { label: "Price" },
  { label: "Perks" },
  { label: "Review" },
];

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex w-full py-1">
      {STEPS.map((step, i) => {
        const num = i + 1;
        const done = num < currentStep;
        const active = num === currentStep;

        return (
          <div key={step.label} className="flex-1 flex flex-col items-center gap-1.5 relative">
            {/* Left connector half — drawn from parent centre to left edge */}
            {i > 0 && (
              <div
                className={`absolute top-4 right-1/2 left-0 h-0.5 -translate-y-1/2 transition-colors ${
                  done || active ? "bg-[#00B4FF]" : "bg-slate-100"
                }`}
              />
            )}
            {/* Right connector half — drawn from parent centre to right edge */}
            {i < STEPS.length - 1 && (
              <div
                className={`absolute top-4 left-1/2 right-0 h-0.5 -translate-y-1/2 transition-colors ${
                  done ? "bg-[#00B4FF]" : "bg-slate-100"
                }`}
              />
            )}

            {/* Circle */}
            <div
              className={`relative z-10 w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold transition-all ${
                done
                  ? "bg-[#00B4FF] text-white"
                  : active
                  ? "bg-[#00B4FF] text-white ring-4 ring-[#00B4FF]/20"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {done ? <Check size={14} strokeWidth={3} /> : num}
            </div>

            {/* Label */}
            <span
              className={`text-xs font-medium text-center leading-tight ${
                active ? "text-[#1A1A2E]" : done ? "text-[#00B4FF]" : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
