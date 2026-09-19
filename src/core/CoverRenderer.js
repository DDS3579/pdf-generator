const fs = require("fs");
const path = require("path");

/**
 * CoverRenderer renders a formal cover page.
 *
 * Supported cover enhancements:
 * - logo
 * - version
 * - status
 * - reference
 * - custom metadata rows
 * - compact metadata rendering
 * - adaptive spacing for dense cover metadata
 */

class CoverRenderer {
  constructor(formalDocument) {
    this.document = formalDocument;
  }

  render(overrides = {}) {
    const options = this.document.options;

    const merged = {
      title: options.title,
      subtitle: options.subtitle,
      author: options.author,
      organization: options.organization,
      date: options.date,
      preparedByLabel: "Prepared by",
      logo: null,
      logoWidth: null,
      version: null,
      status: null,
      reference: null,
      meta: [],
      compactMeta: null,
      ...overrides
    };

    if (
      merged.compactMeta !== null &&
      merged.compactMeta !== undefined &&
      typeof merged.compactMeta !== "boolean"
    ) {
      throw new Error(
        "cover.compactMeta must be a boolean value."
      );
    }

    const toText = (value) => {
      if (value === null || value === undefined) {
        return "";
      }

      return String(value);
    };

    const cover = {
      title: toText(merged.title),
      subtitle: toText(merged.subtitle),
      author: toText(merged.author),
      organization: toText(merged.organization),
      date: toText(merged.date),
      preparedByLabel: toText(merged.preparedByLabel),
      logo: merged.logo || null,
      logoWidth: merged.logoWidth,
      compactMeta: merged.compactMeta,
      meta: this._normalizeMeta(merged)
    };

    this._draw(cover);
  }

  _normalizeMeta(merged) {
    const rows = [];

    const addRow = (label, value) => {
      if (value === undefined || value === null) {
        return;
      }

      const text = String(value).trim();

      if (!text) {
        return;
      }

      rows.push({
        label: String(label),
        value: text
      });
    };

    addRow("Version", merged.version);
    addRow("Status", merged.status);
    addRow("Reference", merged.reference);

    if (merged.meta === undefined || merged.meta === null) {
      return rows;
    }

    if (!Array.isArray(merged.meta)) {
      throw new Error(
        "cover.meta must be an array of metadata rows."
      );
    }

    merged.meta.forEach((item, index) => {
      if (typeof item === "string") {
        const value = item.trim();

        if (!value) {
          throw new Error(
            `cover.meta[${index}] cannot be an empty string.`
          );
        }

        rows.push({
          label: "",
          value
        });

        return;
      }

      if (item && typeof item === "object") {
        const label =
          item.label === undefined || item.label === null
            ? ""
            : String(item.label).trim();

        const value =
          item.value === undefined || item.value === null
            ? ""
            : String(item.value).trim();

        if (!value) {
          throw new Error(
            `cover.meta[${index}] must have a non-empty value.`
          );
        }

        rows.push({
          label,
          value
        });

        return;
      }

      throw new Error(
        `Invalid cover.meta[${index}]. ` +
        `Expected a string or an object with label and value.`
      );
    });

    return rows;
  }

  _resolveLogo(logo) {
    if (Buffer.isBuffer(logo)) {
      return logo;
    }

    if (typeof logo !== "string") {
      throw new Error(
        "Cover logo must be a file path string or a Buffer."
      );
    }

    const resolvedPath = path.resolve(logo);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(
        `Cover logo file not found:\n${resolvedPath}`
      );
    }

