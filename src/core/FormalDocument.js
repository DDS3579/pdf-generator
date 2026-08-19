const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const PageManager = require('./PageManager');

class FormalDocument {
    constructor(options = {}) {
        this.options = {
            margins: { top: 72, bottom: 72, left: 72, right: 72 }, // 1 inch margins
            ...options
        };

        // Initialize the underlying PDFKit document
        this.doc = new PDFDocument({
            size: 'A4',
            margins: this.options.margins,
            bufferPages: true, // Required for future headers/footers
            info: {
                Title: options.title || 'Untitled Document',
                Author: options.author || 'Unknown',
                Creator: 'Formal PDF Engine'
            }
        });

        // Initialize our layout engine
        this.layout = new PageManager(this.doc, this.options.margins);

        // Setup fonts
        this._registerFonts();
        
        // Set default font
        this.doc.font('Serif-Regular').fontSize(11);
    }

    _registerFonts() {
        // We expect fonts to be in src/fonts/
        const fontsDir = path.join(__dirname, '..', 'fonts');
        
        // Register the primary formal serif font
        this.doc.registerFont('Serif-Regular', path.join(fontsDir, 'Merriweather-Regular.ttf'));
        
        // Note: We will register Bold/Italic in Phase 2 when we build the Heading system.
    }

    /**
     * Renders a paragraph of text with automatic pagination.
     */
    text(content, options = {}) {
        const textOptions = {
            width: this.layout.contentWidth,
            align: options.align || 'justify', // Justified is standard for formal docs
            lineGap: options.lineGap || 4,
            paragraphGap: options.paragraphGap || 8,
            ...options
        };

        // 1. Measure how much vertical space this text will take
        const requiredHeight = this.doc.heightOfString(content, textOptions);

        // 2. Check if it fits, trigger page break if necessary
        this.layout.checkSpace(requiredHeight);

        // 3. Render the text at the current layout coordinates
        this.doc.text(content, this.layout.contentX, this.layout.currentY, textOptions);

        // 4. Sync our layout manager with PDFKit's internal cursor.
        // (This is crucial: if PDFKit internally breaks a massive paragraph across a page, 
        // doc.y will reset to the top of the new page. We must sync our manager to match).
        this.layout.currentY = this.doc.y;
    }

    /**
     * Finalizes and saves the PDF to disk.
     */
    save(filePath) {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        this.doc.pipe(fs.createWriteStream(filePath));
        this.doc.end();
        
        console.log(`✓ PDF generated successfully: ${filePath}`);
    }
}

module.exports = FormalDocument;