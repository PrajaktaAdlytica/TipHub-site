import { defineField, defineType } from "sanity";

export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  fields: [
    defineField({ name: "order", title: "Order", type: "number" }),
    defineField({ name: "name", title: "Full name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "role", title: "Role", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "headshot", title: "Professional headshot", type: "image", options: { hotspot: true } }),
    defineField({ name: "shortBio", title: "Short biography", type: "text", rows: 3 }),
    defineField({ name: "fullBio", title: "Full biography", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "focus", title: "Investment focus", type: "string" }),
    defineField({ name: "linkedinUrl", title: "LinkedIn URL", type: "url" }),
    defineField({ name: "email", title: "Public email", type: "string" }),
    defineField({
      name: "previousExperience",
      title: "Previous companies or experience",
      type: "array",
      of: [{ type: "string" }],
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
    select: { title: "name", subtitle: "role", media: "headshot" },
  },
});
