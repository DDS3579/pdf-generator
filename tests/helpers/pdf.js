const fs = require("fs");
const os = require("os");
const path = require("path");

function createTempPdfPath(name) {
    const dir = fs.mkdtempSync(
        path.join(os.tmpdir(), "formal-pdf-engine-")
    );

    return path.join(dir, name);
}

function countPdfPages(buffer) {
    const text = buffer.toString("latin1");

    const matches = text.match(/\/Type\s*\/Page(?!s)/g);

    return matches
        ? matches.length
        : 0;
}

module.exports = {
    createTempPdfPath,
    countPdfPages
};