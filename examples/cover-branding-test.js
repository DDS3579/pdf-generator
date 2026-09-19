const FormalDocument = require("../src/core/FormalDocument");
const {
  createPlaceholderPng
} = require("../src/utils/createPlaceholderPng");

const logo = createPlaceholderPng(280, 90);

const doc = new FormalDocument({
  title: "Cover Branding Test",
  subtitle: "Logo, Metadata Rows, and Theme Support",
  author: "Engineering Team",
  organization: "Formal Document Engine",
  date: "August 2026",
  theme: "corporate",

  header: {
    left: "{organization}",
    right: "{date}"
  },

  footer: {
    left: "{title}",
    right: "Page {page} of {totalPages}"
  }
});

doc.cover({
  logo,
  version: "1.0.0",
  status: "Final",
  reference: "ENG-2026-014",
  meta: [
    {
      label: "Project",
      value: "Formal PDF Engine"
    },
    {
      label: "Owner",
      value: "Platform Team"
    },
    {
      label: "Distribution",
      value: "Internal"
    }
  ]
});

doc.heading(1, "Cover Branding Test");

doc.paragraph(
  "This document tests the enhanced cover page system. The cover should " +
  "display a logo, document title, subtitle, author, date, and structured " +
  "metadata rows such as version, status, reference, project, owner, and distribution."
);

doc.callout(
  "The cover page now supports branding metadata without requiring manual layout control.",
  {
    title: "Implementation Note",
    type: "info"
  }
);

doc.heading(2, "1. Supported Cover Fields");

doc.bullets([
  "logo",
  "logoWidth",
  "version",
  "status",
  "reference",
  "meta"
]);

doc.heading(2, "2. Example Meta Rows");

doc.table({
  caption: "Cover metadata examples",
  headers: ["Field", "Purpose"],
  rows: [
    ["logo", "Displays a centered logo at the top of the cover"],
    ["version", "Displays a Version metadata row"],
    ["status", "Displays a Status metadata row"],
    ["reference", "Displays a Reference metadata row"],
    ["meta", "Displays custom label/value metadata rows"]
  ],
  columnWidths: [1, 3],
  zebra: true
});

doc.save("output/cover-branding-test.pdf");