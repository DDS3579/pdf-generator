/**
 * Centralized typography and spacing rules for the engine.
 * This ensures consistent styling across all documents.
 */
class StyleRegistry {
    constructor() {
        this.styles = {
            paragraph: {
                fontFamily: 'Serif-Regular',
                fontSize: 11,
                lineGap: 4,
                spacingAfter: 12,
                align: 'justify',
                firstLineIndent: 0 // Set to 18 if you prefer academic indented paragraphs
            },
            h1: {
                fontFamily: 'Serif-Regular', 
                fontSize: 24,
                spacingBefore: 36,
                spacingAfter: 18,
                align: 'left'
            },
            h2: {
                fontFamily: 'Serif-Regular',
                fontSize: 18,
                spacingBefore: 28,
                spacingAfter: 12,
                align: 'left'
            },
            h3: {
                fontFamily: 'Serif-Regular',
                fontSize: 14,
                spacingBefore: 20,
                spacingAfter: 8,
                align: 'left'
            },
            quote: {
                fontFamily: 'Serif-Italic',
                fontSize: 11,
                lineGap: 4,
                spacingBefore: 16,
                spacingAfter: 16,
                leftIndent: 36,
                rightIndent: 36,
                align: 'left'
            }
        };
    }

    get(styleName) {
        const style = this.styles[styleName];
        if (!style) throw new Error(`Unknown style: ${styleName}`);
        return style;
    }
}

module.exports = StyleRegistry;