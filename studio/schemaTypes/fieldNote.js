import { defineField, defineType } from "sanity";

export const fieldNote = defineType({
  name: "fieldNote",
  title: "Field note",
  type: "document",
  fields: [
    defineField({ name: "order", title: "Order", type: "number" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (rule) => rule.required() }),
    defineField({ name: "theme", title: "Theme", type: "string" }),
    defineField({ name: "excerpt", title: "Summary", type: "text", rows: 4 }),
    defineField({ name: "body", title: "Article body", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "coverImage", title: "Cover image", type: "image", options: { hotspot: true } }),
    defineField({ name: "author", title: "Author", type: "reference", to: [{ type: "teamMember" }] }),
    defineField({ name: "publishedAt", title: "Publication date", type: "datetime" }),
    defineField({ name: "readingTime", title: "Reading time in minutes", type: "number" }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    defineField({ name: "published", title: "Published", type: "boolean", initialValue: false }),
  ],
  orderings: [{ title: "Newest first", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", subtitle: "theme", media: "coverImage" },
  },
});
