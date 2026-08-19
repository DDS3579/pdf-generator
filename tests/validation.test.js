const test = require("node:test");
const assert = require("node:assert/strict");

const FormalDocument = require("../src/core/FormalDocument");

function createTestDocument() {
    return new FormalDocument({
        title: "Validation Test",
        header: false,
        footer: false
    });
}

test("table validation throws when row column count is wrong", () => {
    const doc = createTestDocument();

    assert.throws(
        () => {
            doc.table({
                headers: ["A", "B"],
                rows: [
                    ["Only one column"]
                ]
            });
        },
        /column count does not match/i
    );
});

test("list validation throws on invalid list item", () => {
    const doc = createTestDocument();

    assert.throws(
        () => {
            doc.bullets([
                null
            ]);
        },
        /Invalid list item/i
    );
});

test("reference validation throws on empty reference", () => {
    const doc = createTestDocument();

    assert.throws(
        () => {
            doc.references([
                ""
            ]);
        },
        /cannot be empty/i
    );
});

test("figure validation throws on invalid source type", () => {
    const doc = createTestDocument();

    assert.throws(
        () => {
            doc.figure(123);
        },
        /Figure source must be a file path string or a Buffer/i
    );
});

test("figure validation throws when image file is missing", () => {
    const doc = createTestDocument();

    assert.throws(
        () => {
            doc.figure("this-file-does-not-exist.png");
        },
        /Image file not found/i
    );
});