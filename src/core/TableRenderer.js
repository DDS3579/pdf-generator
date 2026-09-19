const VALID_ALIGNS = new Set(["left", "center", "right"]);

/**
 * TableRenderer handles formal table layout.
 *
 * Current design:
 * - Relative column widths
 * - Wrapped cell text
 * - Repeating header rows across pages
 * - Whole-row page breaking
 * - Horizontal rules only by default
 * - Optional zebra rows
 * - Optional caption and automatic table numbering
 * - Theme-aware colors
 */

class TableRenderer {
  constructor(formalDocument) {
    this.document = formalDocument;
  }

  render(config) {
    const style = this.document.styles.get("table");
    const layout = this.document.layout;
    const pdf = this.document.doc;

    this._validateConfig(config);

    const headers = config.headers.map((header) => {
      if (header === null || header === undefined) {
        return "";
      }

      return String(header);
    });

    const columnCount = headers.length;

    const columnWidths = this._computeColumnWidths(
      config.columnWidths,
      columnCount
    );

    const columnAligns = this._computeColumnAligns(
      config.aligns,
      columnCount,
      style.align
    );

    const rows = config.rows.map((row, rowIndex) => {
      return this._normalizeRow(row, rowIndex, columnCount);
    });

    const showRowRules = Boolean(config.rowRules ?? style.rowRules);

    const useZebra =
      config.zebra === true ||
      (config.zebra !== false && Boolean(style.zebraBgColor));

    const captionText = this._formatCaption(config);

    const captionStyle = this.document.styles.get("tableCaption");

    let captionHeight = 0;
    let captionSpacingAfter = 0;

    if (captionText) {
      pdf.font(captionStyle.fontFamily).fontSize(captionStyle.fontSize);

      captionHeight = pdf.heightOfString(captionText, {
        width: layout.contentWidth,
        lineGap: captionStyle.lineGap
      });

      captionSpacingAfter = captionStyle.spacingAfter || 0;
    }

    if (
      style.spacingBefore > 0 &&
      layout.currentY > layout.margins.top
    ) {
      layout.moveDown(style.spacingBefore);
    }

    const headerCells = headers.map((text, index) => {
      return {
        text,
        align: columnAligns[index]
      };
    });

    const availableFullPage = layout.maxY - layout.margins.top;

    const headerHeight = this._measureRow(
      headerCells,
      columnWidths,
      style,
      true
    );

    if (headerHeight > availableFullPage) {
      throw new Error(
        "Table header is too tall to fit on a full page."
      );
    }

    const rowHeights = rows.map((row, rowIndex) => {
      const rowHeight = this._measureRow(
        row,
        columnWidths,
        style,
        false
      );

      if (headerHeight + rowHeight > availableFullPage) {
        throw new Error(
          `Table row ${rowIndex + 1} is too tall to fit on a page ` +
          `with the repeated table header.\n` +
          `Reduce the cell text, adjust column widths, or split the row.`
        );
      }

      return rowHeight;
    });

    const firstRowHeight = rowHeights.length > 0
      ? rowHeights[0]
      : 0;

    const initialRequiredHeight =
      captionHeight +
      captionSpacingAfter +
      headerHeight +
      firstRowHeight;

    if (initialRequiredHeight > availableFullPage) {
      throw new Error(
        "Table caption, header, and first row are too tall to fit on a full page."
      );
    }

    if (layout.currentY + initialRequiredHeight > layout.maxY) {
      layout.addPage();
    }

    if (captionText) {
      pdf.font(captionStyle.fontFamily).fontSize(captionStyle.fontSize);

      if (captionStyle.color) {
        pdf.fillColor(captionStyle.color);
      }

      pdf.text(captionText, layout.contentX, layout.currentY, {
        width: layout.contentWidth,
        align: captionStyle.align,
        lineGap: captionStyle.lineGap
      });

      layout.currentY = pdf.y + captionSpacingAfter;
    }

    this._drawHeader(headerCells, columnWidths, style);

    rows.forEach((row, rowIndex) => {
      const rowHeight = rowHeights[rowIndex];

      if (layout.currentY + rowHeight > layout.maxY) {
        this._drawBottomRule(style);

        layout.addPage();

        this._drawHeader(headerCells, columnWidths, style);
      }

      this._drawRow(
        row,
        columnWidths,
        columnAligns,
        style,
        rowHeight,
        showRowRules,
        useZebra && rowIndex % 2 === 1
      );
    });

    this._drawBottomRule(style);

    layout.moveDown(style.spacingAfter);

    this.document._applyDefaultFont();

    return this.document;
  }

