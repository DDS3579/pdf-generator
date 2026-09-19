const fs = require("fs");
const path = require("path");

const VALID_FIGURE_ALIGNS = new Set(["left", "center", "right"]);

/**
 * FigureRenderer handles images, figures, borders, and captions.
 *
 * Supported source types:
 * - File path string
 * - Buffer containing PNG/JPEG data
 *
 * Supported width formats:
 * - Number: width in PDF points
 * - Percentage string: "50%", "75%", etc.
 */

class FigureRenderer {
  constructor(formalDocument) {
    this.document = formalDocument;
  }

  render(src, options = {}) {
    const style = this.document.styles.get("figure");
    const captionStyle = this.document.styles.get("caption");
    const layout = this.document.layout;
    const pdf = this.document.doc;

    const resolvedSrc = this._resolveSource(src);

    let image;

    try {
      image = pdf.openImage(resolvedSrc);
    } catch (error) {
      throw new Error(
        `Failed to open image.\n` +
        `PDFKit error: ${error.message}`
      );
    }

    if (!image || !image.width || !image.height) {
      throw new Error(
        "Unable to read image dimensions. " +
        "Only PNG and JPEG images are supported."
      );
    }

    const intrinsicWidth = image.width;
    const intrinsicHeight = image.height;
    const aspectRatio = intrinsicHeight / intrinsicWidth;

    let targetWidth = this._computeWidth(
      options.width,
      style.defaultWidthRatio
    );

    let targetHeight;

    if (Number.isFinite(options.height)) {
      targetHeight = options.height;
    } else {
      targetHeight = targetWidth * aspectRatio;
    }

    if (
      Number.isFinite(options.width) &&
      Number.isFinite(options.height)
    ) {
      targetWidth = options.width;
      targetHeight = options.height;
    } else if (
      Number.isFinite(options.height) &&
      !Number.isFinite(options.width)
    ) {
      targetWidth = options.height / aspectRatio;
    }

    if (targetWidth <= 0 || targetHeight <= 0) {
      throw new Error(
        "Figure width and height must be greater than zero."
      );
    }

    if (targetWidth > layout.contentWidth) {
      const scale = layout.contentWidth / targetWidth;
      targetWidth *= scale;
      targetHeight *= scale;
    }

    const captionText = this._formatCaption(options);

    const captionHeight = captionText
      ? this._measureCaption(captionText, captionStyle)
      : 0;

    const captionSpacingBefore = captionText
      ? captionStyle.spacingBefore
      : 0;

    const figureSpacingBefore = style.spacingBefore || 0;
    const figureSpacingAfter = style.spacingAfter || 0;

    const availableFullPage =
      layout.maxY - layout.margins.top;

    const fullPageRequirement =
      targetHeight +
      captionSpacingBefore +
      captionHeight +
      figureSpacingAfter;

    if (fullPageRequirement > availableFullPage) {
      const maxImageHeight =
        availableFullPage -
        captionSpacingBefore -
        captionHeight -
        figureSpacingAfter;

      if (maxImageHeight <= 0) {
        throw new Error(
          "Figure caption is too tall to fit on a single page."
        );
      }

      const scale = maxImageHeight / targetHeight;
      targetWidth *= scale;
      targetHeight *= scale;
    }

    const spacingBeforeCurrentPage =
      layout.currentY > layout.margins.top
        ? figureSpacingBefore
        : 0;

    const currentPageRequirement =
      spacingBeforeCurrentPage +
      targetHeight +
      captionSpacingBefore +
      captionHeight +
      figureSpacingAfter;

    if (
      layout.currentY + currentPageRequirement > layout.maxY
    ) {
      layout.addPage();
    } else if (spacingBeforeCurrentPage > 0) {
      layout.moveDown(figureSpacingBefore);
    }

    const align = options.align || style.align || "center";

    if (!VALID_FIGURE_ALIGNS.has(align)) {
      throw new Error(
        `Invalid figure alignment: "${align}".\n` +
        `Expected one of: left, center, right.`
      );
    }

    const y = layout.currentY;
    const x = this._computeX(align, targetWidth);

    pdf.image(resolvedSrc, x, y, {
      width: targetWidth,
      height: targetHeight
    });

    if (options.border) {
      this._drawBorder(
        x,
        y,
        targetWidth,
        targetHeight,
        style.borderWidth,
        style.borderColor
      );
    }

    layout.currentY = y + targetHeight;

    if (captionText) {
      layout.moveDown(captionStyle.spacingBefore);

      pdf.font(captionStyle.fontFamily).fontSize(captionStyle.fontSize);

      if (captionStyle.color) {
        pdf.fillColor(captionStyle.color);
      }

      pdf.text(captionText, layout.contentX, layout.currentY, {
        width: layout.contentWidth,
        align: captionStyle.align,
        lineGap: captionStyle.lineGap
      });

      layout.currentY = pdf.y;
    }

    layout.moveDown(figureSpacingAfter);

    this.document._applyDefaultFont();

    return this.document;
  }

