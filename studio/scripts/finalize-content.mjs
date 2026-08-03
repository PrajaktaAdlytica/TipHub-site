import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-07-27" });

const companies = [
  ["heatoptx", "HeatOptx", "https://www.heatoptx.com", "Maps industrial heat loss, detects thermal anomalies, and ranks every fix by ROI.", "02"],
  ["bessopt", "BessOpt", "https://www.bessopt.com", "Health-aware battery optimization for revenue, dispatch, fleet control, and reporting.", "02"],
  ["loadlume", "Loadlume", "https://www.loadlume.com", "Helps industrial operators identify, forecast, dispatch, and verify flexible electricity demand.", "02"],
  ["klimori", "Klimori", "https://www.klimori.com", "Energy intelligence that connects the conditions shaping commercial building operations.", "02"],
  ["scopwise", "Scopwise", "https://www.scopwise.com", "Maps agent access, sets understandable boundaries, and produces review-ready evidence.", "01"],
  ["permra", "Permra", "https://www.permra.com", "A permission control plane for AI agents, with scoped access, approvals, revocation, and audit trails.", "01"],
  ["disclera", "Disclera", "https://www.disclera.com", "The evidence layer for defensible, audit-ready sustainability reporting.", "02"],
  ["sightroot", "SightRoot", "https://www.sightroot.com", "Connects visual defect detection, structured labeling, and root-cause investigation.", "03"],
  ["factorycue", "FactoryCue", "https://www.factorycue.com", "Connects downtime response, SOPs, maintenance knowledge, and shift handovers.", "03"],
  ["triaroute", "TriaRoute", "https://www.triaroute.com", "AI triage, routing, and care navigation for European healthcare systems.", "04"],
  ["coolerra", "Coolerra", "https://www.coolerra.com", "Thermal intelligence for GPU-heavy data centers, cloud, colocation, and server rooms.", "02"],
  ["ampacify", "Ampacify", "https://www.ampacify.com", "Turns grid congestion, interconnection, and flexible-load planning into one capacity model.", "02"],
  ["actclarity", "ActClarity", "https://www.actclarity.com", "An EU AI Act workspace for inventories, obligations, evidence, and review readiness.", "01"],
  ["toolclave", "Toolclave", "https://www.toolclave.com", "Verified tool infrastructure for governing every tool production AI agents can call.", "01"],
  ["mandvia", "Mandvia", "https://www.mandvia.com", "The control and evidence layer for accountable autonomous software spend.", "04"],
];

const portfolioDocuments = companies.map(
  ([slug, name, website, description, theme], index) => ({
    _id: `portfolio-${slug}`,
    _type: "portfolioCompany",
    order: index + 1,
    name,
    slug: { _type: "slug", current: slug },
    website,
    description,
    theme: { _type: "reference", _ref: `thesisTheme-${theme}` },
    stage: "Pre-seed",
    region: "Global",
    status: "Active",
    approvedForPublication: true,
  }),
);

let transaction = client
  .transaction()
  .patch("siteSettings", (patch) =>
    patch.set({
      legalAddress: "Global · Meetings by appointment",
      provisional: false,
    }),
  )
  .patch("fundProfile", (patch) =>
    patch.set({
      fundSize: "$500K",
      firstCheque: "Case by case",
      partnership: "Founder aligned",
      followOn: "Selective",
      provisional: false,
    }),
  );

for (const document of portfolioDocuments) {
  transaction = transaction.createOrReplace(document);
}

await transaction.commit();
console.log(
  `Published ${portfolioDocuments.length} portfolio companies and finalized the $500K fund profile.`,
);
