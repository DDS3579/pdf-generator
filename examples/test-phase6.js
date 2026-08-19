const FormalDocument = require("../src/core/FormalDocument");

const doc = new FormalDocument({
    title: "The Impact of Artificial Intelligence",
    subtitle: "A Comprehensive Research Report",
    author: "Research Department",
    organization: "Formal Document Engine",
    date: "August 2026",
    confidential: true,
    header: {
        left: "{organization}",
        center: "{confidentiality}",
        right: "{date}"
    },
    footer: {
        left: "{title}",
        center: "",
        right: "Page {page} of {totalPages}"
    }
});

doc.cover();

doc.heading(1, "Executive Summary");

doc.paragraph(
    "This document tests the formal cover page system. The cover page should " +
    "be unnumbered and should not display headers or footers. The first content " +
    "page after the cover should begin as page 1."
);

doc.heading(2, "1. Introduction");

doc.paragraph(
    "Artificial intelligence has significantly changed the way organizations " +
    "produce, analyze, and distribute formal documents. Automated pipelines " +
    "now allow structured content to be converted into polished, print-ready " +
    "output with minimal manual formatting effort. ".repeat(6)
);

doc.heading(2, "2. Findings");

doc.paragraph(
    "The findings indicate that layout abstraction is essential for reliable " +
    "document generation. When the engine handles pagination, typography, and " +
    "spacing automatically, the resulting documents are more consistent and " +
    "significantly easier to maintain. ".repeat(10)
);

doc.pageBreak();

doc.heading(2, "3. Conclusion");

doc.paragraph(
    "This final page confirms that pagination still works correctly after the " +
    "cover page has been inserted. The page number shown here should reflect " +
    "the content page number, not the physical PDF page number."
);

doc.save("output/phase6-test.pdf");