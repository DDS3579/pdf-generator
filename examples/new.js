const FormalDocument = require("../src/core/FormalDocument");
const {
  createPlaceholderPng
} = require("../src/utils/createPlaceholderPng");

const doc = new FormalDocument({
  title: "Theme & Visual Components Test",
  subtitle: "Phase 1 + Phase 2 Validation",
  author: "Engineering Team",
  organization: "Formal Document Engine",
  date: "August 2026",
  theme: "modern",
  header: {
    left: "{organization}",
    right: "{date}"
  },
  footer: {
    left: "{title}",
    right: "Page {page} of {totalPages}"
  }
});

doc.cover();

doc.heading(1, "Theme & Visual Components Test");

doc.paragraph(
  "This document tests the theme system and visual components. " +
  "The modern theme should apply softer text colors, muted header/footer colors, " +
  "themed rules, table header backgrounds, zebra rows, and caption colors."
);

doc.spacer(18);

doc.divider();

doc.heading(2, "1. Callout Types");

doc.callout(
  "This is a simple callout box without a type. It should use the default callout styling from the active style registry.",
  {
    title: "Default Callout"
  }
);

doc.callout(
  "This is an informational callout. It is useful for explanatory notes, context, and supplementary details.",
  {
    title: "Information",
    type: "info"
  }
);

doc.callout(
  "This is a warning callout. It is useful for risks, constraints, and important cautions.",
  {
    title: "Warning",
    type: "warning"
  }
);

doc.callout(
  "This is a success callout. It is useful for confirmations, completed milestones, and positive status updates.",
  {
    title: "Success",
    type: "success"
  }
);

doc.callout(
  "This is a danger callout. It is useful for critical issues, blockers, and high-severity findings.",
  {
    title: "Critical",
    type: "danger"
  }
);

doc.heading(2, "2. Spacer and Divider");

doc.paragraph(
  "The following divider is intentionally placed after this paragraph. " +
  "It should create a clean visual separation without breaking pagination."
);

doc.divider({
  widthRatio: 0.4,
  spacingBefore: 16,
  spacingAfter: 16
});

doc.paragraph(
  "This paragraph follows the divider. The spacing above and below the divider " +
  "should feel balanced and formal."
);

doc.heading(2, "3. Table Caption Test");

doc.table({
  caption: "Implementation status of the formal PDF engine",
  headers: ["Component", "Status", "Phase"],
  rows: [
    ["Theme foundation", "Complete", "Phase 1"],
    ["Renderer color support", "Complete", "Phase 1"],
    ["Spacer", "Complete", "Phase 2"],
    ["Divider", "Complete", "Phase 2"],
    ["Callout", "Complete", "Phase 2"],
    ["Table caption", "Complete", "Phase 2"],
    ["Zebra rows", "Complete", "Phase 2"]
  ],
  columnWidths: [3, 2, 1],
  aligns: ["left", "left", "right"],
  zebra: true
});

doc.heading(2, "4. Second Table Caption");

doc.table({
  caption: "Additional validation checks",
  headers: ["Check", "Result"],
  rows: [
    ["Pagination", "Verified"],
    ["Table header repetition", "Verified"],
    ["Callout wrapping", "Verified"],
    ["Divider spacing", "Verified"]
  ],
  columnWidths: [3, 2],
  zebra: true
});

doc.heading(2, "5. Figure Test");

const imageBuffer = createPlaceholderPng(560, 300);

doc.figure(imageBuffer, {
  caption: "A placeholder figure used to test themed borders and caption colors.",
  width: "70%",
  border: true
});

doc.heading(2, "6. References");

doc.references([
  "Engineering Team. Formal PDF Engine Theme Specification. 2026.",
  "PDFKit Documentation. PDF Generation for Node.js. Accessed August 2026."
]);

doc.save("output/theme-visual-test.pdf");