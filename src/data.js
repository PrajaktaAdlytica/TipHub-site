export const thesisThemes = [
  {
    id: "01",
    title: "Intelligence infrastructure",
    short: "Access",
    description:
      "The hidden systems that make AI useful, reliable and accountable.",
    signal: "Automation is becoming infrastructure.",
    tags: "FINTECH / HEALTH / LEARNING",
  },
  {
    id: "02",
    title: "Essential systems",
    short: "Essential systems",
    description:
      "Rebuild the overlooked infrastructure that daily life depends on.",
    signal: "The overlooked work behind reliable cities.",
    tags: "CLIMATE / LOGISTICS / INDUSTRIAL",
  },
  {
    id: "03",
    title: "Productive economies",
    short: "Productive economies",
    description:
      "Give small operators leverage once reserved for large institutions.",
    signal: "Software that makes work more capable, adaptive and abundant.",
    tags: "WORK / COMMERCE / SOFTWARE",
  },
  {
    id: "04",
    title: "Connected markets",
    short: "Connected markets",
    description:
      "Create trust and flow across fragmented regions and networks.",
    signal: "Local proof can travel farther than hype.",
    tags: "MARKETPLACES / NETWORKS / PAYMENTS",
  },
];

export const convictionSteps = [
  {
    id: "01",
    title: "Read deeply",
    text: "We immerse in the problem, the people and the context others have not taken time to understand.",
  },
  {
    id: "02",
    title: "Decide clearly",
    text: "We make fewer bets with sharper conviction and explicit reasoning.",
  },
  {
    id: "03",
    title: "Work beside",
    text: "We partner closely with founders to refine, test and remove friction.",
  },
  {
    id: "04",
    title: "Open markets",
    text: "We unlock demand and create durable advantage across regions.",
  },
];

export const portfolio = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1).padStart(2, "0"),
  name: "Company name",
  theme: thesisThemes[index % thesisThemes.length].short,
  stage: ["Pre-seed", "Seed", "Selective A"][index % 3],
  region: "Global",
  status: "Active",
}));

export const team = [
  {
    name: "Maya Chen",
    role: "Investment partner",
    image: "/assets/team-maya.png",
    focus: "Essential systems · Market design",
    bio: "A provisional profile representing the investment-partner role. Replace identity, biography and links before publication.",
  },
  {
    name: "Elias Okafor",
    role: "Operating partner",
    image: "/assets/team-elias.png",
    focus: "Company building · Product",
    bio: "A provisional profile representing the operating-partner role. Replace identity, biography and links before publication.",
  },
  {
    name: "Anika Rao",
    role: "Principal",
    image: "/assets/team-anika.png",
    focus: "Connected markets · Fintech",
    bio: "A provisional profile representing the principal role. Replace identity, biography and links before publication.",
  },
  {
    name: "Julian Meyer",
    role: "Platform lead",
    image: "/assets/team-julian.png",
    focus: "Talent · Founder services",
    bio: "A provisional profile representing the platform-lead role. Replace identity, biography and links before publication.",
  },
];

export const notes = [
  {
    id: "04",
    theme: "Essential systems",
    title: "The overlooked work behind reliable cities",
    date: "18 Jul 2026",
  },
  {
    id: "05",
    theme: "Productive economies",
    title: "Why local proof travels farther than hype",
    date: "09 Jul 2026",
  },
  {
    id: "06",
    theme: "Connected markets",
    title: "The new geography of financial access",
    date: "27 Jun 2026",
  },
  {
    id: "07",
    theme: "Founder practice",
    title: "Learning loops for the pre-consensus years",
    date: "14 Jun 2026",
  },
];
