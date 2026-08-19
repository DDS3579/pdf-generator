const FormalDocument = require('../src/core/FormalDocument');

// 1. Initialize the document
const doc = new FormalDocument({
    title: "Phase 1 Validation Report",
    author: "Engineering Team"
});

// 2. Add content
console.log("Rendering text...");

// Paragraph 1
doc.text(
    "This is the first paragraph of our formal document. The engine is designed to automatically " +
    "calculate the height of this text block before rendering it. If the text reaches the bottom " +
    "margin, the PageManager will automatically trigger a page break. This ensures that content " +
    "flows naturally without requiring manual coordinate management. ".repeat(4)
);

// Paragraph 2
doc.text(
    "Here is the second paragraph. Notice how the text is fully justified, which is the standard " +
    "for formal reports and academic papers. The typography relies on the embedded Merriweather " +
    "serif font, providing a professional and highly readable aesthetic. The layout engine tracks " +
    "the Y-cursor meticulously to ensure consistent spacing between paragraphs. ".repeat(5)
);

// Paragraph 3 (This one should trigger a page break)
doc.text(
    "This third paragraph contains a significant amount of text specifically designed to test " +
    "the pagination limits of the Phase 1 engine. As this text block renders, the PageManager " +
    "will measure its height using PDFKit's heightOfString method. Because this paragraph is " +
    "quite long, it will likely exceed the available vertical space on the current page. " +
    "When this happens, the engine will seamlessly transition to a new A4 page, reset the " +
    "Y-cursor to the top margin, and continue rendering the remainder of the text. " +
    "This proves that the core layout abstraction is functioning correctly. ".repeat(6)
);

// Paragraph 4
doc.text(
    "This is the final paragraph. It should appear cleanly on the final page, maintaining " +
    "the exact same margins, font styling, and justification as the previous pages. " +
    "Phase 1 is now complete."
);

// 3. Save the document
doc.save("output/phase1-test.pdf");