const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");

const FormalDocument = require("../src/core/FormalDocument");
const {
    createTempPdfPath,
    countPdfPages
} = require("./helpers/pdf");

const {
    createPlaceholderPng
} = require("../src/utils/createPlaceholderPng");

test("simple document generates a non-empty PDF", async () => {
    const doc = new FormalDocument({
        title: "Simple Test",
        header: false,
        footer: false
    });

    doc.paragraph("This is a simple paragraph.");

    const outputPath = createTempPdfPath("simple.pdf");

    await doc.save(outputPath, {
        silent: true
    });

    assert.ok(fs.existsSync(outputPath));
    assert.ok(fs.statSync(outputPath).size > 0);
});

test("document metadata is applied", () => {
    const doc = new FormalDocument({
        title: "Metadata Test",
        author: "Test Author",
        header: false,
        footer: false
    });

    assert.equal(doc.doc.info.Title, "Metadata Test");
    assert.equal(doc.doc.info.Author, "Test Author");
});

test("major components render without error", async () => {
    const doc = new FormalDocument({
        title: "Component Test",
        author: "Test Author",
        organization: "Test Organization",
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

    doc.heading(1, "Component Test");

    doc.paragraph("This paragraph tests basic text flow.");

    doc.heading(2, "Lists");

    doc.bullets([
        "First bullet",
        {
            text: "Second bullet",
            children: [
                "Nested bullet"
            ]
        }
    ]);

    doc.numbered([
        "First step",
        "Second step"
    ]);

    doc.heading(2, "Table");

    doc.table({
        headers: ["Column A", "Column B"],
        rows: [
            ["Value 1", "Value 2"],
            ["Value 3", "Value 4"]
        ]
    });

    doc.heading(2, "Quote");

    doc.quote("This is a formal blockquote.");

    doc.heading(2, "Figure");

    const imageBuffer = createPlaceholderPng(320, 200);

    doc.figure(imageBuffer, {
        caption: "Placeholder figure.",
        width: 260,
        border: true
    });

    doc.references([
        "Test Author. Component Testing for PDF Engines. Test Press, 2026."
    ]);

    const outputPath = createTempPdfPath("components.pdf");

    await doc.save(outputPath, {
        silent: true
    });

    assert.ok(fs.existsSync(outputPath));
    assert.ok(fs.statSync(outputPath).size > 0);
});

test("long document paginates across multiple pages", async () => {
    const doc = new FormalDocument({
        title: "Pagination Test",
        header: false,
        footer: false
    });

    doc.heading(1, "Pagination Test");

    for (let i = 1; i <= 80; i += 1) {
        doc.paragraph(
            `Paragraph ${i}. This paragraph is intentionally repeated to force ` +
            `automatic pagination across multiple pages. The layout engine should ` +
            `move content cleanly to the next page without manual page breaks.`
        );
    }

    const outputPath = createTempPdfPath("pagination.pdf");

    await doc.save(outputPath, {
        silent: true
    });

    const buffer = fs.readFileSync(outputPath);

    assert.ok(buffer.length > 0);

    const pages = countPdfPages(buffer);

    if (pages > 0) {
        assert.ok(
            pages >= 2,
            `Expected at least 2 pages, found ${pages}`
        );
    } else {
        // Fallback if PDF structure parsing is inconclusive.
        assert.ok(
            buffer.length > 20000,
            "Expected a sufficiently large multi-page PDF"
        );
    }
});