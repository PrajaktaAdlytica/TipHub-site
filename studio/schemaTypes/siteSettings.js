import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "companyName",
      title: "Company name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "companyDescription",
      title: "Company description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "pitchEmail",
      title: "Pitch email",
      type: "string",
    }),
    defineField({
      name: "generalEmail",
      title: "General email",
      type: "string",
    }),
    defineField({
      name: "linkedinUrl",
      title: "LinkedIn URL",
      type: "url",
    }),
    defineField({
      name: "legalName",
      title: "Legal entity name",
      type: "string",
    }),
    defineField({
      name: "legalAddress",
      title: "Legal address",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "copyrightYear",
      title: "Copyright year",
      type: "number",
      initialValue: 2026,
    }),
    defineField({
      name: "provisional",
      title: "Show provisional content notice",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    prepare: () => ({ title: "TipHub site settings" }),
  },
});
