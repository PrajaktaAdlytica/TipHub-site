import { defineField, defineType } from "sanity";

export const thesisTheme = defineType({
  name: "thesisTheme",
  title: "Thesis theme",
  type: "document",
  fields: [
    defineField({ name: "order", title: "Order", type: "number", validation: (rule) => rule.required().min(1) }),
    defineField({ name: "code", title: "Display code", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "shortTitle", title: "Short title", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "signal", title: "Current signal", type: "string" }),
    defineField({
      name: "tags",
      title: "Focus tags",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title", order: "order", subtitle: "signal" },
    prepare: ({ title, order, subtitle }) => ({
      title: `${String(order || 0).padStart(2, "0")} — ${title || "Untitled"}`,
      subtitle,
    }),
  },
});
