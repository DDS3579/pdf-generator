/**
 * Centralized typography and spacing rules for the engine.
 * This ensures consistent styling across all documents.
 */

class StyleRegistry {
  constructor(themeManager) {
    const fallbackColors = {
      text: "#111111",
      heading: "#111111",
      muted: "#555555",
      accent: "#111111",
      rule: "#111111",
      border: "#111111",
      tableHeaderBg: null,
      tableZebraBg: null,
      calloutBg: "#f8f8f8",
      calloutBorder: "#cccccc",
      coverAccent: "#111111"
    };

    const themeColors =
      themeManager &&
      themeManager.resolved &&
      themeManager.resolved.colors
        ? themeManager.resolved.colors
        : {};

    const c = {
      ...fallbackColors,
      ...themeColors
    };

    this.styles = {
      paragraph: {
        fontFamily: "Serif-Regular",
        fontSize: 11,
        lineGap: 4,
        spacingAfter: 12,
        align: "justify",
        firstLineIndent: 0,
        color: c.text
      },

      h1: {
        fontFamily: "Serif-Regular",
        fontSize: 24,
        spacingBefore: 36,
        spacingAfter: 18,
        align: "left",
        color: c.heading
      },

      h2: {
        fontFamily: "Serif-Regular",
        fontSize: 18,
        spacingBefore: 28,
        spacingAfter: 12,
        align: "left",
        color: c.heading
      },

      h3: {
        fontFamily: "Serif-Regular",
        fontSize: 14,
        spacingBefore: 20,
        spacingAfter: 8,
        align: "left",
        color: c.heading
      },

      quote: {
        fontFamily: "Serif-Italic",
        fontSize: 11,
        lineGap: 4,
        spacingBefore: 16,
        spacingAfter: 16,
        leftIndent: 36,
        rightIndent: 36,
        align: "left",
        color: c.muted,
        borderColor: c.accent
      },

      list: {
        fontFamily: "Serif-Regular",
        fontSize: 11,
        lineGap: 4,
        align: "left",
        spacingBefore: 8,
        spacingAfter: 14,
        spacingAfterItem: 6,
        leftIndent: 18,
        nestedIndent: 18,
        markerGap: 8,
        bulletMarker: "•",
        color: c.text,
        markerColor: c.accent
      },

      table: {
        cellFontFamily: "Serif-Regular",
        cellFontSize: 10,
        headerFontFamily: "Serif-Regular",
        headerFontSize: 10,
        lineGap: 3,
        cellPaddingX: 8,
        cellPaddingY: 6,
        spacingBefore: 12,
        spacingAfter: 16,
        align: "left",
        rowRules: false,
        topRuleWidth: 1,
        headerRuleWidth: 0.75,
        bottomRuleWidth: 1,
        rowRuleWidth: 0.25,
        cellColor: c.text,
        headerColor: c.heading,
        ruleColor: c.rule,
        headerBgColor: c.tableHeaderBg,
        zebraBgColor: c.tableZebraBg
      },

      header: {
        fontFamily: "Serif-Regular",
        fontSize: 9,
        uppercase: true,
        ruleWidth: 0.5,
        color: c.muted,
        ruleColor: c.rule
      },

      footer: {
        fontFamily: "Serif-Regular",
        fontSize: 9,
        uppercase: false,
        ruleWidth: 0.5,
        color: c.muted,
        ruleColor: c.rule
      },

      coverOrganization: {
        fontFamily: "Serif-Regular",
        fontSize: 12,
        lineGap: 2,
        spacingAfter: 48,
        uppercase: true,
        color: c.muted
      },

      coverTitle: {
        fontFamily: "Serif-Regular",
        fontSize: 28,
        lineGap: 6,
        spacingAfter: 18,
        color: c.heading
      },

      coverSubtitle: {
        fontFamily: "Serif-Regular",
        fontSize: 14,
        lineGap: 4,
        spacingAfter: 30,
        color: c.muted
      },

      coverMetaLabel: {
        fontFamily: "Serif-Regular",
        fontSize: 9,
        uppercase: true,
        spacingAfter: 6,
        color: c.muted
      },

      coverMetaValue: {
        fontFamily: "Serif-Regular",
        fontSize: 12,
        lineGap: 3,
        spacingAfter: 24,
        color: c.text
      },

      coverDate: {
        fontFamily: "Serif-Regular",
        fontSize: 11,
        color: c.muted
      },

      coverRule: {
        lineWidth: 0.75,
        widthRatio: 0.35,
        color: c.coverAccent
      },

      reference: {
        fontFamily: "Serif-Regular",
        fontSize: 10,
        lineGap: 3,
        align: "left",
        spacingBefore: 8,
        spacingAfter: 14,
        spacingAfterItem: 8,
        markerGap: 8,
        color: c.text,
        markerColor: c.muted
      },

      figure: {
        spacingBefore: 16,
        spacingAfter: 18,
        defaultWidthRatio: 0.75,
        align: "center",
        borderWidth: 0.5,
        borderColor: c.border
      },

      caption: {
        fontFamily: "Serif-Regular",
        fontSize: 9.5,
        lineGap: 2,
        spacingBefore: 6,
        align: "center",
        color: c.muted
      },

      divider: {
        lineWidth: 0.75,
        spacingBefore: 12,
        spacingAfter: 12,
        widthRatio: 1,
        align: "center",
        color: c.rule
      },

      callout: {
        fontFamily: "Serif-Regular",
        fontSize: 10.5,
        lineGap: 4,
        spacingBefore: 14,
        spacingAfter: 16,
        paddingX: 12,
        paddingY: 10,
        accentWidth: 3,
        titleFontSize: 11.5,
        titleSpacingAfter: 6,
        color: c.text,
        titleColor: c.heading,
        background: c.calloutBg || "#f8f8f8",
        border: c.calloutBorder || "#cccccc",
        accent: c.accent
      },

      tableCaption: {
        fontFamily: "Serif-Regular",
        fontSize: 9.5,
        lineGap: 2,
        spacingBefore: 0,
        spacingAfter: 8,
        align: "center",
        color: c.muted
      }
    };
  }

  get(styleName) {
    const style = this.styles[styleName];

    if (!style) {
      throw new Error(`Unknown style: ${styleName}`);
    }

    return style;
  }
}

module.exports = StyleRegistry;