const FormalDocument = require("../src/core/FormalDocument");

const doc = new FormalDocument({
    title: "Phase 5 Header/Footer Test",
    author: "Engineering Team",
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

doc.heading(1, "Phase 5: Headers, Footers, and Page Numbering");

doc.paragraph(
    "This document tests the page furniture system. The header should display " +
    "the organization name, confidentiality label, and date. The footer should " +
    "display the document title and page number. The engine renders these after " +
    "the main content has been laid out, allowing correct page numbering across " +
    "the full document."
);

doc.paragraph(
    "The layout engine reserves the top and bottom margins for page furniture. " +
    "Body content should not overlap the header or footer regions. This is " +
    "important for formal documents intended for print or official distribution. ".repeat(6)
);

doc.heading(2, "1. Pagination Check");

doc.paragraph(
    "The following content is intentionally long enough to create multiple pages. " +
    "Each page should contain the same header and footer structure. Page numbers " +
    "should increase correctly from page to page. ".repeat(20)
);

doc.pageBreak();

doc.heading(2, "2. Final Page");

doc.paragraph(
    "This paragraph appears after a manual page break. The header and footer " +
    "should still render correctly on this page."
);

doc.save("output/phase5-test.pdf");