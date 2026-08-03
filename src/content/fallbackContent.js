import {
  convictionSteps,
  notes,
  portfolio,
  team,
  thesisThemes,
} from "../data";

export const fallbackContent = {
  siteSettings: {
    companyName: "TipHub",
    tagline: "Opportunity has a geography. Ambition does not.",
    companyDescription:
      "TipHub partners early with founders building essential companies across connected markets.",
    pitchEmail: "pitch@tiphub.vc",
    generalEmail: "hello@tiphub.vc",
    linkedinUrl: "https://www.linkedin.com",
    legalName: "TipHub Ventures",
    legalAddress: "Global · By appointment",
    copyrightYear: 2026,
    provisional: false,
  },
  fundProfile: {
    fundName: "TipHub Ventures",
    fundSize: "$500K",
    stages: ["Pre-seed", "Seed"],
    firstCheque: "Case by case",
    partnership: "Founder aligned",
    followOn: "Selective",
    geography: "Global",
    investmentThesis:
      "We back the uncommon before it becomes obvious: essential companies built from overlooked insight, connected markets, and lived expertise.",
    sectors: [
      "Intelligence infrastructure",
      "Essential systems",
      "Productive economies",
      "Connected markets",
    ],
    provisional: false,
  },
  thesisThemes,
  convictionSteps,
  portfolio,
  team,
  notes,
  founderModules: [
    {
      id: "01",
      title: "Capital",
      description:
        "Shape the round, the story, and the investor map without losing the company inside the process.",
      category: "Capital",
      tags: "FINANCING / INVESTOR / FOLLOW-ON",
    },
    {
      id: "02",
      title: "Craft",
      description:
        "Turn a sharp insight into a repeatable operating system across product, hiring, and go-to-market.",
      category: "Craft",
      tags: "PRODUCT / TALENT / GTM",
    },
    {
      id: "03",
      title: "Connections",
      description:
        "Open the right customer, operator, market, and specialist conversations at the moment they matter.",
      category: "Connections",
      tags: "CUSTOMERS / OPERATORS / MARKETS",
    },
  ],
};
