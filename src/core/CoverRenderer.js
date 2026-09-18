/**
 * CoverRenderer renders a formal cover page.
 *
 * The cover page is intentionally restrained:
 * centered text, generous whitespace, minimal rules.
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
      ...overrides,
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
    };

    this._draw(cover);
  }

  _draw(cover) {
    const pdf = this.document.doc;
    const layout = this.document.layout;
    const styles = this.document.styles;

    const x = layout.contentX;
    const width = layout.contentWidth;
    const pageHeight = layout.pageHeight;

    let y = pageHeight * 0.16;

    if (cover.organization) {
      const style = styles.get("coverOrganization");

      pdf.font(style.fontFamily).fontSize(style.fontSize);

      if (style.color) {
        pdf.fillColor(style.color);
      }

      const text = style.uppercase
        ? cover.organization.toUpperCase()
        : cover.organization;

      pdf.text(text, x, y, {
        width,
        align: "center",
        lineGap: style.lineGap,
      });

      y = pdf.y + style.spacingAfter;
    }

    const titleMinY = pageHeight * 0.3;
    y = Math.max(y, titleMinY);

    if (cover.title) {
      const style = styles.get("coverTitle");

      pdf.font(style.fontFamily).fontSize(style.fontSize);

      if (style.color) {
        pdf.fillColor(style.color);
      }

      pdf.text(cover.title, x, y, {
        width,
        align: "center",
        lineGap: style.lineGap,
      });

      y = pdf.y + style.spacingAfter;
    }

    if (cover.subtitle) {
      const style = styles.get("coverSubtitle");

      pdf.font(style.fontFamily).fontSize(style.fontSize);

      if (style.color) {
        pdf.fillColor(style.color);
      }

      pdf.text(cover.subtitle, x, y, {
        width,
        align: "center",
        lineGap: style.lineGap,
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
        pdf.font(labelStyle.fontFamily).fontSize(labelStyle.fontSize);

        if (labelStyle.color) {
          pdf.fillColor(labelStyle.color);
        }

        const labelText = labelStyle.uppercase
          ? cover.preparedByLabel.toUpperCase()
          : cover.preparedByLabel;

        pdf.text(labelText, x, metaY, {
          width,
          align: "center",
        });

        metaY = pdf.y + labelStyle.spacingAfter;
      }

      pdf.font(valueStyle.fontFamily).fontSize(valueStyle.fontSize);

      if (valueStyle.color) {
        pdf.fillColor(valueStyle.color);
      }

      pdf.text(cover.author, x, metaY, {
        width,
        align: "center",
        lineGap: valueStyle.lineGap,
      });

      metaY = pdf.y + valueStyle.spacingAfter;
    }

    if (cover.date) {
      const dateStyle = styles.get("coverDate");

      const dateMinY = pageHeight * 0.78;
      let dateY = Math.max(metaY, dateMinY);

      const maxSafeY = pageHeight - layout.margins.bottom;

      if (dateY > maxSafeY) {
        dateY = maxSafeY;
      }

      pdf.font(dateStyle.fontFamily).fontSize(dateStyle.fontSize);

      if (dateStyle.color) {
        pdf.fillColor(dateStyle.color);
      }

      pdf.text(cover.date, x, dateY, {
        width,
        align: "center",
      });
    }

    this.document._applyDefaultFont();
  }

  _drawRule(y) {
    const pdf = this.document.doc;
    const layout = this.document.layout;
    const style = this.document.styles.get("coverRule");

    const ruleWidth = layout.contentWidth * style.widthRatio;
    const xStart = layout.contentX + (layout.contentWidth - ruleWidth) / 2;

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
