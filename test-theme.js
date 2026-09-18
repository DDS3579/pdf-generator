// test-theme-renderers.js

const FormalDocument = require("./src/core/FormalDocument");
const {
  createPlaceholderPng
} = require("./src/utils/createPlaceholderPng");

const doc = new FormalDocument({
  title: "Theme Renderer Test",
  subtitle: "Phase 1 Step 2 Validation",
  author: "Engineering Team",
  organization: "Formal Document Engine",
  date: "August 2026",
  theme: "modern",
  header: {
    left: "{organization}",
    center: "",
    right: "{date}"
  },
  footer: {
    left: "{title}",
    center: "",
    right: "Page {page} of {totalPages}"
  }
});

doc.cover();

doc.heading(1, "Theme Renderer Test");

doc.paragraph(
  "This document tests the theme-aware renderer updates. The modern theme " +
  "should apply softer text colors, muted header/footer colors, themed rules, " +
  "table header backgrounds, zebra rows, and caption colors."
);

doc.quote(
  "This blockquote should use the muted text color defined by the active theme."
);

doc.heading(2, "1. Lists");

doc.bullets([
  "Bullet list item one",
  "Bullet list item two",
  {
    text: "Parent bullet item",
    children: [
      "Nested bullet item"
    ]
  }
]);

doc.numbered([
  "Numbered item one",
  "Numbered item two",
  "Numbered item three"
]);

doc.heading(2, "2. Themed Table");

doc.table({
  headers: ["Component", "Status", "Phase"],
  rows: [
    ["Theme Manager", "Complete", "Phase 1"],
    ["Style Registry", "Complete", "Phase 1"],
    ["Cover Renderer", "Updated", "Phase 1"],
    ["Table Renderer", "Updated", "Phase 1"],
    ["Page Furniture", "Updated", "Phase 1"],
    ["References", "Updated", "Phase 1"],
    ["Figures", "Updated", "Phase 1"]
  ],
  columnWidths: [3, 2, 2],
  aligns: ["left", "left", "right"]
});

doc.heading(2, "3. Figure Test");

const imageBuffer = createPlaceholderPng(560, 300);

doc.figure(imageBuffer, {
  caption: "A placeholder figure used to test themed borders and caption colors.",
  width: "70%",
  border: true
});

doc.heading(2, "4. References");

doc.references([
  "Engineering Team. Formal PDF Engine Theme Specification. 2026.",
  "PDFKit Documentation. PDF Generation for Node.js. Accessed August 2026."
]);

doc.save("output/theme-renderers-test.pdf");