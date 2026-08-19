/**
 * PageFurnitureRenderer renders headers and footers after the main
 * document content has been laid out.
 *
 * It relies on PDFKit's buffered pages feature.
 */
class PageFurnitureRenderer {
  constructor(formalDocument) {
    this.document = formalDocument;
  }

  render() {
    const pdf = this.document.doc;
    const options = this.document.options;

    if (typeof pdf.bufferedPageRange !== "function") {
      return;
    }

    const range = pdf.bufferedPageRange();

    if (!range || !range.count) {
      return;
    }

    const physicalTotalPages = range.count;

    const startRaw = Number(options.pageNumbering.start);
    const start = Number.isFinite(startRaw) && startRaw > 0 ? startRaw : 1;

    const coverPagesRaw = Number(options.pageNumbering.coverPages);
    const coverPages =
      Number.isFinite(coverPagesRaw) && coverPagesRaw >= 0
        ? Math.floor(coverPagesRaw)
        : 0;

    const numberedTotalPages = Math.max(0, physicalTotalPages - coverPages);

    for (
      let index = range.start;
      index < range.start + range.count;
      index += 1
    ) {
      pdf.switchToPage(index);

      const physicalPageNumber = index - range.start + 1;

      const displayPageNumber = physicalPageNumber - coverPages + start - 1;

      const isCoverPage = physicalPageNumber <= coverPages;

      const context = {
        title: options.title || "",
        author: options.author || "",
        organization: options.organization || "",
        date: options.date || "",
        confidentiality: options.confidentiality || "",
        page: displayPageNumber > 0 ? String(displayPageNumber) : "",
        totalPages: numberedTotalPages > 0 ? String(numberedTotalPages) : "",
      };

      this._renderSection("header", {
        isCoverPage,
        physicalPageNumber,
        context,
      });

      this._renderSection("footer", {
        isCoverPage,
        physicalPageNumber,
        context,
      });
    }
  }

  _renderSection(sectionName, payload) {
    const config = this._getConfig(
      sectionName,
      payload.isCoverPage,
      payload.physicalPageNumber,
    );

    let enabled = config.enabled;

    if (enabled === "auto") {
      enabled = Boolean(this.document.options.organization);
    }

    if (!enabled) {
      return;
    }

    const style = this.document.styles.get(sectionName);
    const layout = this.document.layout;
    const pdf = this.document.doc;

    const maxWidth = layout.contentWidth;

    const y =
      sectionName === "header"
        ? layout.margins.top * 0.45
        : layout.pageHeight - layout.margins.bottom * 0.55;

    pdf.font(style.fontFamily).fontSize(style.fontSize);

    const leftText = this._prepareText(config.left, payload.context, style);

    const centerText = this._prepareText(config.center, payload.context, style);

    const rightText = this._prepareText(config.right, payload.context, style);

    this._drawAlignedText(leftText, "left", y, maxWidth);
    this._drawAlignedText(centerText, "center", y, maxWidth);
    this._drawAlignedText(rightText, "right", y, maxWidth);

    if (config.rule) {
      const ruleY =
        sectionName === "header"
          ? layout.margins.top * 0.72
          : layout.pageHeight - layout.margins.bottom * 0.72;

      this._drawHorizontalRule(ruleY, style.ruleWidth || 0.5);
    }
  }

  _getConfig(sectionName, isCoverPage, physicalPageNumber) {
    const base = this.document.options[sectionName];

    let override = null;

    if (isCoverPage) {
      override =
        base.coverPage !== undefined && base.coverPage !== null
          ? base.coverPage
          : { enabled: false };
    } else if (physicalPageNumber === 1 && base.firstPage) {
      override = base.firstPage;
    }

    return {
      ...base,
      ...(override || {}),
    };
  }

  _prepareText(template, context, style) {
    let text = this._resolveTemplate(template, context);

    text = text.replace(/\s+/g, " ").trim();

    if (!text) {
      return "";
    }

    if (style.uppercase) {
      text = text.toUpperCase();
    }

    return text;
  }

  _resolveTemplate(template, context) {
    if (template === null || template === undefined) {
      return "";
    }

    const raw = String(template);

    if (raw.includes("{page}") && context.page === "") {
      return "";
    }

    if (raw.includes("{totalPages}") && context.totalPages === "") {
      return "";
    }

    return raw.replace(/\{(\w+)\}/g, (match, key) => {
      if (Object.prototype.hasOwnProperty.call(context, key)) {
        const value = context[key];

        if (value === null || value === undefined) {
          return "";
        }

        return String(value);
      }

      return "";
    });
  }

  _fitText(text, maxWidth) {
    const pdf = this.document.doc;

    if (!text) {
      return "";
    }

    if (pdf.widthOfString(text) <= maxWidth) {
      return text;
    }

    const ellipsis = "...";
    let truncated = text;

    while (
      truncated.length > 0 &&
      pdf.widthOfString(truncated + ellipsis) > maxWidth
    ) {
      truncated = truncated.slice(0, -1);
    }

    if (truncated.length === 0) {
      return "";
    }

    return truncated + ellipsis;
  }

  _drawAlignedText(text, align, y, maxWidth) {
    if (!text) {
      return;
    }

    const pdf = this.document.doc;
    const layout = this.document.layout;

    const fittedText = this._fitText(text, maxWidth);

    if (!fittedText) {
      return;
    }

    const textWidth = pdf.widthOfString(fittedText);

    let x = layout.contentX;

    if (align === "center") {
      x = layout.contentX + (maxWidth - textWidth) / 2;
    }

    if (align === "right") {
      x = layout.contentX + maxWidth - textWidth;
    }

    pdf.text(fittedText, x, y, {
      lineBreak: false,
    });
  }

  _drawHorizontalRule(y, lineWidth) {
    const pdf = this.document.doc;
    const layout = this.document.layout;

    pdf.save();

    pdf.lineWidth(lineWidth);

    pdf.moveTo(layout.contentX, y);
    pdf.lineTo(layout.contentX + layout.contentWidth, y);

    pdf.stroke();

    pdf.restore();
  }
}

module.exports = PageFurnitureRenderer;
