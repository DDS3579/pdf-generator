const {
    createPlaceholderPng
} = require("../src/utils/createPlaceholderPng");

module.exports = {
    output: "sample-04-image-report.pdf",

    document: {
        title: "Image and Figure Sample",
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
        doc.heading(1, "Image and Figure Sample");

        doc.paragraph(
            "This sample verifies image embedding, borders, captions, alignment, and automatic figure numbering."
        );

        const wideImage = createPlaceholderPng(640, 360);
        const squareImage = createPlaceholderPng(320, 320);
        const smallImage = createPlaceholderPng(240, 160);

        doc.heading(2, "1. Centered Figure");

        doc.figure(wideImage, {
            caption: "A wide placeholder figure used to test centered layout.",
            width: "75%",
            border: true
        });

        doc.heading(2, "2. Left-Aligned Figure");

        doc.figure(squareImage, {
            caption: "A left-aligned square figure.",
            width: 220,
            align: "left",
            border: true
        });

        doc.paragraph(
            "This paragraph follows a left-aligned figure and confirms that normal layout flow resumes correctly."
        );

        doc.heading(2, "3. Right-Aligned Figure");

        doc.figure(smallImage, {
            caption: "A right-aligned figure.",
            width: 200,
            align: "right",
            border: true
        });

        doc.paragraph(
            "This paragraph follows a right-aligned figure and confirms that normal layout flow resumes correctly."
        );
    }
};