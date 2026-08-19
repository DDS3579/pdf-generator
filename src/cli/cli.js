const path = require("path");
const fs = require("fs");
const FormalDocument = require("../core/FormalDocument");

class CliError extends Error {
    constructor(message, options = {}) {
        super(message);

        this.name = "CliError";
        this.fileName = options.fileName || null;
        this.showStack = options.showStack || false;
        this.cause = options.cause || null;
    }
}

function parseArgs(argv) {
    const args = {
        documentPath: null,
        output: null,
        help: false
    };

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];

        if (arg === "--help" || arg === "-h") {
            args.help = true;
        } else if (arg === "--output" || arg === "-o") {
            i += 1;

            if (i >= argv.length) {
                throw new CliError(
                    "Missing value for --output.\n\n" +
                    "Example:\n" +
                    "node pdf.js examples/cli-example.js --output report.pdf"
                );
            }

            args.output = argv[i];
        } else if (arg.startsWith("-")) {
            throw new CliError(
                `Unknown CLI option: ${arg}\n\n` +
                `Run "node pdf.js --help" for usage.`
            );
        } else if (!args.documentPath) {
            args.documentPath = arg;
        } else {
            throw new CliError(
                `Unexpected argument: ${arg}\n\n` +
                `Run "node pdf.js --help" for usage.`
            );
        }
    }

    return args;
}

function printHelp() {
    console.log(
        `
Formal PDF Engine

Usage:
  node pdf.js <document.js> [options]
  npm run generate -- <document.js> [options]

Options:
  -o, --output <path>     Output PDF path
  -h, --help              Show this help message

Examples:
  node pdf.js examples/cli-example.js
  node pdf.js examples/cli-example.js --output report.pdf
  npm run generate -- examples/cli-example.js

Output behavior:
  If the output path is a bare filename, it will be placed in output/.

  Example:
    --output report.pdf

  Produces:
    output/report.pdf

  To write to the current directory, use:
    --output ./report.pdf
        `.trim()
    );
}

function isDocumentInstance(value) {
    return Boolean(
        value &&
        typeof value.save === "function" &&
        value.doc &&
        value.layout &&
        value.styles
    );
}

function isConfigObject(value) {
    return Boolean(
        value &&
        typeof value === "object" &&
        !isDocumentInstance(value) &&
        (
            typeof value.build === "function" ||
            typeof value.render === "function"
        )
    );
}

function getDefaultOutput(documentPath) {
    const baseName = path.basename(documentPath).replace(/\.[^.]+$/, "");

    return path.join("output", `${baseName}.pdf`);
}

function resolveOutput(output, defaultOutput) {
    if (!output) {
        return path.resolve(defaultOutput);
    }

    // Bare filenames go into output/.
    if (output === path.basename(output)) {
        return path.resolve(path.join("output", output));
    }

    return path.resolve(output);
}

function executeConfig(config, cliOutput, defaultOutput, fileName) {
    const build = config.build || config.render;

    if (typeof build !== "function") {
        throw new CliError(
            "Document config must export a build(doc) or render(doc) function.",
            {
                fileName
            }
        );
    }

    const documentOptions = config.document || config.meta || {};

    if (
        documentOptions &&
        typeof documentOptions !== "object"
    ) {
        throw new CliError(
            "Document config 'document' or 'meta' must be an object.",
            {
                fileName
            }
        );
    }

    const output = resolveOutput(
        cliOutput || config.output,
        defaultOutput
    );

    let doc;

    try {
        doc = new FormalDocument(documentOptions);
    } catch (error) {
        throw new CliError(
            `Failed to initialize document.\n${error.message}`,
            {
                fileName,
                showStack: true,
                cause: error
            }
        );
    }

    console.log("✓ Document initialized");

    try {
        build(doc);
    } catch (error) {
        throw new CliError(
            `Failed while rendering document content.\n${error.message}`,
            {
                fileName,
                showStack: true,
                cause: error
            }
        );
    }

    console.log("✓ Content rendered");
    console.log("✓ Pagination completed");

    // If build() already called doc.save(), do not save again.
    if (FormalDocument.lastOutputPath) {
        return {
            outputPath: FormalDocument.lastOutputPath
        };
    }

    try {
        doc.save(output, {
            silent: true
        });
    } catch (error) {
        throw new CliError(
            `Failed to save PDF.\n${error.message}`,
            {
                fileName,
                showStack: true,
                cause: error
            }
        );
    }

    return {
        outputPath: path.resolve(output)
    };
}

