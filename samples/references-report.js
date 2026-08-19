module.exports = {
    output: "sample-06-references-report.pdf",

    document: {
        title: "References Sample",
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
        doc.heading(1, "References Sample");

        doc.paragraph(
            "This sample verifies plain string references, structured references, long reference pagination, and hanging indentation."
        );

        doc.heading(2, "1. Plain References");

        doc.references(
            [
                "Author One. Formal Document Systems. Academic Press, 2024.",
                "Author Two. Automated Layout Engines. Technical Review, 2025.",
                "Standards Council. Official Document Formatting Guidance. 2026."
            ],
            {
                heading: false
            }
        );

        doc.heading(2, "2. Structured References");

        doc.references(
            [
                {
                    author: "A. Researcher",
                    title: "Document Generation Architecture",
                    publisher: "Engineering Press",
                    year: 2025
                },
                {
                    authors: ["B. Editor", "C. Reviewer"],
                    title: "Typography and Formal Reports",
                    publisher: "Journal of Document Science",
                    year: 2024,
                    url: "https://example.com/typography",
                    accessed: "August 2026"
                },
                {
                    citation: "D. Specialist. PDF Layout Constraints. Conference Proceedings, 2023."
                }
            ],
            {
                heading: false
            }
        );

        doc.heading(2, "3. Long Reference List");

        doc.references(
            Array.from({ length: 40 }, (_, index) => {
                return `Author ${index + 1}. Research Paper ${index + 1} on Formal Document Engineering. Technical Publishing House, ${2000 + index}.`;
            }),
            {
                heading: "Extended References",
                headingLevel: 2
            }
        );
    }
};