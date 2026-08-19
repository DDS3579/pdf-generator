const FormalDocument = require("../src/core/FormalDocument");

const doc = new FormalDocument({
    title: "Phase 7 References Test",
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
});

doc.heading(1, "Phase 7: References");

doc.paragraph(
    "This document tests the reference rendering system. The engine supports " +
    "plain citation strings, structured citation objects, automatic numbering, " +
    "hanging indents, and pagination across multiple pages."
);

doc.heading(2, "1. Plain String References");

doc.references(
    [
        "Author One. The Structure of Formal Documents. Academic Press, 2024.",
        "Author Two. Typography for Technical Reports. Publishing Institute, 2025.",
        "Research Council. Guidelines for Official Document Preparation. 2026.",
        "Digital Standards Group. Automated Document Generation in Practice. Accessed August 2026."
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
            title: "Understanding Document Engines",
            publisher: "Technical Press",
            year: 2025
        },
        {
            authors: ["B. Editor", "C. Reviewer"],
            title: "Formal Typography in Practice",
            publisher: "Journal of Documents",
            year: 2024,
            url: "https://example.com/typography",
            accessed: "August 2026"
        },
        {
            citation:
                "D. Specialist. Advanced PDF Layout Methods. Conference Proceedings, 2023."
        },
        {
            author: "E. Analyst",
            title: "Pagination Rules in Long Documents",
            publisher: "Report Systems Review",
            year: 2026
        }
    ],
    {
        heading: false
    }
);

doc.pageBreak();

doc.heading(2, "3. Long Reference List");

doc.paragraph(
    "The following reference list is intentionally long so that we can test " +
    "pagination, hanging indents, and consistent spacing."
);

const longReferences = [];

for (let i = 1; i <= 30; i += 1) {
    longReferences.push(
        `Author ${i}. Research Paper Number ${i} on Document Engineering and ` +
        `Automated Layout Systems. Technical Publishing House, ${2000 + i}.`
    );
}

doc.references(longReferences, {
    heading: "Extended References",
    headingLevel: 2
});

doc.save("output/phase7-test.pdf");