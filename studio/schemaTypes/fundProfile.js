import { defineField, defineType } from "sanity";

export const fundProfile = defineType({
  name: "fundProfile",
  title: "Fund profile",
  type: "document",
  fields: [
    defineField({ name: "fundName", title: "Official fund name", type: "string" }),
    defineField({ name: "fundSize", title: "Fund size", type: "string" }),
    defineField({
      name: "stages",
      title: "Investment stages",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "firstCheque", title: "Typical first cheque", type: "string" }),
    defineField({ name: "partnership", title: "Partnership model", type: "string" }),
    defineField({ name: "followOn", title: "Follow-on strategy", type: "string" }),
    defineField({ name: "geography", title: "Geographic mandate", type: "string" }),
    defineField({
      name: "investmentThesis",
      title: "Investment thesis",
      type: "text",
      rows: 6,
    }),
    defineField({
      name: "sectors",
      title: "Target sectors",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "provisional",
      title: "Fund information is provisional",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "fundName", subtitle: "fundSize" },
  },
});
