const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const PageManager = require("./PageManager");
const StyleRegistry = require("./StyleRegistry");
const ListRenderer = require("./ListRenderer");
const TableRenderer = require("./TableRenderer");
const PageFurnitureRenderer = require("./PageFurnitureRenderer");
const CoverRenderer = require("./CoverRenderer");
const ReferenceRenderer = require("./ReferenceRenderer");
const FigureRenderer = require("./FigureRenderer");

let ThemeManager = null;

try {
  ({ ThemeManager } = require("./ThemeManager"));
} catch (error) {
  ThemeManager = null;
}

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

const CALLOUT_TYPE_PALETTES = {
  info: {
    background: "#eff6ff",
    border: "#bfdbfe",
    accent: "#1d4ed8",
    titleColor: "#1e3a8a"
  },
  note: {
    background: "#f8fafc",
    border: "#cbd5e1",
    accent: "#334155",
    titleColor: "#0f172a"
  },
  warning: {
    background: "#fffbeb",
    border: "#fde68a",
    accent: "#b45309",
    titleColor: "#92400e"
  },
  success: {
    background: "#f0fdf4",
    border: "#bbf7d0",
    accent: "#15803d",
    titleColor: "#166534"
  },
  danger: {
    background: "#fef2f2",
    border: "#fecaca",
    accent: "#b91c1c",
    titleColor: "#991b1b"
  }
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
      subtitle: "",
      author: "",
      organization: "",
      date: "",
      confidentiality: "",
      confidential: false,
      header: DEFAULT_HEADER,
      footer: DEFAULT_FOOTER,
      pageNumbering: DEFAULT_PAGE_NUMBERING,
      theme: "formal"
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

    this.options.confidentiality = this._normalizeConfidentiality(options);

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
      this.options.header.enabled = Boolean(this.options.organization);
    }

    this.theme = ThemeManager
      ? new ThemeManager(this.options.theme)
      : null;

    this.doc = new PDFDocument({
      size: "A4",
      margins: this.options.margins,
      bufferPages: true,
      info: {
        Title: this.options.title,
        Author: this.options.author,
        Subject: this.options.subtitle || "",
        Creator: "Formal PDF Engine"
      }
    });

    this.layout = new PageManager(this.doc, this.options.margins);
    this.styles = new StyleRegistry(this.theme);

    this.lists = new ListRenderer(this);
    this.tables = new TableRenderer(this);
    this.pageFurniture = new PageFurnitureRenderer(this);
    this.covers = new CoverRenderer(this);
    this.referencesRenderer = new ReferenceRenderer(this);

    this.counters = {
      figure: 0,
      table: 0
    };

    this.figures = new FigureRenderer(this);

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

    this.doc
      .font(paragraphStyle.fontFamily)
      .fontSize(paragraphStyle.fontSize);

    if (paragraphStyle.color) {
      this.doc.fillColor(paragraphStyle.color);
    }
  }

  _applyStyle(style) {
    this.doc
      .font(style.fontFamily)
      .fontSize(style.fontSize);

    if (style.color) {
      this.doc.fillColor(style.color);
    }
  }

  _fontPath(fileName) {
    return path.resolve(this.options.fontsDir, fileName);
  }

  _registerFont(alias, fileName, required = false) {
    const filePath = this._fontPath(fileName);

    if (!fs.existsSync(filePath)) {
      if (required) {
        throw new Error(
          `Required font file not found:\n` +
          `${filePath}\n` +
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

  cover(overrides = {}) {
    if (
      this.layout.pageNumber !== 1 ||
      this.layout.currentY !== this.layout.margins.top
    ) {
      throw new Error(
        "doc.cover() must be called at the very beginning of the document, " +
        "before any other content."
      );
    }

    this.covers.render(overrides);

    const existingRaw = Number(this.options.pageNumbering.coverPages);

    const existingCoverPages =
      Number.isFinite(existingRaw) && existingRaw >= 0
        ? Math.floor(existingRaw)
        : 0;

    this.options.pageNumbering.coverPages = Math.max(
      existingCoverPages,
      1
    );

    this.layout.addPage();

    return this;
  }

  paragraph(content, options = {}) {
    const baseStyle = this.styles.get("paragraph");

    const style = {
      ...baseStyle,
      ...options
    };

    this._renderTextBlock(content, style);

    return this;
  }

  heading(level, content) {
    const styleName = `h${level}`;
    const style = this.styles.get(styleName);

    this._applyStyle(style);

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

    this._applyStyle(style);

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

    this._applyStyle(style);

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

    this._applyStyle(style);

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

  references(items, options = {}) {
    return this.referencesRenderer.render(items, options);
  }

  figure(src, options = {}) {
    return this.figures.render(src, options);
  }

  image(src, options = {}) {
    return this.figures.render(src, options);
  }

  pageBreak() {
    if (this.layout.currentY > this.layout.margins.top) {
      this.layout.addPage();
    }

    return this;
  }

  spacer(points = 12) {
    if (!Number.isFinite(points) || points <= 0) {
      return this;
    }

    const fullPageAvailable =
      this.layout.maxY - this.layout.margins.top;

    const amount = Math.min(points, fullPageAvailable);

    if (this.layout.currentY + amount > this.layout.maxY) {
      this.layout.addPage();
    }

    this.layout.moveDown(amount);

    return this;
  }

  divider(options = {}) {
    const style = this.styles.get("divider");

    const opts = {
      ...style,
      ...options
    };

    if (!Number.isFinite(opts.widthRatio) || opts.widthRatio <= 0) {
      opts.widthRatio = 1;
    }

    if (opts.widthRatio > 1) {
      opts.widthRatio = 1;
    }

    const ruleThickness = Math.max(opts.lineWidth || 0.75, 0.25);

    const requiredHeight =
      opts.spacingBefore +
      ruleThickness +
      opts.spacingAfter;

    if (this.layout.currentY + requiredHeight > this.layout.maxY) {
      this.layout.addPage();
    }

    if (
      opts.spacingBefore > 0 &&
      this.layout.currentY > this.layout.margins.top
    ) {
      this.layout.moveDown(opts.spacingBefore);
    }

    const ruleWidth = this.layout.contentWidth * opts.widthRatio;

    let xStart = this.layout.contentX;

    if (opts.align === "right") {
      xStart =
        this.layout.contentX +
        this.layout.contentWidth -
        ruleWidth;
    } else if (opts.align === "center" || !opts.align) {
      xStart =
        this.layout.contentX +
        (this.layout.contentWidth - ruleWidth) / 2;
    }

    const y = this.layout.currentY + ruleThickness / 2;

    const pdf = this.doc;

    pdf.save();

    pdf.lineWidth(ruleThickness);

    if (opts.color) {
      pdf.strokeColor(opts.color);
    }

    pdf.moveTo(xStart, y);
    pdf.lineTo(xStart + ruleWidth, y);
    pdf.stroke();

    pdf.restore();

    this.layout.currentY = y + ruleThickness / 2 + opts.spacingAfter;

    return this;
  }

  callout(content, options = {}) {
    if (typeof content !== "string" || content.trim().length === 0) {
      throw new Error(
        "doc.callout(content) requires a non-empty string."
      );
    }

    const style = this.styles.get("callout");

    const palette = this._getCalloutPalette(options, style);

    const opts = {
      ...style,
      ...options,
      ...palette
    };

    const layout = this.layout;
    const pdf = this.doc;

    const accentWidth = Number(opts.accentWidth) || 0;

    const textX = layout.contentX + accentWidth + opts.paddingX;

    const textWidth =
      layout.contentWidth -
      accentWidth -
      opts.paddingX * 2;

    if (textWidth <= 0) {
      throw new Error(
        "Callout padding and accent width leave no available text width."
      );
    }

    const title =
      options.title === undefined || options.title === null
        ? ""
        : String(options.title).trim();

    pdf.font(opts.fontFamily).fontSize(opts.titleFontSize || opts.fontSize);

    let titleHeight = 0;

    if (title) {
      titleHeight = pdf.heightOfString(title, {
        width: textWidth,
        lineGap: opts.lineGap
      });

      titleHeight += opts.titleSpacingAfter || 0;
    }

    const lineHeight = opts.fontSize + opts.lineGap;

    const bodyLines = this._wrapText(
      content,
      textWidth,
      opts.fontFamily,
      opts.fontSize
    );

    if (bodyLines.length === 0) {
      bodyLines.push("");
    }

    const fullPageAvailable = layout.maxY - layout.margins.top;

    const minimalBoxHeight =
      opts.paddingY * 2 +
      titleHeight +
      lineHeight;

    if (minimalBoxHeight > fullPageAvailable) {
      throw new Error(
        "Callout is too tall to fit on a single page."
      );
    }

    if (layout.currentY > layout.margins.top) {
      layout.moveDown(opts.spacingBefore);
    }

    if (layout.currentY + minimalBoxHeight > layout.maxY) {
      layout.addPage();
    }

    let remainingLines = bodyLines;
    let isFirstFragment = true;

    while (remainingLines.length > 0) {
      const availableHeight = layout.maxY - layout.currentY;

      const reservedTitleHeight = isFirstFragment
        ? titleHeight
        : 0;

      const availableForLines =
        availableHeight -
        opts.paddingY * 2 -
        reservedTitleHeight;

      let linesFit = Math.floor(availableForLines / lineHeight);

      if (linesFit <= 0) {
        layout.addPage();
        continue;
      }

      if (linesFit > remainingLines.length) {
        linesFit = remainingLines.length;
      }

      const fragmentLines = remainingLines.slice(0, linesFit);

      const isLastFragment = linesFit === remainingLines.length;

      const boxHeight =
        opts.paddingY * 2 +
        reservedTitleHeight +
        fragmentLines.length * lineHeight;

      this._drawCalloutBlock({
        title: isFirstFragment ? title : "",
        bodyLines: fragmentLines,
        boxHeight,
        opts,
        textX,
        textWidth,
        lineHeight
      });

      if (isLastFragment) {
        layout.moveDown(opts.spacingAfter);
        break;
      }

      layout.addPage();

      isFirstFragment = false;
      remainingLines = remainingLines.slice(linesFit);
    }

    this._applyDefaultFont();

    return this;
  }

  _getCalloutPalette(options, style) {
    if (!options.type) {
      return {};
    }

    const palette = CALLOUT_TYPE_PALETTES[options.type];

    if (!palette) {
      throw new Error(
        `Invalid callout type: "${options.type}".\n` +
        `Expected one of: info, note, warning, success, danger.`
      );
    }

    return {
      ...palette
    };
  }

  _drawCalloutBlock({
    title,
    bodyLines,
    boxHeight,
    opts,
    textX,
    textWidth,
    lineHeight
  }) {
    const pdf = this.doc;
    const layout = this.layout;

    const boxTop = layout.currentY;

    if (opts.background) {
      pdf.save();

      pdf.rect(
        layout.contentX,
        boxTop,
        layout.contentWidth,
        boxHeight
      );

      pdf.fill(opts.background);

      pdf.restore();
    }

    if (opts.accent && opts.accentWidth) {
      pdf.save();

      pdf.rect(
        layout.contentX,
        boxTop,
        opts.accentWidth,
        boxHeight
      );

      pdf.fill(opts.accent);

      pdf.restore();
    }

    if (opts.border) {
      pdf.save();

      pdf.lineWidth(0.5);
      pdf.strokeColor(opts.border);

      pdf.rect(
        layout.contentX,
        boxTop,
        layout.contentWidth,
        boxHeight
      );

      pdf.stroke();

      pdf.restore();
    }

    let y = boxTop + opts.paddingY;

    if (title) {
      pdf.font(opts.fontFamily).fontSize(opts.titleFontSize || opts.fontSize);

      const titleColor =
        opts.titleColor ||
        opts.accent ||
        opts.color;

      if (titleColor) {
        pdf.fillColor(titleColor);
      }

      pdf.text(title, textX, y, {
        width: textWidth,
        lineGap: opts.lineGap
      });

      y = pdf.y + (opts.titleSpacingAfter || 0);
    }

    pdf.font(opts.fontFamily).fontSize(opts.fontSize);

    if (opts.color) {
      pdf.fillColor(opts.color);
    }

    bodyLines.forEach((line) => {
      pdf.text(line, textX, y, {
        lineBreak: false
      });

      y += lineHeight;
    });

    layout.currentY = boxTop + boxHeight;
  }

  _wrapText(text, width, fontFamily, fontSize) {
    if (width <= 0) {
      throw new Error(
        "Text wrapping width must be greater than zero."
      );
    }

    const pdf = this.doc;

    pdf.font(fontFamily).fontSize(fontSize);

    const paragraphs = String(text).split(/\n/);
    const lines = [];

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();

      if (trimmed.length === 0) {
        lines.push("");
        continue;
      }

      const words = trimmed.split(/\s+/).filter(Boolean);

      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine
          ? `${currentLine} ${word}`
          : word;

        if (pdf.widthOfString(testLine) <= width) {
          currentLine = testLine;
          continue;
        }

        if (currentLine) {
          lines.push(currentLine);
        }

        let remainingWord = word;

        while (pdf.widthOfString(remainingWord) > width) {
          let breakIndex = remainingWord.length;

          while (
            breakIndex > 1 &&
            pdf.widthOfString(remainingWord.slice(0, breakIndex)) > width
          ) {
            breakIndex -= 1;
          }

          lines.push(remainingWord.slice(0, breakIndex));

          remainingWord = remainingWord.slice(breakIndex);
        }

        currentLine = remainingWord;
      }

      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines;
  }

  _renderTextBlock(content, style) {
    this._applyStyle(style);

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

    this._applyStyle(style);

    this.doc.text(
      content,
      this.layout.contentX,
      this.layout.currentY,
      textOptions
    );

    this.layout.currentY = this.doc.y + style.spacingAfter;

    this._applyDefaultFont();
  }

  save(filePath, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const outputPath = path.resolve(filePath);
        const outputDir = path.dirname(outputPath);

        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, {
            recursive: true
          });
        }

        FormalDocument.lastOutputPath = outputPath;

        const stream = fs.createWriteStream(outputPath);

        stream.on("finish", () => {
          if (!options.silent) {
            console.log(`✅ PDF generated successfully: ${outputPath}`);
          }

          resolve(outputPath);
        });

        stream.on("error", reject);

        this.doc.on("error", reject);

        this.doc.pipe(stream);

        this.pageFurniture.render();

        this.doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

FormalDocument.lastOutputPath = null;

module.exports = FormalDocument;