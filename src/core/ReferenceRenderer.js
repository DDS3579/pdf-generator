/**
 * ReferenceRenderer renders formal reference lists.
 *
 * Supported item formats:
 * - "Plain citation string"
 * - { text: "Plain citation string" }
 * - { raw: "Plain citation string" }
 * - { citation: "Plain citation string" }
 * - { author, title, publisher, year, url, accessed }
 */
class ReferenceRenderer {
    constructor(formalDocument) {
        this.document = formalDocument;
    }

    render(items, options = {}) {
        if (!Array.isArray(items)) {
            throw new Error(
                "doc.references(items) requires an array of references."
            );
        }

        if (items.length === 0) {
            return this.document;
        }

        const style = this.document.styles.get("reference");
        const layout = this.document.layout;
        const pdf = this.document.doc;

        let heading =
            options.heading === undefined
                ? "References"
                : options.heading;

        if (heading === true) {
            heading = "References";
        }

        const headingLevel = Number.isInteger(options.headingLevel)
            ? options.headingLevel
            : 1;

        if (heading && ![1, 2, 3].includes(headingLevel)) {
            throw new Error(
                "Reference headingLevel must be 1, 2, or 3."
            );
        }

        const numbered = options.numbered !== false;

        const startRaw = Number(options.start);
        const start =
            Number.isInteger(startRaw) && startRaw > 0
                ? startRaw
                : 1;

        const texts = items.map((item, index) => {
            return this._normalizeItem(item, index);
        });

        pdf.font(style.fontFamily).fontSize(style.fontSize);

        const lastNumber = start + texts.length - 1;

        const markerWidth = numbered
            ? pdf.widthOfString(`[${lastNumber}]`)
            : 0;

        const firstReferenceHeight = this._measureReference(
            texts[0],
            style,
            markerWidth,
            numbered
        );

        if (heading) {
            const headingStyle = this.document.styles.get(`h${headingLevel}`);

            pdf.font(headingStyle.fontFamily).fontSize(headingStyle.fontSize);

            const headingHeight = pdf.heightOfString(String(heading), {
                width: layout.contentWidth
            });

            const headingSpacingBefore =
                layout.currentY > layout.margins.top
                    ? headingStyle.spacingBefore || 0
                    : 0;

            const requiredSpace =
                headingSpacingBefore +
                headingHeight +
                (headingStyle.spacingAfter || 0) +
                firstReferenceHeight;

            if (layout.currentY + requiredSpace > layout.maxY) {
                layout.addPage();
            }

            this.document.heading(headingLevel, String(heading));
        } else if (
            style.spacingBefore > 0 &&
            layout.currentY > layout.margins.top
        ) {
            layout.moveDown(style.spacingBefore);
        }

        texts.forEach((text, index) => {
            const referenceNumber = start + index;

            this._renderReference(
                text,
                referenceNumber,
                style,
                markerWidth,
                numbered
            );

            const isLast = index === texts.length - 1;

            if (!isLast) {
                layout.moveDown(style.spacingAfterItem);
            }
        });

        layout.moveDown(style.spacingAfter);

        this.document._applyDefaultFont();

        return this.document;
    }

    _normalizeItem(item, index) {
        const location = `Reference ${index + 1}`;

        let text = "";

        if (typeof item === "string") {
            text = item;
        } else if (item && typeof item === "object") {
            if (item.text !== undefined && item.text !== null) {
                text = String(item.text);
            } else if (item.raw !== undefined && item.raw !== null) {
                text = String(item.raw);
            } else if (item.citation !== undefined && item.citation !== null) {
                text = String(item.citation);
            } else {
                text = this._formatStructuredReference(item);
            }
        } else {
            throw new Error(
                `${location} must be a string or a structured reference object.`
            );
        }

        text = text.replace(/\s+/g, " ").trim();

        if (text.length === 0) {
            throw new Error(
                `${location} cannot be empty.`
            );
        }

        return text;
    }

    _formatStructuredReference(item) {
        const parts = [];

        let author = item.author || item.authors;

        if (Array.isArray(author)) {
            author = author.join(", ");
        }

        if (author) {
            parts.push(this._terminate(author));
        }

        if (item.title) {
            parts.push(this._terminate(item.title));
        }

        if (item.publisher && item.year) {
            parts.push(this._terminate(`${item.publisher}, ${item.year}`));
        } else if (item.publisher) {
            parts.push(this._terminate(item.publisher));
        } else if (item.year) {
            parts.push(this._terminate(String(item.year)));
        }

        if (item.url) {
            parts.push(this._terminate(item.url));
        }

        if (item.accessed) {
            parts.push(this._terminate(`Accessed ${item.accessed}`));
        }

        return parts.join(" ");
    }

    _terminate(value) {
        const text = String(value).trim();

        if (!text) {
            return "";
        }

        if (/[.!?]$/.test(text)) {
            return text;
        }

        return `${text}.`;
    }

    _measureReference(text, style, markerWidth, numbered) {
        const layout = this.document.layout;
        const pdf = this.document.doc;

        pdf.font(style.fontFamily).fontSize(style.fontSize);

        const markerSpace = numbered
            ? markerWidth + style.markerGap
            : 0;

        const textWidth = layout.contentWidth - markerSpace;

        if (textWidth <= 0) {
            throw new Error(
                "Reference marker indentation leaves no available width for text."
            );
        }

        return pdf.heightOfString(text, {
            width: textWidth,
            lineGap: style.lineGap
        });
    }

    _renderReference(text, referenceNumber, style, markerWidth, numbered) {
        const layout = this.document.layout;
        const pdf = this.document.doc;

        const marker = `[${referenceNumber}]`;

        const markerSpace = numbered
            ? markerWidth + style.markerGap
            : 0;

        const textX = layout.contentX + markerSpace;

        const textWidth = layout.contentWidth - markerSpace;

        if (textWidth <= 0) {
            throw new Error(
                "Reference marker indentation leaves no available width for text."
            );
        }

        pdf.font(style.fontFamily).fontSize(style.fontSize);

        const requiredHeight = pdf.heightOfString(text, {
            width: textWidth,
            lineGap: style.lineGap
        });

        layout.checkSpace(requiredHeight);

        const y = layout.currentY;

        if (numbered) {
            const markerTextWidth = pdf.widthOfString(marker);

            const markerDrawX =
                layout.contentX + markerWidth - markerTextWidth;

            pdf.text(marker, markerDrawX, y, {
                lineBreak: false
            });
        }

        pdf.text(text, textX, y, {
            width: textWidth,
            align: style.align,
            lineGap: style.lineGap
        });

        layout.currentY = pdf.y;
    }
}

module.exports = ReferenceRenderer;