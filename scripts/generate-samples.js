const path = require("path");
const FormalDocument = require("../src/core/FormalDocument");

const sampleFiles = [
    "formal-letter.js",
    "research-report.js",
    "table-heavy-report.js",
    "image-report.js",
    "pagination-stress.js",
    "references-report.js"
];

async function run() {
    for (const sampleFile of sampleFiles) {
        const samplePath = path.join(__dirname, "..", "samples", sampleFile);

        const config = require(samplePath);

        if (!config || typeof config.build !== "function") {
            throw new Error(
                `Sample ${sampleFile} must export a build(doc) function.`
            );
        }

        const outputName =
            config.output ||
            sampleFile.replace(/\.js$/, ".pdf");

        const outputPath = path.join(
            "output",
            "samples",
            path.basename(outputName)
        );

        console.log(`Generating ${sampleFile}...`);

        const doc = new FormalDocument(config.document || {});

        await config.build(doc);

        await doc.save(outputPath, {
            silent: true
        });

        console.log(`✓ ${outputPath}`);
    }

    console.log("\n✓ All samples generated.");
}

run().catch((error) => {
    console.error("\n✗ Sample generation failed:");
    console.error(error);
    process.exitCode = 1;
});