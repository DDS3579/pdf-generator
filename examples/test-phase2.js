const FormalDocument = require("../src/core/FormalDocument");

const doc = new FormalDocument({
    title: "Phase 2 Typography & Layout",
    author: "Engineering Team"
});

doc.heading(1, "1. Introduction to Formal Typography");

doc.paragraph(
    "This document tests the Phase 2 engine capabilities. We are establishing a strict " +
    "typography hierarchy using size and spacing rather than relying purely on bold weights. " +
    "This approach results in a cleaner, more restrained aesthetic typical of high-end " +
    "academic journals and official government reports."
);

doc.heading(2, "1.1 The Keep-With-Next Rule");

doc.paragraph(
    "One of the most critical rules in professional typesetting is preventing a heading " +
    "from being stranded at the very bottom of a page while its associated paragraph starts " +
    "on the following page. Our PageManager calculates the height of the heading plus the " +
    "height of at least one line of paragraph text before rendering."
);

// Fill the page up to near the bottom
doc.paragraph(
    "To test this, we need to push the next heading close to the bottom margin. ".repeat(15) +
    "Notice how the text is fully justified, creating clean vertical margins on both sides. " +
    "The spacing between paragraphs is handled automatically by the StyleRegistry, ensuring " +
    "consistent vertical rhythm throughout the document. ".repeat(5)
);

// This heading should trigger a page break because there isn't room for it + a paragraph
doc.heading(2, "1.2 Testing the Page Break");

doc.paragraph(
    "If the engine works correctly, you should not see the heading '1.2 Testing the Page Break' " +
    "stranded at the bottom of the previous page. The layout engine detected that there wasn't " +
    "enough vertical space for both this heading and the first line of this paragraph, so it " +
    "forced a page break before rendering the heading. This is the hallmark of a polished PDF."
);

doc.heading(3, "1.2.1 Blockquotes");

doc.quote(
    "A blockquote is used to offset significant excerpts of text from the main body. " +
    "Notice how it uses the italic variant of our serif font, is slightly indented from " +
    "both the left and the right margins, and uses left alignment instead of justification."
);

doc.paragraph(
    "Following the blockquote, the text returns to the standard paragraph styling. " +
    "The transition feels natural and the visual hierarchy is preserved."
);

doc.save("output/phase2-test.pdf");