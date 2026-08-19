/**
 * PageManager handles the layout abstraction.
 * It tracks the current Y position, calculates available space, 
 * and triggers page breaks when content exceeds the page limits.
 */
class PageManager {
    constructor(doc, margins = { top: 72, bottom: 72, left: 72, right: 72 }) {
        this.doc = doc;
        this.margins = margins;
        
        // A4 dimensions in PDF points (1 point = 1/72 inch)
        this.pageWidth = 595.28;
        this.pageHeight = 841.89;
        
        this.contentWidth = this.pageWidth - margins.left - margins.right;
        this.maxY = this.pageHeight - margins.bottom;
        
        // The current Y cursor starts at the top margin
        this.currentY = margins.top;
        this.pageNumber = 1;
    }

    get contentX() {
        return this.margins.left;
    }

    get availableHeight() {
        return this.maxY - this.currentY;
    }

    /**
     * Checks if the required height fits on the current page.
     * If not, it triggers a page break.
     */
    checkSpace(requiredHeight) {
        if (this.currentY + requiredHeight > this.maxY) {
            this.addPage();
            return true; // Indicates a page break occurred
        }
        return false;
    }

    addPage() {
        this.doc.addPage();
        this.currentY = this.margins.top;
        this.pageNumber++;
    }

    /**
     * Moves the Y cursor down by a specific amount.
     */
    moveDown(points) {
        this.currentY += points;
    }
}

module.exports = PageManager;