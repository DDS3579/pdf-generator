const test = require("node:test");
const assert = require("node:assert/strict");

const StyleRegistry = require("../src/core/StyleRegistry");

test("style registry contains core document styles", () => {
    const styles = new StyleRegistry();

    const requiredStyles = [
        "paragraph",
        "h1",
        "h2",
        "h3",
        "quote",
        "list",
        "table",
        "header",
        "footer",
        "coverOrganization",
        "coverTitle",
        "coverSubtitle",
        "coverMetaLabel",
        "coverMetaValue",
        "coverDate",
        "coverRule",
        "reference",
        "figure",
        "caption"
    ];

    for (const styleName of requiredStyles) {
        assert.ok(
            styles.get(styleName),
            `Missing style: ${styleName}`
        );
    }
});