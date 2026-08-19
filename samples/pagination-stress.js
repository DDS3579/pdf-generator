const filler = require("./helpers/filler");

module.exports = {
    output: "sample-05-pagination-stress.pdf",

    document: {
        title: "Pagination Stress Test",
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
        doc.heading(1, "Pagination Stress Test");

        doc.paragraph(
            "This sample is designed to stress automatic pagination using headings, paragraphs, lists, tables, and references."
        );

        for (let section = 1; section <= 8; section += 1) {
            doc.heading(1, `${section}. Section ${section}`);

            doc.paragraph(
                filler.paragraph(
                    `Section ${section} verifies long-form pagination behavior`,
                    8
                )
            );

            doc.heading(2, `${section}.1 Subsection`);

            doc.paragraph(
                filler.paragraph(
                    `Subsection ${section}.1 verifies heading keep-with-next behavior and paragraph continuation`,
                    6
                )
            );

            doc.bullets([
                `Validation point one for section ${section}`,
                `Validation point two for section ${section}`,
                `Validation point three for section ${section}`
            ]);

            if (section % 2 === 0) {
                doc.table({
                    headers: ["ID", "Description", "Source"],
                    rows: filler.tableRows(8, `S${section}`),
                    columnWidths: [1, 4, 2]
                });
            }
        }

        doc.references(
            Array.from({ length: 25 }, (_, index) => {
                return `Author ${index + 1}. Pagination Study Volume ${index + 1}. Technical Press, ${2000 + index}.`;
            }),
            {
                heading: "References",
                headingLevel: 1
            }
        );
    }
};