const FormalDocument = require("../src/core/FormalDocument");

const doc = new FormalDocument({
    title: "Phase 4 Table Test",
    author: "Engineering Team"
});

doc.heading(1, "Phase 4: Table System");

doc.paragraph(
    "This document tests the formal table engine. The default table style is " +
    "restrained and print-oriented: strong horizontal rules, clean cell padding, " +
    "wrapped text, and repeated headers across pages."
);

doc.heading(2, "1. Simple Table");

doc.table({
    headers: ["Country", "Population", "Growth"],
    rows: [
        ["Nepal", "30.5M", "1.1%"],
        ["India", "1.4B", "0.8%"],
        ["China", "1.4B", "0.1%"],
        ["Indonesia", "277M", "0.7%"]
    ],
    columnWidths: [2, 1, 1],
    aligns: ["left", "right", "right"]
});

doc.heading(2, "2. Wrapped Cells");

doc.table({
    headers: ["Category", "Finding", "Evidence"],
    rows: [
        [
            "Economic",
            "Automation is reshaping labor demand across administrative, " +
            "logistical, and analytical roles.",
            "National labor survey, 2025"
        ],
        [
            "Regulatory",
            "Governments are increasingly interested in transparency, " +
            "accountability, and auditability requirements for automated " +
            "decision systems.",
            "Policy review document, 2026"
        ],
        [
            "Operational",
            "Organizations adopting structured document pipelines report " +
            "lower formatting overhead and more consistent output quality.",
            "Internal operations review"
        ]
    ],
    columnWidths: [1, 3, 2]
});

doc.heading(2, "3. Multi-Page Table");

doc.paragraph(
    "The following table is intentionally long. The header row should repeat " +
    "on each new page, and rows should not be split awkwardly across pages."
);

const rows = [];

for (let i = 1; i <= 45; i += 1) {
    rows.push([
        String(i),
        `Operational finding number ${i}. This row is long enough to verify ` +
        `that wrapped table text remains aligned and readable across multiple ` +
        `table rows.`,
        `Source ${i}`
    ]);
}

doc.table({
    headers: ["ID", "Finding", "Evidence"],
    rows,
    columnWidths: [1, 4, 2],
    rowRules: true
});

doc.heading(2, "4. After Table");

doc.paragraph(
    "This paragraph appears after the table. It should begin below the table " +
    "with normal spacing, confirming that the layout cursor was correctly " +
    "restored after table rendering."
);

doc.save("output/phase4-test.pdf");