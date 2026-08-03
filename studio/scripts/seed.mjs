import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-07-27" });

const siteSettings = {
  _id: "siteSettings",
  _type: "siteSettings",
  companyName: "TipHub",
  tagline: "Opportunity has a geography. Ambition does not.",
  companyDescription:
    "TipHub partners early with founders building essential companies across connected markets.",
  pitchEmail: "pitch@tiphub.vc",
  generalEmail: "hello@tiphub.vc",
  linkedinUrl: "https://www.linkedin.com",
  legalName: "TipHub Ventures",
  copyrightYear: 2026,
  provisional: true,
};

const fundProfile = {
  _id: "fundProfile",
  _type: "fundProfile",
  fundName: "TipHub Ventures",
  fundSize: "$50M",
  stages: ["Pre-seed", "Seed"],
  firstCheque: "$500K–$4M",
  partnership: "Lead or co-lead",
  followOn: "Meaningful reserve",
  geography: "Global",
  investmentThesis:
    "We back the uncommon before it becomes obvious: essential companies built from overlooked insight, connected markets, and lived expertise.",
  sectors: [
    "Intelligence infrastructure",
    "Essential systems",
    "Productive economies",
    "Connected markets",
  ],
  provisional: true,
};

const themes = [
  ["01", "Intelligence infrastructure", "Access", "The hidden systems that make AI useful, reliable and accountable.", "Automation is becoming infrastructure.", ["Fintech", "Health", "Learning"]],
  ["02", "Essential systems", "Essential systems", "Rebuild the overlooked infrastructure that daily life depends on.", "The overlooked work behind reliable cities.", ["Climate", "Logistics", "Industrial"]],
  ["03", "Productive economies", "Productive economies", "Give small operators leverage once reserved for large institutions.", "Software that makes work more capable, adaptive and abundant.", ["Work", "Commerce", "Software"]],
  ["04", "Connected markets", "Connected markets", "Create trust and flow across fragmented regions and networks.", "Local proof can travel farther than hype.", ["Marketplaces", "Networks", "Payments"]],
].map(([code, title, shortTitle, description, signal, tags], index) => ({
  _id: `thesisTheme-${code}`,
  _type: "thesisTheme",
  order: index + 1,
  code,
  title,
  shortTitle,
  description,
  signal,
  tags,
}));

const convictionSteps = [
  ["01", "Read deeply", "We immerse in the problem, the people and the context others have not taken time to understand."],
  ["02", "Decide clearly", "We make fewer bets with sharper conviction and explicit reasoning."],
  ["03", "Work beside", "We partner closely with founders to refine, test and remove friction."],
  ["04", "Open markets", "We unlock demand and create durable advantage across regions."],
].map(([code, title, text], index) => ({
  _id: `convictionStep-${code}`,
  _type: "convictionStep",
  order: index + 1,
  code,
  title,
  text,
}));

const founderModules = [
  ["Capital", "Shape the round, the story, and the investor map without losing the company inside the process.", "Capital", ["Financing", "Investor", "Follow-on"]],
  ["Craft", "Turn a sharp insight into a repeatable operating system across product, hiring, and go-to-market.", "Craft", ["Product", "Talent", "GTM"]],
  ["Connections", "Open the right customer, operator, market, and specialist conversations at the moment they matter.", "Connections", ["Customers", "Operators", "Markets"]],
].map(([title, description, category, tags], index) => ({
  _id: `founderModule-${index + 1}`,
  _type: "founderModule",
  order: index + 1,
  title,
  description,
  category,
  tags,
}));

const documents = [
  siteSettings,
  fundProfile,
  ...themes,
  ...convictionSteps,
  ...founderModules,
];

let transaction = client.transaction();
for (const document of documents) {
  transaction = transaction.createOrReplace(document);
}

await transaction.commit();
console.log(`Seeded ${documents.length} TipHub CMS documents.`);
