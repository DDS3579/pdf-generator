const FormalDocument = require("./src/core/FormalDocument");

const doc = new FormalDocument({
  title: "Theme Test",
  theme: "modern" // Try "formal", "corporate", "academic", or "minimal"
});

doc.heading(1, "Modern Theme Heading");
doc.paragraph("This paragraph uses the modern text color. Notice how the heading is darker and the text is a soft gray.");
doc.quote("This blockquote uses the muted color defined in the theme preset.");

doc.save("output/theme-test.pdf");