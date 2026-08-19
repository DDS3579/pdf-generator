const filler = require("./helpers/filler");

module.exports = {
    output: "sample-02-research-report.pdf",

    document: {
        title: "Sample Research Report",
        subtitle: "A Demonstration of the Formal PDF Engine",
        author: "Engineering Team",
        organization: "Formal Document Engine",
        date: "August 2026",
        header: {
            left: "{organization}",
            right: "{date}"
        },
        footer: {
            left: "{title}",
            right: "Page {page} of {totalPages}"
        }
    },

    build(doc) {
        doc.cover();

        doc.heading(1, "Executive Summary");

        doc.paragraph(
            filler.paragraph(
                "This research report sample demonstrates cover pages, headings, paragraphs, lists, tables, and references",
                8
            )
        );

        doc.heading(1, "1. Introduction");

        doc.paragraph(
            filler.paragraph(
                "The introduction establishes the formal structure and verifies heading spacing, paragraph justification, and multi-page flow",
                8
            )
        );

        doc.heading(2, "1.1 Background");

        doc.paragraph(
            filler.paragraph(
                "Background content is used to test subsection headings and longer paragraph flow",
                8
            )
        );

        doc.heading(2, "1.2 Objectives");

        doc.bullets([
            "Validate formal A4 layout",
            "Validate automatic pagination",
            "Validate heading hierarchy",
            "Validate table and list rendering",
            "Validate header/footer behavior"
        ]);

        doc.heading(1, "2. Findings");

        doc.paragraph(
            filler.paragraph(
                "The findings section verifies that longer documents remain stable across multiple pages",
                10
            )
        );

        doc.table({
            headers: ["Area", "Observation", "Status"],
            rows: [
                ["Typography", "Consistent serif styling", "Verified"],
                ["Pagination", "Automatic page breaks", "Verified"],
                ["Tables", "Wrapped cells and rules", "Verified"],
                ["Lists", "Nested indentation", "Verified"],
                ["Headers", "Repeated page furniture", "Verified"]
            ],
            columnWidths: [1, 3, 1]
        });

        doc.heading(1, "3. Conclusion");

        doc.paragraph(
            filler.paragraph(
                "The conclusion confirms that the engine can generate a complete formal research report",
                8
            )
        );

        doc.references(
            [
                "Engineering Team. Formal PDF Engine Architecture Notes. 2026.",
                "PDFKit Documentation. PDF Generation for Node.js. Accessed August 2026.",
                {
                    author: "A. Researcher",
                    title: "Structured Document Generation",
                    publisher: "Technical Press",
                    year: 2025
                }
            ],
            {
                heading: "References",
                headingLevel: 1
            }
        );
    }
};