    return resolvedPath;
  }

  _draw(cover) {
    const pdf = this.document.doc;
    const layout = this.document.layout;
    const styles = this.document.styles;

    const x = layout.contentX;
    const width = layout.contentWidth;
    const pageHeight = layout.pageHeight;

    const setFont = (style) => {
      pdf.font(style.fontFamily).fontSize(style.fontSize);

      if (style.color) {
        pdf.fillColor(style.color);
      }
    };

    let y = pageHeight * 0.16;

    if (cover.logo) {
      const logoResult = this._drawLogo(
        cover.logo,
        cover.logoWidth,
        y
      );

      y = Math.max(y, logoResult.y + logoResult.height + 28);
    }

    if (cover.organization) {
      const style = styles.get("coverOrganization");

      setFont(style);

      const text = style.uppercase
        ? cover.organization.toUpperCase()
        : cover.organization;

      pdf.text(text, x, y, {
        width,
        align: "center",
        lineGap: style.lineGap
      });

      y = pdf.y + style.spacingAfter;
    }

    const titleMinY = pageHeight * 0.30;
    y = Math.max(y, titleMinY);

    if (cover.title) {
      const style = styles.get("coverTitle");

      setFont(style);

      pdf.text(cover.title, x, y, {
        width,
        align: "center",
        lineGap: style.lineGap
      });

      y = pdf.y + style.spacingAfter;
    }

    if (cover.subtitle) {
      const style = styles.get("coverSubtitle");

      setFont(style);

      pdf.text(cover.subtitle, x, y, {
        width,
        align: "center",
        lineGap: style.lineGap
      });

      y = pdf.y + style.spacingAfter;
    }

    const denseMeta =
      cover.meta.length > 3 ||
      (cover.author && cover.meta.length > 2);

    const ruleMinY = pageHeight * (denseMeta ? 0.50 : 0.58);
    const ruleY = Math.max(y + 12, ruleMinY);

    this._drawRule(ruleY);

    let metaY = Math.max(
      pageHeight * (denseMeta ? 0.56 : 0.68),
      ruleY + (denseMeta ? 24 : 36)
    );

    const dateStyle = styles.get("coverDate");

    const maxSafeDateY =
      pageHeight - layout.margins.bottom - dateStyle.fontSize;

    const maxMetaY = maxSafeDateY - 16;

    if (cover.author) {
      const labelStyle = styles.get("coverMetaLabel");
      const valueStyle = styles.get("coverMetaValue");

      const hasMeta = cover.meta.length > 0;

      const labelSpacing = hasMeta
        ? 2
        : labelStyle.spacingAfter;

      const valueSpacing = hasMeta
        ? (denseMeta ? 6 : 8)
        : valueStyle.spacingAfter;

      let showPreparedByLabel = Boolean(cover.preparedByLabel);

      const preparedByLabelText = labelStyle.uppercase
        ? cover.preparedByLabel.toUpperCase()
        : cover.preparedByLabel;

      const measureAuthor = (withLabel) => {
        let requiredHeight = 0;

        if (withLabel) {
          setFont(labelStyle);

          requiredHeight +=
            pdf.heightOfString(preparedByLabelText, {
              width
            }) + labelSpacing;
        }

        setFont(valueStyle);

        requiredHeight +=
          pdf.heightOfString(cover.author, {
            width,
            lineGap: valueStyle.lineGap
          }) + valueSpacing;

        return requiredHeight;
      };

      let authorHeight = measureAuthor(showPreparedByLabel);

      if (
        metaY + authorHeight > maxMetaY &&
        showPreparedByLabel &&
        hasMeta
      ) {
        showPreparedByLabel = false;
        authorHeight = measureAuthor(showPreparedByLabel);
      }

      if (metaY + authorHeight > maxMetaY) {
        throw new Error(
          "Cover page author block does not fit on one page. " +
          "Reduce cover content or remove some metadata rows."
        );
      }

      if (showPreparedByLabel) {
        setFont(labelStyle);

        pdf.text(preparedByLabelText, x, metaY, {
          width,
          align: "center"
        });

        metaY = pdf.y + labelSpacing;
      }

      setFont(valueStyle);

      pdf.text(cover.author, x, metaY, {
        width,
        align: "center",
        lineGap: valueStyle.lineGap
      });

      metaY = pdf.y + valueSpacing;
    }

    if (cover.meta.length > 0) {
      const availableMetaSpace = maxMetaY - metaY;

      if (availableMetaSpace <= 0) {
        throw new Error(
          "Cover page metadata rows do not fit on one page. " +
          "Reduce the number of cover metadata rows."
        );
      }

      let compact;
      let tight = false;

      if (cover.compactMeta === true) {
        compact = true;
      } else if (cover.compactMeta === false) {
        compact = false;
      } else {
        const stackedHeight = this._measureMetaRowsHeight(
          cover.meta,
          false,
          false
        );

        compact =
          stackedHeight > availableMetaSpace ||
          cover.meta.length > 3;
      }

      let metaHeight = this._measureMetaRowsHeight(
        cover.meta,
        compact,
        false
      );

      if (metaHeight > availableMetaSpace) {
        if (!compact && cover.compactMeta !== false) {
          compact = true;

          metaHeight = this._measureMetaRowsHeight(
            cover.meta,
            compact,
            false
          );
        }
      }

      if (metaHeight > availableMetaSpace) {
        tight = true;

        metaHeight = this._measureMetaRowsHeight(
          cover.meta,
          compact,
          true
        );
      }

      if (metaHeight > availableMetaSpace) {
        throw new Error(
          "Cover page metadata rows do not fit on one page. " +
          "Reduce the number of cover metadata rows."
        );
      }

      metaY = this._drawMetaRows(
        cover.meta,
        compact,
        metaY,
        maxMetaY,
        tight
      );
    }

    if (cover.date) {
      const dateMinY = pageHeight * 0.78;

      let dateY = Math.max(metaY + 10, dateMinY);

      if (dateY > maxSafeDateY) {
        dateY = maxSafeDateY;
      }

      setFont(dateStyle);

      pdf.text(cover.date, x, dateY, {
        width,
        align: "center"
      });
    }

    this.document._applyDefaultFont();
  }

  _getMetaSpacing(compact, rows, tight = false) {
    if (compact) {
      return {
        label: 0,
        value: tight ? 2 : 4
      };
    }

    if (rows.length > 3) {
      return {
        label: 2,
        value: tight ? 6 : 10
      };
    }

    const labelStyle = this.document.styles.get("coverMetaLabel");
    const valueStyle = this.document.styles.get("coverMetaValue");

    return {
      label: labelStyle.spacingAfter,
      value: tight
        ? Math.min(10, valueStyle.spacingAfter)
        : valueStyle.spacingAfter
    };
  }

  _formatCompactMetaRow(row) {
    if (!row.label) {
      return row.value;
    }

    const labelStyle = this.document.styles.get("coverMetaLabel");

    const label = labelStyle.uppercase
      ? row.label.toUpperCase()
      : row.label;

    return `${label}: ${row.value}`;
  }

  _measureMetaRowsHeight(rows, compact, tight = false) {
    const pdf = this.document.doc;
    const width = this.document.layout.contentWidth;

    const labelStyle = this.document.styles.get("coverMetaLabel");
    const valueStyle = this.document.styles.get("coverMetaValue");

    const spacing = this._getMetaSpacing(compact, rows, tight);

    let height = 0;

    for (const row of rows) {
      if (compact) {
        const text = this._formatCompactMetaRow(row);

        pdf.font(valueStyle.fontFamily).fontSize(valueStyle.fontSize);

        height +=
          pdf.heightOfString(text, {
            width,
            lineGap: valueStyle.lineGap
          }) + spacing.value;

        continue;
      }

      if (row.label) {
        pdf.font(labelStyle.fontFamily).fontSize(labelStyle.fontSize);

        const labelText = labelStyle.uppercase
          ? row.label.toUpperCase()
          : row.label;

        height +=
          pdf.heightOfString(labelText, {
            width
          }) + spacing.label;
      }

      pdf.font(valueStyle.fontFamily).fontSize(valueStyle.fontSize);

      height +=
        pdf.heightOfString(row.value, {
          width,
          lineGap: valueStyle.lineGap
        }) + spacing.value;
    }

    return height;
  }

  _drawMetaRows(rows, compact, metaY, maxMetaY, tight = false) {
    const pdf = this.document.doc;
    const layout = this.document.layout;

    const x = layout.contentX;
    const width = layout.contentWidth;

    const labelStyle = this.document.styles.get("coverMetaLabel");
    const valueStyle = this.document.styles.get("coverMetaValue");

    const spacing = this._getMetaSpacing(compact, rows, tight);

    const setFont = (style) => {
      pdf.font(style.fontFamily).fontSize(style.fontSize);

      if (style.color) {
        pdf.fillColor(style.color);
      }
    };

    for (const row of rows) {
      if (compact) {
        const text = this._formatCompactMetaRow(row);

        setFont(valueStyle);

        pdf.text(text, x, metaY, {
          width,
          align: "center",
          lineGap: valueStyle.lineGap
        });

        metaY = pdf.y + spacing.value;
      } else {
        if (row.label) {
          setFont(labelStyle);

          const labelText = labelStyle.uppercase
            ? row.label.toUpperCase()
            : row.label;

          pdf.text(labelText, x, metaY, {
            width,
            align: "center"
          });

          metaY = pdf.y + spacing.label;
        }

        setFont(valueStyle);

        pdf.text(row.value, x, metaY, {
          width,
          align: "center",
          lineGap: valueStyle.lineGap
        });

        metaY = pdf.y + spacing.value;
      }

      if (metaY > maxMetaY) {
        throw new Error(
          "Cover page metadata rows do not fit on one page. " +
          "Reduce the number of cover metadata rows."
        );
      }
    }

    return metaY;
  }

  _drawLogo(logo, logoWidth, startY) {
    const pdf = this.document.doc;
    const layout = this.document.layout;

    const resolvedLogo = this._resolveLogo(logo);

    let image;

    try {
      image = pdf.openImage(resolvedLogo);
    } catch (error) {
      throw new Error(
        `Failed to open cover logo.\n` +
        `PDFKit error: ${error.message}`
      );
    }

    if (!image || !image.width || !image.height) {
      throw new Error(
        "Unable to read cover logo dimensions. " +
        "Only PNG and JPEG logos are supported."
      );
    }

    let width = image.width;
    let height = image.height;

    const ratio = height / width;

    if (Number.isFinite(logoWidth) && logoWidth > 0) {
      width = logoWidth;
      height = width * ratio;
    }

    const maxWidth = layout.contentWidth * 0.45;
    const maxHeight = 56;

    const scale = Math.min(
      maxWidth / width,
      maxHeight / height,
      1
    );

    width *= scale;
    height *= scale;

    const x =
      layout.contentX +
      (layout.contentWidth - width) / 2;

    pdf.image(resolvedLogo, x, startY, {
      width,
      height
    });

    return {
      y: startY,
      height
    };
  }

  _drawRule(y) {
    const pdf = this.document.doc;
    const layout = this.document.layout;
    const style = this.document.styles.get("coverRule");

    const ruleWidth = layout.contentWidth * style.widthRatio;

    const xStart =
      layout.contentX +
      (layout.contentWidth - ruleWidth) / 2;

    pdf.save();

    pdf.lineWidth(style.lineWidth);

    if (style.color) {
      pdf.strokeColor(style.color);
    }

    pdf.moveTo(xStart, y);
    pdf.lineTo(xStart + ruleWidth, y);
    pdf.stroke();

    pdf.restore();
  }
}

module.exports = CoverRenderer;