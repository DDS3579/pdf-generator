/**
 * Centralized typography and spacing rules for the engine.
 * This ensures consistent styling across all documents.
 */
class StyleRegistry {
    constructor() {
        this.styles = {
            paragraph: {
                fontFamily: "Serif-Regular",
                fontSize: 11,
                lineGap: 4,
                spacingAfter: 12,
                align: "justify",
                firstLineIndent: 0
            },

            h1: {
                fontFamily: "Serif-Regular",
                fontSize: 24,
                spacingBefore: 36,
                spacingAfter: 18,
                align: "left"
            },

            h2: {
                fontFamily: "Serif-Regular",
                fontSize: 18,
                spacingBefore: 28,
                spacingAfter: 12,
                align: "left"
            },

            h3: {
                fontFamily: "Serif-Regular",
                fontSize: 14,
                spacingBefore: 20,
                spacingAfter: 8,
                align: "left"
            },

            quote: {
                fontFamily: "Serif-Italic",
                fontSize: 11,
                lineGap: 4,
                spacingBefore: 16,
                spacingAfter: 16,
                leftIndent: 36,
                rightIndent: 36,
                align: "left"
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
                bulletMarker: "•"
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
                rowRuleWidth: 0.25
            },

            header: {
                fontFamily: "Serif-Regular",
                fontSize: 9,
                uppercase: true,
                ruleWidth: 0.5
            },

            footer: {
                fontFamily: "Serif-Regular",
                fontSize: 9,
                uppercase: false,
                ruleWidth: 0.5
            },

            coverOrganization: {
                fontFamily: "Serif-Regular",
                fontSize: 12,
                lineGap: 2,
                spacingAfter: 48,
                uppercase: true
            },

            coverTitle: {
                fontFamily: "Serif-Regular",
                fontSize: 28,
                lineGap: 6,
                spacingAfter: 18
            },

            coverSubtitle: {
                fontFamily: "Serif-Regular",
                fontSize: 14,
                lineGap: 4,
                spacingAfter: 30
            },

            coverMetaLabel: {
                fontFamily: "Serif-Regular",
                fontSize: 9,
                uppercase: true,
                spacingAfter: 6
            },

            coverMetaValue: {
                fontFamily: "Serif-Regular",
                fontSize: 12,
                lineGap: 3,
                spacingAfter: 24
            },

            coverDate: {
                fontFamily: "Serif-Regular",
                fontSize: 11
            },

            coverRule: {
                lineWidth: 0.75,
                widthRatio: 0.35
            }, 

            reference: {
                fontFamily: "Serif-Regular",
                fontSize: 10,
                lineGap: 3,
                align: "left",
                spacingBefore: 8,
                spacingAfter: 14,
                spacingAfterItem: 8,
                markerGap: 8
            },

            figure: {
                spacingBefore: 16,
                spacingAfter: 18,
                defaultWidthRatio: 0.75,
                align: "center",
                borderWidth: 0.5
            },

            caption: {
                fontFamily: "Serif-Regular",
                fontSize: 9.5,
                lineGap: 2,
                spacingBefore: 6,
                align: "center"
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