const singletonTypes = new Set(["siteSettings", "fundProfile"]);

export const structure = (S) =>
  S.list()
    .title("TipHub")
    .items([
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings"),
        ),
      S.listItem()
        .title("Fund profile")
        .id("fundProfile")
        .child(
          S.document()
            .schemaType("fundProfile")
            .documentId("fundProfile"),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !singletonTypes.has(item.getId()),
      ),
    ]);
