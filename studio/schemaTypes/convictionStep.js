import { defineField, defineType } from "sanity";

export const convictionStep = defineType({
  name: "convictionStep",
  title: "Conviction step",
  type: "document",
  fields: [
    defineField({ name: "order", title: "Order", type: "number", validation: (rule) => rule.required().min(1) }),
    defineField({ name: "code", title: "Display code", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "text", title: "Description", type: "text", rows: 3 }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
});
