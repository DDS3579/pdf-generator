const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const PageManager = require("./PageManager");
const StyleRegistry = require("./StyleRegistry");
const ListRenderer = require("./ListRenderer");
const TableRenderer = require("./TableRenderer");
const PageFurnitureRenderer = require("./PageFurnitureRenderer");

const DEFAULT_FONT_FILES = {
    serifRegular: "Merriweather-VariableFont_opsz,wdth,wght.ttf",
    serifItalic: "Merriweather-Italic-VariableFont_opsz,wdth,wght.ttf",
    sansRegular: "Inter-VariableFont_opsz,wght.ttf",
    sansItalic: "Inter-Italic-VariableFont_opsz,wght.ttf",
    displayRegular: "SpaceGrotesk-VariableFont_wght.ttf"
};

const DEFAULT_HEADER = {
    enabled: "auto",
    left: "{organization}",
    center: "",
    right: "",
    rule: true,
    firstPage: null,
    coverPage: null
};

const DEFAULT_FOOTER = {
    enabled: true,
    left: "{title}",
    center: "{confidentiality}",
    right: "{page}",
    rule: false,
    firstPage: null,
    coverPage: null
};

const DEFAULT_PAGE_NUMBERING = {
    start: 1,
    coverPages: 0
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
            fontFiles: DEFAULT_FONT_FILES,
            title: "Untitled Document",
            author: "",
            organization: "",
            date: "",
            confidentiality: "",
            confidential: false,
            header: DEFAULT_HEADER,
            footer: DEFAULT_FOOTER,
            pageNumbering: DEFAULT_PAGE_NUMBERING
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

        this.options.confidentiality =
            this._normalizeConfidentiality(options);

        this.options.header = this._normalizeFurnitureConfig(
            options.header,
            DEFAULT_HEADER
        );

        this.options.footer = this._normalizeFurnitureConfig(
            options.footer,
            DEFAULT_FOOTER
        );

        this.options.pageNumbering = {
            ...DEFAULT_PAGE_NUMBERING,
            ...(options.pageNumbering || {})
        };

        if (this.options.header.enabled === "auto") {
            this.options.header.enabled = Boolean(
                this.options.organization
            );
        }

        this.doc = new PDFDocument({
            size: "A4",
            margins: this.options.margins,
            bufferPages: true,
            info: {
                Title: this.options.title,
                Author: this.options.author,
                Creator: "Formal PDF Engine"
            }
        });

        this.layout = new PageManager(this.doc, this.options.margins);
        this.styles = new StyleRegistry();
        this.lists = new ListRenderer(this);
        this.tables = new TableRenderer(this);
        this.pageFurniture = new PageFurnitureRenderer(this);

        this._registerFonts();
        this._applyDefaultFont();
    }

    _normalizeConfidentiality(options) {
        if (
            typeof options.confidentiality === "string" &&
            options.confidentiality.trim().length > 0
        ) {
            return options.confidentiality.trim();
        }

        if (options.confidential === true) {
            return "CONFIDENTIAL";
        }

        if (
            typeof options.confidential === "string" &&
            options.confidential.trim().length > 0
        ) {
            return options.confidential.trim();
        }

        return "";
    }

    _normalizeFurnitureConfig(value, defaults) {
        if (value === false) {
            return {
                ...defaults,
                enabled: false,
                firstPage: null,
                coverPage: null
            };
        }

        if (value === true) {
            return {
                ...defaults,
                enabled: true,
                firstPage: null,
                coverPage: null
            };
        }

        if (value && typeof value === "object") {
            const config = {
                ...defaults,
                ...value
            };

            config.firstPage =
                value.firstPage && typeof value.firstPage === "object"
                    ? { ...value.firstPage }
                    : null;

            config.coverPage =
                value.coverPage && typeof value.coverPage === "object"
                    ? { ...value.coverPage }
                    : null;

            return config;
        }

        return {
            ...defaults,
            firstPage: null,
            coverPage: null
        };
    }

    _applyDefaultFont() {
        const paragraphStyle = this.styles.get("paragraph");
        this.doc.font(paragraphStyle.fontFamily).fontSize(paragraphStyle.fontSize);
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
        this._registerFont(
            "Serif-Regular",
            this.options.fontFiles.serifRegular,
            true
        );

        this._registerFont(
            "Serif-Italic",
            this.options.fontFiles.serifItalic,
            false
        );

        this._registerFont(
            "Sans-Regular",
            this.options.fontFiles.sansRegular,
            false
        );

        this._registerFont(
            "Sans-Italic",
            this.options.fontFiles.sansItalic,
            false
        );

        this._registerFont(
            "Display-Regular",
            this.options.fontFiles.displayRegular,
            false
        );
    }

    paragraph(content) {
        const style = this.styles.get("paragraph");
        this._renderTextBlock(content, style);
        return this;
    }

    heading(level, content) {
        const styleName = `h${level}`;
        const style = this.styles.get(styleName);

        this.doc.font(style.fontFamily).fontSize(style.fontSize);

        const headingHeight = this.doc.heightOfString(content, {
            width: this.layout.contentWidth
        });

        const paragraphStyle = this.styles.get("paragraph");
        const minParagraphHeight =
            paragraphStyle.fontSize + paragraphStyle.lineGap;

        const requiredSpace = headingHeight + minParagraphHeight;

        if (this.layout.currentY + requiredSpace > this.layout.maxY) {
            this.layout.addPage();
        }

        if (
            style.spacingBefore > 0 &&
            this.layout.currentY > this.layout.margins.top
        ) {
            this.layout.moveDown(style.spacingBefore);
        }

        this.doc.font(style.fontFamily).fontSize(style.fontSize);

        this.doc.text(content, this.layout.contentX, this.layout.currentY, {
            width: this.layout.contentWidth,
            align: style.align
        });

        this.layout.currentY = this.doc.y + style.spacingAfter;

        this._applyDefaultFont();

        return this;
    }

    quote(content) {
        const style = this.styles.get("quote");

        const indentWidth =
            this.layout.contentWidth -
            style.leftIndent -
            style.rightIndent;

        const indentX = this.layout.contentX + style.leftIndent;

        this.doc.font(style.fontFamily).fontSize(style.fontSize);

        const requiredHeight = this.doc.heightOfString(content, {
            width: indentWidth,
            lineGap: style.lineGap
        });

        this.layout.checkSpace(
            requiredHeight + style.spacingBefore + style.spacingAfter
        );

        if (
            style.spacingBefore > 0 &&
            this.layout.currentY > this.layout.margins.top
        ) {
            this.layout.moveDown(style.spacingBefore);
        }

        this.doc.font(style.fontFamily).fontSize(style.fontSize);

        this.doc.text(content, indentX, this.layout.currentY, {
            width: indentWidth,
            align: style.align,
            lineGap: style.lineGap
        });

        this.layout.currentY = this.doc.y + style.spacingAfter;

        this._applyDefaultFont();

        return this;
    }

    bullets(items, options = {}) {
        return this.lists.bullets(items, options);
    }

    numbered(items, options = {}) {
        return this.lists.numbered(items, options);
    }

    table(config) {
        return this.tables.render(config);
    }

    pageBreak() {
        if (this.layout.currentY > this.layout.margins.top) {
            this.layout.addPage();
        }

        return this;
    }

    _renderTextBlock(content, style) {
        this.doc.font(style.fontFamily).fontSize(style.fontSize);

        const textOptions = {
            width: this.layout.contentWidth,
            align: style.align,
            lineGap: style.lineGap
        };

        const requiredHeight = this.doc.heightOfString(
            content,
            textOptions
        );

        this.layout.checkSpace(requiredHeight);

        this.doc.font(style.fontFamily).fontSize(style.fontSize);

        this.doc.text(
            content,
            this.layout.contentX,
            this.layout.currentY,
            textOptions
        );

        this.layout.currentY = this.doc.y + style.spacingAfter;
    }

    save(filePath) {
        const outputPath = path.resolve(filePath);
        const outputDir = path.dirname(outputPath);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        this.doc.pipe(fs.createWriteStream(outputPath));

        this.pageFurniture.render();

        this.doc.end();

        console.log(`✓ PDF generated successfully: ${outputPath}`);
    }
}

module.exports = FormalDocument;