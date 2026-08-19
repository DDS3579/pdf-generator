const filler = require("./helpers/filler");

module.exports = {
    output: "sample-03-table-heavy-report.pdf",

    document: {
        title: "Table-Heavy Sample Report",
        author: "Engineering Team",
        organization: "Formal Document Engine",
        date: "August 2026",
        header: {
            left: "{organization}",
            right: "{date}"
        },
        footer: {
            left: "{title}",
            right: "{page}"
        }
    },

    build(doc) {
        doc.heading(1, "Table-Heavy Sample Report");

        doc.paragraph(
            "This sample verifies multiple tables, repeated headers, wrapped cells, and row rules."
        );

        doc.heading(2, "1. First Table");

        doc.table({
            headers: ["ID", "Description", "Source"],
            rows: filler.tableRows(12, "Item"),
            columnWidths: [1, 4, 2]
        });

        doc.heading(2, "2. Second Table");

        doc.table({
            headers: ["Category", "Finding", "Evidence"],
            rows: [
                ["Economic", "Automation is changing labor demand.", "Survey 2025"],
                ["Regulatory", "Transparency requirements are increasing.", "Policy Review 2026"],
                ["Operational", "Document pipelines reduce formatting overhead.", "Internal Report"]
            ],
            columnWidths: [1, 3, 2],
            rowRules: true
        });

        doc.heading(2, "3. Long Table");

        doc.table({
            headers: ["Row", "Description", "Source"],
            rows: filler.tableRows(45, "Record"),
            columnWidths: [1, 4, 2],
            rowRules: true
        });
    }
};