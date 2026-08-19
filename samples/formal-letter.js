const filler = require("./helpers/filler");

module.exports = {
    output: "sample-01-formal-letter.pdf",

    document: {
        title: "Formal Letter Sample",
        author: "Engineering Team",
        organization: "Formal Document Engine",
        date: "August 2026",
        header: false,
        footer: {
            left: "{organization}",
            right: "{page}"
        }
    },

    build(doc) {
        doc.paragraph("August 2026", {
            align: "right"
        });

        doc.paragraph(
            "To: Review Committee\n" +
            "Formal Document Engine",
            {
                align: "left"
            }
        );

        doc.heading(2, "Subject: Sample Formal Letter");

        doc.paragraph(
            filler.paragraph(
                "This letter sample verifies one-page formal layout, left-aligned body text, and restrained spacing"
            ),
            {
                align: "left"
            }
        );

        doc.paragraph(
            filler.paragraph(
                "The purpose of this sample is to confirm that the engine can produce official correspondence without requiring a cover page or complex structural components"
            ),
            {
                align: "left"
            }
        );

        doc.paragraph("Sincerely,", {
            align: "left"
        });

        doc.paragraph("Engineering Team", {
            align: "right"
        });

        doc.paragraph("Formal Document Engine", {
            align: "right"
        });
    }
};