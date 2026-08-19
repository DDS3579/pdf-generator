const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const PageManager = require("./PageManager");
const StyleRegistry = require("./StyleRegistry");

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
            margins: { top: 72, bottom: 72, left: 72, right: 72 },
            fontsDir: path.join(__dirname, "..", "fonts"),
            fontFiles: DEFAULT_FONT_FILES
        };

        this.options = {
            ...defaults,
            ...options,
            margins: { ...defaults.margins, ...(options.margins || {}) },
            fontFiles: { ...defaults.fontFiles, ...(options.fontFiles || {}) }
        };

        this.doc = new PDFDocument({
            size: "A4",
            margins: this.options.margins,
            bufferPages: true,
            info: {
                Title: options.title || "Untitled Document",
                Author: options.author || "Unknown",
                Creator: "Formal PDF Engine"
            }
        });

        this.layout = new PageManager(this.doc, this.options.margins);
        this.styles = new StyleRegistry();
        
        this._registerFonts();
        this._applyDefaultFont();
    }

    _applyDefaultFont() {
        const pStyle = this.styles.get('paragraph');
        this.doc.font(pStyle.fontFamily).fontSize(pStyle.fontSize);
    }

    _fontPath(fileName) {
        return path.resolve(this.options.fontsDir, fileName);
    }

    _registerFont(alias, fileName, required = false) {
        const filePath = this._fontPath(fileName);
        if (!fs.existsSync(filePath)) {
            if (required) throw new Error(`Required font not found: ${filePath}`);
            return false;
        }
        try {
            this.doc.registerFont(alias, filePath);
            return true;
        } catch (error) {
            if (required) throw new Error(`Failed to register font: ${error.message}`);
            return false;
        }
    }

    _registerFonts() {
        this._registerFont("Serif-Regular", this.options.fontFiles.serifRegular, true);
        this._registerFont("Serif-Italic", this.options.fontFiles.serifItalic, false);
        this._registerFont("Sans-Regular", this.options.fontFiles.sansRegular, false);
        this._registerFont("Sans-Italic", this.options.fontFiles.sansItalic, false);
        this._registerFont("Display-Regular", this.options.fontFiles.displayRegular, false);
    }

    /**
     * Renders a standard paragraph.
     */
    paragraph(content) {
        const style = this.styles.get('paragraph');
        this._renderTextBlock(content, style);
    }

    /**
     * Renders a heading (H1, H2, H3).
     * Includes "Keep-with-next" logic to prevent stranding.
     */
    heading(level, content) {
        const styleName = `h${level}`;
        const style = this.styles.get(styleName);

        // 1. Measure the heading height
        const headingHeight = this.doc.heightOfString(content, {
            font: style.fontFamily,
            fontSize: style.fontSize,
            width: this.layout.contentWidth
        });

        // 2. Calculate minimum space needed (Heading + at least one line of paragraph)
        const pStyle = this.styles.get('paragraph');
        const minParagraphHeight = pStyle.fontSize + pStyle.lineGap;
        const requiredSpace = headingHeight + minParagraphHeight;

        // 3. Trigger page break if we don't have enough space for BOTH
        if (this.layout.currentY + requiredSpace > this.layout.maxY) {
            this.layout.addPage();
        }

        // 4. Apply spacing before (ONLY if we are not at the very top of a new page)
        if (style.spacingBefore > 0 && this.layout.currentY > this.layout.margins.top) {
            this.layout.moveDown(style.spacingBefore);
        }

        // 5. Render heading
        this.doc.font(style.fontFamily).fontSize(style.fontSize);
        this.doc.text(content, this.layout.contentX, this.layout.currentY, {
            width: this.layout.contentWidth,
            align: style.align
        });

        // 6. Update cursor and apply spacing after
        this.layout.currentY = this.doc.y + style.spacingAfter;

        // Reset to default paragraph font
        this._applyDefaultFont();
    }

    /**
     * Renders a blockquote.
     */
    quote(content) {
        const style = this.styles.get('quote');
        
        // Adjust width and X position for indentation
        const indentWidth = this.layout.contentWidth - style.leftIndent - style.rightIndent;
        const indentX = this.layout.contentX + style.leftIndent;

        const requiredHeight = this.doc.heightOfString(content, {
            font: style.fontFamily,
            fontSize: style.fontSize,
            lineGap: style.lineGap,
            width: indentWidth
        });

        this.layout.checkSpace(requiredHeight + style.spacingBefore + style.spacingAfter);

        if (style.spacingBefore > 0 && this.layout.currentY > this.layout.margins.top) {
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
    }

    /**
     * Internal helper to render text blocks with pagination.
     */
    _renderTextBlock(content, style) {
        const textOptions = {
            width: this.layout.contentWidth,
            align: style.align,
            lineGap: style.lineGap
        };

        const requiredHeight = this.doc.heightOfString(content, {
            font: style.fontFamily,
            fontSize: style.fontSize,
            ...textOptions
        });

        this.layout.checkSpace(requiredHeight);

        this.doc.font(style.fontFamily).fontSize(style.fontSize);
        this.doc.text(content, this.layout.contentX, this.layout.currentY, textOptions);

        this.layout.currentY = this.doc.y + style.spacingAfter;
    }

    save(filePath) {
        const outputPath = path.resolve(filePath);
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        this.doc.pipe(fs.createWriteStream(outputPath));
        this.doc.end();
        console.log(`✓ PDF generated successfully: ${outputPath}`);
    }
}

module.exports = FormalDocument;