/**
 * ListRenderer handles bulleted and numbered lists.
 *
 * Supported item formats:
 * - "Simple string item"
 * - { text: "Item text", children: [...] }
 */

class ListRenderer {
  constructor(formalDocument) {
    this.document = formalDocument;
  }

  bullets(items, options = {}) {
    return this.render(items, {
      ...options,
      ordered: false
    });
  }

  numbered(items, options = {}) {
    return this.render(items, {
      ...options,
      ordered: true
    });
  }

  render(items, options = {}) {
    if (!Array.isArray(items)) {
      throw new Error("List items must be an array.");
    }

    if (items.length === 0) {
      return this.document;
    }

    const ordered = Boolean(options.ordered);

    const start = Number.isInteger(options.start)
      ? options.start
      : 1;

    if (ordered && (!Number.isInteger(start) || start < 1)) {
      throw new Error(
        "options.start must be a positive integer for numbered lists."
      );
    }

    const style = this.document.styles.get("list");
    const pdf = this.document.doc;

    const nodes = this._flatten(items, {
      level: 0,
      ordered,
      start
    });

    if (
      style.spacingBefore > 0 &&
      this.document.layout.currentY > this.document.layout.margins.top
    ) {
      this.document.layout.moveDown(style.spacingBefore);
    }

    pdf.font(style.fontFamily).fontSize(style.fontSize);

    if (style.color) {
      pdf.fillColor(style.color);
    }

    let orderedMarkerWidth = 0;

    if (ordered) {
      const lastNumber = start + items.length - 1;
      orderedMarkerWidth = pdf.widthOfString(`${lastNumber}.`);
    }

    nodes.forEach((node, index) => {
      this._renderNode(node, style, orderedMarkerWidth);

      const isLast = index === nodes.length - 1;

      if (!isLast) {
        this.document.layout.moveDown(style.spacingAfterItem);
      }
    });

    this.document.layout.moveDown(style.spacingAfter);
    this.document._applyDefaultFont();

    return this.document;
  }

  _flatten(items, context, path = "items") {
    const nodes = [];
    let counter = context.start;

    items.forEach((item, index) => {
      const itemPath = `${path}[${index}]`;

      let text;
      let children;

      if (typeof item === "string") {
        text = item;
      } else if (item && typeof item === "object") {
        if (typeof item.text !== "string") {
          throw new Error(
            `List item ${itemPath} must have a string "text" property.`
          );
        }

        text = item.text;
        children = item.children;
      } else {
        throw new Error(
          `Invalid list item at ${itemPath}. ` +
          `Expected a string or an object with a "text" property.`
        );
      }

      if (text.trim().length === 0) {
        throw new Error(
          `List item ${itemPath} cannot be empty.`
        );
      }

      nodes.push({
        text,
        level: context.level,
        ordered: context.ordered,
        marker: context.ordered ? `${counter}.` : null
      });

      if (children !== undefined) {
        if (!Array.isArray(children)) {
          throw new Error(
            `List item ${itemPath}.children must be an array.`
          );
        }

        const childNodes = this._flatten(
          children,
          {
            level: context.level + 1,
            ordered: false,
            start: 1
          },
          `${itemPath}.children`
        );

        nodes.push(...childNodes);
      }

      counter += 1;
    });

    return nodes;
  }

  _renderNode(node, style, orderedMarkerWidth) {
    const layout = this.document.layout;
    const pdf = this.document.doc;

    const levelIndent = style.leftIndent + node.level * style.nestedIndent;
    const markerX = layout.contentX + levelIndent;

    const markerSpace = node.ordered
      ? orderedMarkerWidth + style.markerGap
      : style.markerGap;

    const textX = markerX + markerSpace;
    const textWidth = layout.contentWidth - levelIndent - markerSpace;

    if (textWidth <= 0) {
      throw new Error(
        "List indentation leaves no available width for list text."
      );
    }

    pdf.font(style.fontFamily).fontSize(style.fontSize);

    const requiredHeight = pdf.heightOfString(node.text, {
      width: textWidth,
      lineGap: style.lineGap
    });

    layout.checkSpace(requiredHeight);

    const y = layout.currentY;

    pdf.font(style.fontFamily).fontSize(style.fontSize);

    if (node.ordered) {
      if (style.markerColor) {
        pdf.fillColor(style.markerColor);
      }

      const markerTextWidth = pdf.widthOfString(node.marker);

      const markerDrawX = markerX + orderedMarkerWidth - markerTextWidth;

      pdf.text(node.marker, markerDrawX, y, {
        lineBreak: false
      });
    } else {
      if (style.markerColor) {
        pdf.fillColor(style.markerColor);
      }

      pdf.text(style.bulletMarker, markerX, y, {
        lineBreak: false
      });
    }

    if (style.color) {
      pdf.fillColor(style.color);
    }

    pdf.text(node.text, textX, y, {
      width: textWidth,
      align: style.align,
      lineGap: style.lineGap
    });

    layout.currentY = pdf.y;
  }
}

module.exports = ListRenderer;