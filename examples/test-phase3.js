const FormalDocument = require("../src/core/FormalDocument");

const doc = new FormalDocument({
    title: "Phase 3 Lists Test",
    author: "Engineering Team"
});

doc.heading(1, "Phase 3: List System");

doc.paragraph(
    "This document tests bulleted lists, numbered lists, nested lists, " +
    "text wrapping, indentation, and automatic pagination. The list system " +
    "is intentionally strict about input shape so that AI-generated documents " +
    "fail early with useful errors instead of producing broken PDFs."
);

doc.heading(2, "1. Bulleted List");

doc.bullets([
    "The first point establishes the basic bullet structure.",
    "The second point contains a longer block of text to verify that wrapped lines align under the start of the list text, not under the bullet marker. This is known as a hanging indent and is essential for professional list typography.",
    {
        text: "The third point is a parent item with nested children.",
        children: [
            "This is the first nested point.",
            "This is the second nested point, which is slightly longer so we can confirm that nested wrapping also behaves correctly.",
            {
                text: "This nested point has another level beneath it.",
                children: [
                    "Third-level item one.",
                    "Third-level item two."
                ]
            }
        ]
    },
    "The fourth point returns to the top level."
]);

doc.heading(2, "2. Numbered List");

doc.numbered([
    "Define the objective of the document generation engine.",
    "Establish a clean layout abstraction above PDFKit.",
    "Implement typography rules in a centralized style registry.",
    "Validate the engine using progressively more complex sample documents.",
    "This numbered item is intentionally long so that we can test whether wrapped text remains aligned correctly beneath the number marker. In formal documents, this alignment is important because misaligned list text makes the document feel mechanically generated rather than professionally typeset."
]);

doc.heading(2, "3. Pagination Test");

doc.paragraph(
    "The following list is designed to cross a page boundary. Each item should " +
    "remain intact, and the list should continue cleanly on the next page."
);

doc.bullets([
    "Pagination item one.",
    "Pagination item two.",
    "Pagination item three.",
    "Pagination item four.",
    "Pagination item five.",
    "Pagination item six.",
    "Pagination item seven.",
    "Pagination item eight.",
    "Pagination item nine.",
    "Pagination item ten.",
    "Pagination item eleven.",
    "Pagination item twelve.",
    "Pagination item thirteen.",
    "Pagination item fourteen.",
    "Pagination item fifteen.",
    "Pagination item sixteen.",
    "Pagination item seventeen.",
    "Pagination item eighteen.",
    "Pagination item nineteen.",
    "Pagination item twenty."
]);

doc.heading(2, "4. Manual Page Break");

doc.paragraph(
    "The next section should begin on a new page because we explicitly request " +
    "a manual page break below."
);

doc.pageBreak();

doc.heading(2, "5. After Manual Page Break");

doc.paragraph(
    "This paragraph should appear at the top of a new page. This confirms that " +
    "manual page breaks work alongside automatic pagination."
);

doc.save("output/phase3-test.pdf");