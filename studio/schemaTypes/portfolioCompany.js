import { defineField, defineType } from "sanity";

export const portfolioCompany = defineType({
  name: "portfolioCompany",
  title: "Portfolio company",
  type: "document",
  fields: [
    defineField({ name: "order", title: "Order", type: "number" }),
    defineField({ name: "name", title: "Company name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" }, validation: (rule) => rule.required() }),
    defineField({ name: "logo", title: "Logo", type: "image", options: { hotspot: true } }),
    defineField({ name: "website", title: "Website", type: "url" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4 }),
    defineField({ name: "founders", title: "Founders", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "theme", title: "Thesis theme", type: "reference", to: [{ type: "thesisTheme" }] }),
    defineField({
      name: "stage",
      title: "Stage invested",
      type: "string",
      options: { list: ["Pre-seed", "Seed", "Selective A", "Series A", "Growth"] },
    }),
    defineField({ name: "yearInvested", title: "Year invested", type: "number" }),
    defineField({ name: "region", title: "Region", type: "string" }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["Active", "Exited", "Acquired", "Private"] },
    }),
    defineField({
      name: "approvedForPublication",
      title: "Approved for public display",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "stage", media: "logo" },
  },
});
