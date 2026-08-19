const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const PageManager = require("./PageManager");

/**
 * These are the exact font file names you provided.
 *
 * Note:
 * These are variable fonts. PDFKit/fontkit will usually load the default
 * instance for now. Later, we may add explicit weight instances or use
 * static exported fonts for guaranteed bold/italic behavior.
 */
const DEFAULT_FONT_FILES = {
    serifRegular: "Merriweather-VariableFont_opsz,wdth,wght.ttf",
    serifItalic: "Merriweather-Italic-VariableFont_opsz,wdth,wght.ttf",
    sansRegular: "Inter-VariableFont_opsz,wght.ttf",
    sansItalic: "Inter-Italic-VariableFont_opsz,wght.ttf",
    displayRegular: "SpaceGrotesk-VariableFont_wght.ttf"
};

class FormalDocument {
    constructor(options = {}) {
        const defaults = {
            margins: {
                top: 72,
                bottom: 72,
                left: 72,
                right: 72
            },
            fontsDir: path.join(__dirname, "..", "fonts"),
            fontFiles: DEFAULT_FONT_FILES
        };

        this.options = {
            ...defaults,
            ...options,
            margins: {
                ...defaults.margins,
                ...(options.margins || {})
            },
            fontFiles: {
                ...defaults.fontFiles,
                ...(options.fontFiles || {})
            }
        };

        this.doc = new PDFDocument({
            size: "A4",
            margins: this.options.margins,
            bufferPages: true, // Needed later for headers/footers/page numbers
            info: {
                Title: options.title || "Untitled Document",
                Author: options.author || "Unknown",
                Creator: "Formal PDF Engine"
            }
        });

        this.layout = new PageManager(this.doc, this.options.margins);

        this.availableFonts = this._registerFonts();

        // Default formal body font
        this.doc.font("Serif-Regular").fontSize(11);
    }

    _fontPath(fileName) {
        return path.resolve(this.options.fontsDir, fileName);
    }

    _registerFont(alias, fileName, required = false) {
        const filePath = this._fontPath(fileName);

        if (!fs.existsSync(filePath)) {
            if (required) {
                throw new Error(
                    `Required font file not found:\n\n` +
                    `${filePath}\n\n` +
                    `Please place "${fileName}" in the fonts directory.`
                );
            }

            return false;
        }

        try {
            this.doc.registerFont(alias, filePath);
            return true;
        } catch (error) {
            if (required) {
                throw new Error(
                    `Failed to register required font "${fileName}".\n` +
                    `PDFKit error: ${error.message}`
                );
            }

            return false;
        }
    }

    _registerFonts() {
        const available = {};

        // Required: main formal body font
        available.serifRegular = this._registerFont(
            "Serif-Regular",
            this.options.fontFiles.serifRegular,
            true
        );

        // Optional for now, but useful later
        available.serifItalic = this._registerFont(
            "Serif-Italic",
            this.options.fontFiles.serifItalic,
            false
        );

        available.sansRegular = this._registerFont(
            "Sans-Regular",
            this.options.fontFiles.sansRegular,
            false
        );

        available.sansItalic = this._registerFont(
            "Sans-Italic",
            this.options.fontFiles.sansItalic,
            false
        );

        available.displayRegular = this._registerFont(
            "Display-Regular",
            this.options.fontFiles.displayRegular,
            false
        );

        return available;
    }

    /**
     * Renders a paragraph of text with automatic pagination.
     */
    text(content, options = {}) {
        const {
            afterGap,
            paragraphGap = 10,
            lineGap = 4,
            ...pdfTextOptions
        } = options;

        const textOptions = {
            width: this.layout.contentWidth,
            align: "justify",
            lineGap,
            paragraphGap,
            ...pdfTextOptions
        };

        // Space to add after the paragraph block.
        const spacingAfter = afterGap ?? paragraphGap;

        // Measure how much vertical space this text needs.
        const requiredHeight = this.doc.heightOfString(content, textOptions);

        // Trigger a page break if needed.
        this.layout.checkSpace(requiredHeight);

        // Render the text.
        this.doc.text(
            content,
            this.layout.contentX,
            this.layout.currentY,
            textOptions
        );

        // Sync our layout cursor with PDFKit's internal cursor.
        // Then add paragraph spacing.
        this.layout.currentY = this.doc.y + spacingAfter;
    }

    /**
     * Finalizes and saves the PDF.
     */
    save(filePath) {
        const outputPath = path.resolve(filePath);
        const outputDir = path.dirname(outputPath);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        this.doc.pipe(fs.createWriteStream(outputPath));
        this.doc.end();

        console.log(`✓ PDF generated successfully: ${outputPath}`);
    }
}

module.exports = FormalDocument;