import type { Bucket } from "@data";

// `iconScale` lets us nudge per-bucket icons that have different padding/whitespace
// in their source PNG so they read as visually equal-weighted. Default = 1.
export const BUCKET_META: Record<
  Bucket,
  { image: string; description: string; iconScale?: number }
> = {
  growth: {
    image: "bucket-growth",
    description:
      "For PMs obsessed with moving the needle on activation and retention",
  },
  "shipping-ai": {
    image: "bucket-shipping-ai",
    description:
      "For builders navigating real tradeoffs in AI product development",
    iconScale: 1.3,
  },
  leadership: {
    image: "bucket-leadership",
    description: "For leads who must make the call when there's no playbook",
  },
  "zero-to-one": {
    image: "bucket-zerotoone",
    description: "For founders and PMs building something from nothing",
  },
  career: {
    image: "bucket-career",
    description:
      "For anyone at a career inflection point who needs a real sounding board",
  },
};