  _validateConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error(
        "doc.table(config) requires a configuration object."
      );
    }

    if (!Array.isArray(config.headers) || config.headers.length === 0) {
      throw new Error(
        "Table headers must be a non-empty array."
      );
    }

    if (!Array.isArray(config.rows)) {
      throw new Error(
        "Table rows must be an array."
      );
    }
  }

  _formatCaption(config) {
    if (
      config.caption === undefined ||
      config.caption === null ||
      config.caption === false ||
      config.caption === ""
    ) {
      return "";
    }

    const text = String(config.caption)
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      return "";
    }

    if (config.autoLabel === false) {
      return text;
    }

    const label =
      config.label === undefined
        ? "Table"
        : String(config.label).trim();

    if (!label) {
      return text;
    }

    if (!this.document.counters) {
      this.document.counters = {};
    }

    if (!Number.isFinite(this.document.counters.table)) {
      this.document.counters.table = 0;
    }

    this.document.counters.table += 1;

    const tableNumber = this.document.counters.table;

    return `${label} ${tableNumber}. ${text}`;
  }

  _computeColumnWidths(columnWidths, columnCount) {
    const contentWidth = this.document.layout.contentWidth;

    if (!columnWidths) {
      return Array(columnCount).fill(contentWidth / columnCount);
    }

    if (!Array.isArray(columnWidths)) {
      throw new Error(
        "Table columnWidths must be an array."
      );
    }

    if (columnWidths.length !== columnCount) {
      throw new Error(
        `Table columnWidths length does not match header count.\n` +
        `Expected: ${columnCount}\n` +
        `Received: ${columnWidths.length}`
      );
    }

    const isValid = columnWidths.every((width) => {
      return typeof width === "number" && width > 0;
    });

    if (!isValid) {
      throw new Error(
        "Table columnWidths must contain positive numbers."
      );
    }

    const total = columnWidths.reduce((sum, width) => {
      return sum + width;
    }, 0);

    return columnWidths.map((width) => {
      return (width / total) * contentWidth;
    });
  }

  _computeColumnAligns(aligns, columnCount, defaultAlign) {
    if (!aligns) {
      return Array(columnCount).fill(defaultAlign);
    }

    if (!Array.isArray(aligns)) {
      throw new Error(
        "Table aligns must be an array."
      );
    }

    if (aligns.length !== columnCount) {
      throw new Error(
        `Table aligns length does not match header count.\n` +
        `Expected: ${columnCount}\n` +
        `Received: ${aligns.length}`
      );
    }

    return aligns.map((align, index) => {
      const finalAlign = align || defaultAlign;

      if (!VALID_ALIGNS.has(finalAlign)) {
        throw new Error(
          `Table column ${index + 1} has invalid alignment: "${align}".\n` +
          `Expected one of: left, center, right.`
        );
      }

      return finalAlign;
    });
  }

  _normalizeRow(row, rowIndex, columnCount) {
    if (!Array.isArray(row)) {
      throw new Error(
        `Table row ${rowIndex + 1} must be an array.`
      );
    }

    if (row.length !== columnCount) {
      throw new Error(
        `Table row ${rowIndex + 1} column count does not match header count.\n` +
        `Expected: ${columnCount}\n` +
        `Received: ${row.length}`
      );
    }

    return row.map((cell, columnIndex) => {
      return this._normalizeCell(cell, rowIndex, columnIndex);
    });
  }

  _normalizeCell(cell, rowIndex, columnIndex) {
    const location =
      `Table row ${rowIndex + 1}, column ${columnIndex + 1}`;

    if (cell === null || cell === undefined) {
      return {
        text: ""
      };
    }

    if (
      typeof cell === "string" ||
      typeof cell === "number" ||
      typeof cell === "boolean"
    ) {
      return {
        text: String(cell)
      };
    }

    if (typeof cell === "object") {
      if (cell.text === undefined || cell.text === null) {
        throw new Error(
          `${location} object must have a "text" property.`
        );
      }

      const normalized = {
        text: String(cell.text)
      };

      if (cell.align !== undefined) {
        if (!VALID_ALIGNS.has(cell.align)) {
          throw new Error(
            `${location} has invalid alignment: "${cell.align}".\n` +
            `Expected one of: left, center, right.`
          );
        }

        normalized.align = cell.align;
      }

      return normalized;
    }

    throw new Error(
      `${location} must be a string, number, boolean, null, ` +
      `or an object with a "text" property.`
    );
  }

  _measureRow(cells, columnWidths, style, isHeader) {
    const pdf = this.document.doc;

    const fontFamily = isHeader
      ? style.headerFontFamily
      : style.cellFontFamily;

    const fontSize = isHeader
      ? style.headerFontSize
      : style.cellFontSize;

    pdf.font(fontFamily).fontSize(fontSize);

    let maxTextHeight = 0;

    cells.forEach((cell, index) => {
      const textWidth =
        columnWidths[index] - style.cellPaddingX * 2;

      if (textWidth <= 0) {
        throw new Error(
          `Table column ${index + 1} is too narrow after cell padding.`
        );
      }

      const textHeight = pdf.heightOfString(cell.text || "", {
        width: textWidth,
        lineGap: style.lineGap
      });

      if (textHeight > maxTextHeight) {
        maxTextHeight = textHeight;
      }
    });

    return maxTextHeight + style.cellPaddingY * 2;
  }

  _drawHorizontalRule(y, lineWidth, color) {
    const pdf = this.document.doc;
    const layout = this.document.layout;

    pdf.save();

    pdf.lineWidth(lineWidth);

    if (color) {
      pdf.strokeColor(color);
    }

    pdf.moveTo(layout.contentX, y);
    pdf.lineTo(layout.contentX + layout.contentWidth, y);
    pdf.stroke();

    pdf.restore();
  }

  _drawHeader(headerCells, columnWidths, style) {
    const layout = this.document.layout;
    const pdf = this.document.doc;

    const rowTop = layout.currentY;

    const rowHeight = this._measureRow(
      headerCells,
      columnWidths,
      style,
      true
    );

    if (style.headerBgColor) {
      pdf.save();

      pdf.rect(
        layout.contentX,
        rowTop,
        layout.contentWidth,
        rowHeight
      );

      pdf.fill(style.headerBgColor);

      pdf.restore();
    }

    this._drawHorizontalRule(
      rowTop,
      style.topRuleWidth,
      style.ruleColor
    );

    const textY = rowTop + style.cellPaddingY;

    let x = layout.contentX;

    pdf.font(style.headerFontFamily).fontSize(style.headerFontSize);

    if (style.headerColor) {
      pdf.fillColor(style.headerColor);
    }

    headerCells.forEach((cell, index) => {
      const textWidth =
        columnWidths[index] - style.cellPaddingX * 2;

      if (cell.text) {
        pdf.text(cell.text, x + style.cellPaddingX, textY, {
          width: textWidth,
          align: cell.align,
          lineGap: style.lineGap
        });
      }

      x += columnWidths[index];
    });

    layout.currentY = rowTop + rowHeight;

    this._drawHorizontalRule(
      layout.currentY,
      style.headerRuleWidth,
      style.ruleColor
    );
  }

  _drawRow(
    row,
    columnWidths,
    columnAligns,
    style,
    rowHeight,
    showRowRules,
    zebra
  ) {
    const layout = this.document.layout;
    const pdf = this.document.doc;

    const rowTop = layout.currentY;

    if (zebra && style.zebraBgColor) {
      pdf.save();

      pdf.rect(
        layout.contentX,
        rowTop,
        layout.contentWidth,
        rowHeight
      );

      pdf.fill(style.zebraBgColor);

      pdf.restore();
    }

    const textY = rowTop + style.cellPaddingY;

    let x = layout.contentX;

    pdf.font(style.cellFontFamily).fontSize(style.cellFontSize);

    if (style.cellColor) {
      pdf.fillColor(style.cellColor);
    }

    row.forEach((cell, index) => {
      const textWidth =
        columnWidths[index] - style.cellPaddingX * 2;

      const align = cell.align || columnAligns[index];

      if (cell.text) {
        pdf.text(cell.text, x + style.cellPaddingX, textY, {
          width: textWidth,
          align,
          lineGap: style.lineGap
        });
      }

      x += columnWidths[index];
    });

    layout.currentY = rowTop + rowHeight;

    if (showRowRules) {
      this._drawHorizontalRule(
        layout.currentY,
        style.rowRuleWidth,
        style.ruleColor
      );
    }
  }

  _drawBottomRule(style) {
    this._drawHorizontalRule(
      this.document.layout.currentY,
      style.bottomRuleWidth,
      style.ruleColor
    );
  }
}

module.exports = TableRenderer;