  _resolveSource(src) {
    if (Buffer.isBuffer(src)) {
      return src;
    }

    if (typeof src !== "string") {
      throw new Error(
        "Figure source must be a file path string or a Buffer."
      );
    }

    const resolvedPath = path.resolve(src);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(
        `Image file not found:\n${resolvedPath}`
      );
    }

    return resolvedPath;
  }

  _computeWidth(widthOption, defaultWidthRatio) {
    const contentWidth = this.document.layout.contentWidth;

    if (widthOption === undefined || widthOption === null) {
      return contentWidth * defaultWidthRatio;
    }

    if (typeof widthOption === "number") {
      if (widthOption <= 0) {
        throw new Error(
          "Figure width must be greater than zero."
        );
      }

      return widthOption;
    }

    if (typeof widthOption === "string") {
      const trimmed = widthOption.trim();

      if (trimmed.endsWith("%")) {
        const percent = Number.parseFloat(trimmed);

        if (!Number.isFinite(percent) || percent <= 0) {
          throw new Error(
            `Invalid figure width percentage: "${widthOption}".`
          );
        }

        return contentWidth * (percent / 100);
      }
    }

    throw new Error(
      `Invalid figure width: "${widthOption}".\n` +
      `Expected a positive number in points or a percentage string such as "75%".`
    );
  }

  _computeX(align, targetWidth) {
    const layout = this.document.layout;

    if (align === "left") {
      return layout.contentX;
    }

    if (align === "right") {
      return layout.contentX + layout.contentWidth - targetWidth;
    }

    return layout.contentX + (layout.contentWidth - targetWidth) / 2;
  }

  _formatCaption(options) {
    if (
      options.caption === undefined ||
      options.caption === null ||
      options.caption === false ||
      options.caption === ""
    ) {
      return "";
    }

    const text = String(options.caption)
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      return "";
    }

    if (options.autoLabel === false) {
      return text;
    }

    const label =
      options.label === undefined
        ? "Figure"
        : String(options.label).trim();

    if (!label) {
      return text;
    }

    if (!this.document.counters) {
      this.document.counters = {};
    }

    if (!Number.isFinite(this.document.counters.figure)) {
      this.document.counters.figure = 0;
    }

    this.document.counters.figure += 1;

    const figureNumber = this.document.counters.figure;

    return `${label} ${figureNumber}. ${text}`;
  }

  _measureCaption(captionText, captionStyle) {
    const pdf = this.document.doc;
    const layout = this.document.layout;

    pdf.font(captionStyle.fontFamily).fontSize(captionStyle.fontSize);

    return pdf.heightOfString(captionText, {
      width: layout.contentWidth,
      lineGap: captionStyle.lineGap
    });
  }

  _drawBorder(x, y, width, height, lineWidth, color) {
    const pdf = this.document.doc;

    pdf.save();

    pdf.lineWidth(lineWidth);

    if (color) {
      pdf.strokeColor(color);
    }

    pdf.rect(x, y, width, height);
    pdf.stroke();

    pdf.restore();
  }
}

module.exports = FigureRenderer;