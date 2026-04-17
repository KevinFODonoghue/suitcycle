import type { SuitCondition } from "@prisma/client";

const SUIT_SCORE_MIN = 0;
const SUIT_SCORE_MAX = 100;

export type SuitScoreTierMetric = {
  label: string;
  description: string;
};

export type SuitScoreTier = {
  id: SuitCondition;
  rating: number;
  minScore: number;
  name: string;
  shortLabel: string;
  summary: string;
  paletteClass: string;
  performance: string;
  metrics: SuitScoreTierMetric[];
};

export const SUITSCORE_TIERS: SuitScoreTier[] = [
  {
    id: "gold",
    rating: 5,
    minScore: 90,
    name: "Gold SuitScore",
    shortLabel: "Gold",
    summary: "Suitable for championship-level competition. (0-2 races)",
    paletteClass:
      "border-[#d3a21a] text-white",
    performance: "Performance - 100% of original tech suit performance.",
    metrics: [
      {
        label: "World Aquatics label",
        description: "Fully visible, bold, no fading\nFlat against fabric with no wrinkles or peeling",
      },
      {
        label: "Elasticity",
        description:
          "Snaps back immediately when gently stretched\nFeels tight across hips, shoulders, and thighs with no looseness at seams",
      },
      {
        label: "Water repellency",
        description:
          "Water beads instantly and completely rolls off within 1 second of application\nEntire surface repels water evenly",
      },
    ],
  },
  {
    id: "podium",
    rating: 4,
    minScore: 78,
    name: "Podium SuitScore",
    shortLabel: "Podium",
    summary: "Trusted for finals meets or high-level time trials. (3-6 races)",
    paletteClass:
      "border-[#a7afba] text-[#0f172a]",
    performance: "Performance - 90% of original tech suit performance.",
    metrics: [
      {
        label: "World Aquatics label",
        description: "Clearly readable with slight fading\nMay have minor wrinkles but no lifting or peeling",
      },
      {
        label: "Elasticity",
        description:
          "Mostly firm with slight softness in high-stretch zones\nSuit feels compressive, but slightly easier to put on",
      },
      {
        label: "Water repellency",
        description: "Water beads on 80-90% of the surface\nSome light absorption begins after 1-2 seconds",
      },
    ],
  },
  {
    id: "prelim",
    rating: 3,
    minScore: 65,
    name: "Prelim SuitScore",
    shortLabel: "Prelim",
    summary: "Suitable for mid-season meets or as a backup race suit. (7-10 races)",
    paletteClass:
      "border-[#2f8f6b] text-white",
    performance: "Performance - 70-80% of original performance.",
    metrics: [
      {
        label: "World Aquatics label",
        description:
          "Noticeably faded but still easily readable\nMay have light peeling at edges\nMay have some wrinkles",
      },
      {
        label: "Elasticity",
        description:
          "Moderate stretch recovery; seams may feel less firm\nFeels snug but lacks full compression",
      },
      {
        label: "Water repellency",
        description: "Water beads on 50-75% of the surface\nWater slowly absorbs after 3-5 seconds",
      },
    ],
  },
  {
    id: "backup",
    rating: 2,
    minScore: 50,
    name: "Backup SuitScore",
    shortLabel: "Backup",
    summary: "Ideal for warmups, low-level meets, or practice wear. (11-14 races)",
    paletteClass:
      "border-[#2b89b8] text-white",
    performance: "Performance - 40-60% of original performance.",
    metrics: [
      {
        label: "World Aquatics label",
        description:
          "Faded and partially unreadable\nWrinkles and cracks present\nPeeling or lifted edges on label",
      },
      {
        label: "Elasticity",
        description:
          "Noticeable looseness at seams or knees\nCompression is minimal, suit fits more like a snug jammer",
      },
      {
        label: "Water repellency",
        description: "Water beads on <50% of the surface\nAbsorbs water slowly across most areas",
      },
    ],
  },
  {
    id: "practice",
    rating: 1,
    minScore: 0,
    name: "Practice SuitScore",
    shortLabel: "Practice",
    summary: "No competitive advantage remains. Best for training, warmups, or demonstration. (15+ races)",
    paletteClass:
      "border-[#5e6675] text-white",
    performance: "Performance - 0-20% of original performance.",
    metrics: [
      {
        label: "World Aquatics label",
        description: "Partially missing, illegible, or fully peeled off",
      },
      {
        label: "Elasticity",
        description: "Loose throughout, material is limp or overstretched\nSeams do not provide compression",
      },
      {
        label: "Water repellency",
        description: "No beading, water soaks in immediately",
      },
    ],
  },
] as const;

const CONDITION_SCORE_MAP = SUITSCORE_TIERS.reduce<Record<SuitCondition, number>>((acc, tier) => {
  acc[tier.id] = tier.minScore;
  return acc;
}, {} as Record<SuitCondition, number>);

export function clampSuitScore(score: number): number {
  if (Number.isNaN(score)) return SUIT_SCORE_MIN;
  return Math.min(SUIT_SCORE_MAX, Math.max(SUIT_SCORE_MIN, Math.round(score)));
}
export function getSuitScoreForCondition(condition: SuitCondition): number {
  return (
    CONDITION_SCORE_MAP[condition] ??
    SUITSCORE_TIERS[SUITSCORE_TIERS.length - 1]?.minScore ??
    SUIT_SCORE_MIN
  );
}

export function scoreToTier(score: number): SuitScoreTier {
  const normalized = clampSuitScore(score);
  return (
    SUITSCORE_TIERS.find((tier) => normalized >= tier.minScore) ??
    SUITSCORE_TIERS[SUITSCORE_TIERS.length - 1]
  );
}

export function suitScoreBadgeClass(score: number): string {
  return scoreToTier(score).paletteClass;
}

export function suitScoreLabel(score: number): string {
  const tier = scoreToTier(score);
  return `${tier.name} SuitScore tier ${tier.rating}/5`;
}


export function getSuitConditionMetadata(condition: SuitCondition): SuitScoreTier {
  const tier = SUITSCORE_TIERS.find((entry) => entry.id === condition);
  if (!tier) {
    return SUITSCORE_TIERS[SUITSCORE_TIERS.length - 1];
  }
  return tier;
}
