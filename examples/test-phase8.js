const fs = require("fs");
const FormalDocument = require("../src/core/FormalDocument");

const candidates = [
    "assets/sample.png",
    "assets/sample.jpg",
    "assets/sample.jpeg"
];

const imagePath = candidates.find((candidate) => {
    return fs.existsSync(candidate);
});

if (!imagePath) {
    console.error(
        "No test image found.\n\n" +
        "Please place an image file in the assets directory:\n\n" +
        "assets/sample.png\n" +
        "assets/sample.jpg\n" +
        "assets/sample.jpeg\n"
    );

    process.exit(1);
}

const doc = new FormalDocument({
    title: "Phase 8 Images and Figures Test",
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

doc.heading(1, "Phase 8: Images and Figures");

doc.paragraph(
    "This document tests image embedding, figure alignment, borders, captions, " +
    "automatic figure numbering, and page-break behavior. Images should remain " +
    "on a single page and should not overlap body text."
);

doc.heading(2, "1. Centered Figure with Caption");

doc.figure(imagePath, {
    caption:
        "A sample formal figure used to test centered image placement, " +
        "caption rendering, and automatic figure numbering.",
    width: "70%"
});

doc.paragraph(
    "The figure above should be centered. The caption should appear below it " +
    "and should be automatically labeled as Figure 1."
);

doc.heading(2, "2. Left-Aligned Figure with Border");

doc.figure(imagePath, {
    caption: "A left-aligned figure with a thin formal border.",
    width: 220,
    align: "left",
    border: true
});

doc.paragraph(
    "The figure above is left-aligned and includes a border. The caption should " +
    "appear below the image and should be automatically labeled as Figure 2."
);

doc.heading(2, "3. Right-Aligned Figure");

doc.figure(imagePath, {
    caption: "A right-aligned figure used to test alignment control.",
    width: 180,
    align: "right",
    border: true
});

doc.paragraph(
    "The figure above is right-aligned. The caption should appear below it and " +
    "should be automatically labeled as Figure 3."
);

doc.pageBreak();

doc.heading(2, "4. Pagination Test");

doc.paragraph(
    "The following paragraph is intended to push the next figure closer to the " +
    "bottom of the page. If there is not enough space for the figure and its " +
    "caption, the engine should move the entire figure to the next page. ".repeat(12)
);

doc.figure(imagePath, {
    caption:
        "This figure tests page-break behavior. It should not be split across " +
        "pages, and its caption should remain attached to it.",
    width: "65%"
});

doc.paragraph(
    "This paragraph appears after the pagination test figure. It should follow " +
    "the figure with normal spacing."
);

doc.save("output/phase8-test.pdf");