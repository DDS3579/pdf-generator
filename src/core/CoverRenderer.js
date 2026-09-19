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
      ...overrides
    };

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

    const ruleMinY = pageHeight * 0.58;
    const ruleY = Math.max(y + 12, ruleMinY);

    this._drawRule(ruleY);

    let metaY = Math.max(pageHeight * 0.68, ruleY + 36);

    if (cover.author) {
      const labelStyle = styles.get("coverMetaLabel");
      const valueStyle = styles.get("coverMetaValue");

      if (cover.preparedByLabel) {
        setFont(labelStyle);

        const labelText = labelStyle.uppercase
          ? cover.preparedByLabel.toUpperCase()
          : cover.preparedByLabel;

        pdf.text(labelText, x, metaY, {
          width,
          align: "center"
        });

        metaY = pdf.y + labelStyle.spacingAfter;
      }

      setFont(valueStyle);

      pdf.text(cover.author, x, metaY, {
        width,
        align: "center",
        lineGap: valueStyle.lineGap
      });

      metaY = pdf.y + valueStyle.spacingAfter;
    }

    if (cover.meta.length > 0) {
      const labelStyle = styles.get("coverMetaLabel");
      const valueStyle = styles.get("coverMetaValue");

      const maxMetaY =
        pageHeight - layout.margins.bottom - 48;

      for (const row of cover.meta) {
        let requiredHeight = 0;
        let labelText = "";

        if (row.label) {
          setFont(labelStyle);

          labelText = labelStyle.uppercase
            ? row.label.toUpperCase()
            : row.label;

          requiredHeight +=
            pdf.heightOfString(labelText, {
              width
            }) + labelStyle.spacingAfter;
        }

        setFont(valueStyle);

        requiredHeight +=
          pdf.heightOfString(row.value, {
            width,
            lineGap: valueStyle.lineGap
          }) + valueStyle.spacingAfter;

        if (metaY + requiredHeight > maxMetaY) {
          throw new Error(
            "Cover page metadata rows do not fit on one page. " +
            "Reduce the number of cover metadata rows."
          );
        }

        if (row.label) {
          setFont(labelStyle);

          pdf.text(labelText, x, metaY, {
            width,
            align: "center"
          });

          metaY = pdf.y + labelStyle.spacingAfter;
        }

        setFont(valueStyle);

        pdf.text(row.value, x, metaY, {
          width,
          align: "center",
          lineGap: valueStyle.lineGap
        });

        metaY = pdf.y + valueStyle.spacingAfter;
      }
    }

    if (cover.date) {
      const dateStyle = styles.get("coverDate");

      const dateMinY = pageHeight * 0.78;
      let dateY = Math.max(metaY, dateMinY);

      const maxSafeY =
        pageHeight - layout.margins.bottom - dateStyle.fontSize;

      if (dateY > maxSafeY) {
        dateY = maxSafeY;
      }

      setFont(dateStyle);

      pdf.text(cover.date, x, dateY, {
        width,
        align: "center"
      });
    }

    this.document._applyDefaultFont();
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