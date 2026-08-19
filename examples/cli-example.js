module.exports = {
    output: "cli-example-report.pdf",

    document: {
        title: "CLI Example Report",
        subtitle: "Phase 9 Document Runner",
        author: "Engineering Team",
        organization: "Formal Document Engine",
        date: "August 2026",
        confidential: false,
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
    },

    build(doc) {
        doc.cover();

        doc.heading(1, "Executive Summary");

        doc.paragraph(
            "This document was generated using the formal PDF engine CLI. " +
            "The document module exports a configuration object and a build " +
            "function. The CLI initializes the document, renders the content, " +
            "handles pagination, and writes the final PDF to the output directory."
        );

        doc.heading(2, "1. Key Capabilities");

        doc.bullets([
            "Automatic pagination",
            "Formal A4 layout",
            "Headings, paragraphs, lists, and tables",
            "Headers, footers, and page numbering",
            "Cover pages",
            "References",
            "Images and captions"
        ]);

        doc.heading(2, "2. Sample Table");

        doc.table({
            headers: ["Component", "Status", "Phase"],
            rows: [
                ["Layout engine", "Complete", "Phase 1"],
                ["Typography", "Complete", "Phase 2"],
                ["Lists", "Complete", "Phase 3"],
                ["Tables", "Complete", "Phase 4"],
                ["Headers and footers", "Complete", "Phase 5"],
                ["Cover pages", "Complete", "Phase 6"],
                ["References", "Complete", "Phase 7"],
                ["Images", "Complete", "Phase 8"],
                ["CLI", "Complete", "Phase 9"]
            ],
            columnWidths: [3, 2, 1],
            aligns: ["left", "left", "right"]
        });

        doc.heading(2, "3. Conclusion");

        doc.paragraph(
            "The engine is now ready for structured document generation through " +
            "a reusable CLI. The next major step is to create a broader suite of " +
            "sample documents and tests to validate long-term reliability."
        );

        doc.references(
            [
                "Engineering Team. Formal PDF Engine Architecture Notes. 2026.",
                "PDFKit Documentation. PDF Generation for Node.js. Accessed August 2026."
            ],
            {
                heading: "References",
                headingLevel: 2
            }
        );
    }
};