function finalizeDocumentInstance(
    doc,
    cliOutput,
    configOutput,
    defaultOutput,
    fileName
) {
    // If the script already saved itself, respect that output.
    if (FormalDocument.lastOutputPath) {
        return {
            outputPath: FormalDocument.lastOutputPath
        };
    }

    console.log("✓ Document initialized");
    console.log("✓ Content rendered");
    console.log("✓ Pagination completed");

    const output = resolveOutput(
        cliOutput || configOutput,
        defaultOutput
    );

    try {
        doc.save(output, {
            silent: true
        });
    } catch (error) {
        throw new CliError(
            `Failed to save PDF.\n${error.message}`,
            {
                fileName,
                showStack: true,
                cause: error
            }
        );
    }

    return {
        outputPath: path.resolve(output)
    };
}

function executeModule(moduleExports, documentPath, cliOutput) {
    const defaultOutput = getDefaultOutput(documentPath);
    const fileName = documentPath;

    // Support simple transpiled ESM-style default exports.
    if (
        moduleExports &&
        typeof moduleExports === "object" &&
        "default" in moduleExports
    ) {
        moduleExports = moduleExports.default;
    }

    if (isConfigObject(moduleExports)) {
        return executeConfig(
            moduleExports,
            cliOutput,
            defaultOutput,
            fileName
        );
    }

    if (typeof moduleExports === "function") {
        let result;

        try {
            result = moduleExports(FormalDocument, {
                output: cliOutput
            });
        } catch (error) {
            throw new CliError(
                `Failed while executing document function.\n${error.message}`,
                {
                    fileName,
                    showStack: true,
                    cause: error
                }
            );
        }

        if (isConfigObject(result)) {
            return executeConfig(
                result,
                cliOutput,
                defaultOutput,
                fileName
            );
        }

        if (isDocumentInstance(result)) {
            const configOutput =
                result.options && result.options.output;

            return finalizeDocumentInstance(
                result,
                cliOutput,
                configOutput,
                defaultOutput,
                fileName
            );
        }

        if (FormalDocument.lastOutputPath) {
            return {
                outputPath: FormalDocument.lastOutputPath
            };
        }

        throw new CliError(
            "Function document module must return a FormalDocument instance " +
            "or a config object containing build(doc).",
            {
                fileName
            }
        );
    }

    if (isDocumentInstance(moduleExports)) {
        const configOutput =
            moduleExports.options && moduleExports.options.output;

        return finalizeDocumentInstance(
            moduleExports,
            cliOutput,
            configOutput,
            defaultOutput,
            fileName
        );
    }

    // Legacy self-executing script:
    // The file may have already called doc.save().
    if (FormalDocument.lastOutputPath) {
        return {
            outputPath: FormalDocument.lastOutputPath
        };
    }

    throw new CliError(
        "Could not detect a valid document module format.\n\n" +
        "Supported formats:\n\n" +
        "1. module.exports = { document: {...}, build(doc) {...} }\n" +
        "2. module.exports = function(FormalDocument) { return doc; }\n" +
        "3. module.exports = doc;\n" +
        "4. A self-executing script that calls doc.save()",
        {
            fileName
        }
    );
}

function printError(error) {
    console.error("\n✗ Error:");
    console.error(error.message || String(error));

    if (error.fileName) {
        console.error(`File: ${error.fileName}`);
    }

    if (error.cause && error.cause.stack) {
        console.error(`\n${error.cause.stack}`);
    } else if (error.showStack && error.stack) {
        console.error(`\n${error.stack}`);
    }
}

function runCli() {
    try {
        const args = parseArgs(process.argv.slice(2));

        if (args.help) {
            printHelp();
            return;
        }

        if (!args.documentPath) {
            printHelp();
            process.exitCode = 1;
            return;
        }

        const resolvedDocumentPath = path.resolve(args.documentPath);

        if (!fs.existsSync(resolvedDocumentPath)) {
            throw new CliError(
                `Document file not found:\n${resolvedDocumentPath}`
            );
        }

        console.log("✓ Document module loaded");

        FormalDocument.lastOutputPath = null;

        let moduleExports;

        try {
            moduleExports = require(resolvedDocumentPath);
        } catch (error) {
            throw new CliError(
                `Failed to load document file.\n${error.message}`,
                {
                    fileName: resolvedDocumentPath,
                    showStack: true,
                    cause: error
                }
            );
        }

        const result = executeModule(
            moduleExports,
            resolvedDocumentPath,
            args.output
        );

        if (result && result.outputPath) {
            console.log("✓ PDF generated");

            const displayPath = path.relative(
                process.cwd(),
                result.outputPath
            );

            console.log(`\nOutput:\n${displayPath}`);
        } else {
            console.log("✓ Document script executed");
        }
    } catch (error) {
        printError(error);
        process.exitCode = 1;
    }
}

module.exports = {
    runCli
};