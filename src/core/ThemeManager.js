/**
 * ThemeManager handles color validation, theme presets, and style merging.
 */

const HEX_REGEX = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i;

function isValidColor(color) {
  if (typeof color !== "string") return false;
  if (HEX_REGEX.test(color)) return true;
  return false;
}

function normalizeColor(color) {
  if (!color) return null;
  if (color.startsWith("#") && color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  return color;
}

const PRESETS = {
  formal: {
    colors: {
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
      coverAccent: "#111111",
    },
  },
  modern: {
    colors: {
      text: "#1f2937",
      heading: "#111827",
      muted: "#6b7280",
      accent: "#2563eb",
      rule: "#d1d5db",
      border: "#e5e7eb",
      tableHeaderBg: "#f3f4f6",
      tableZebraBg: "#f9fafb",
      calloutBg: "#eff6ff",
      calloutBorder: "#bfdbfe",
      coverAccent: "#2563eb",
    },
  },
  corporate: {
    colors: {
      text: "#0f172a",
      heading: "#0f172a",
      muted: "#475569",
      accent: "#0369a1",
      rule: "#cbd5e1",
      border: "#e2e8f0",
      tableHeaderBg: "#f1f5f9",
      tableZebraBg: "#f8fafc",
      calloutBg: "#f0f9ff",
      calloutBorder: "#bae6fd",
      coverAccent: "#0369a1",
    },
  },
  academic: {
    colors: {
      text: "#000000",
      heading: "#000000",
      muted: "#333333",
      accent: "#800000",
      rule: "#000000",
      border: "#000000",
      tableHeaderBg: null,
      tableZebraBg: null,
      calloutBg: "#fcfcfc",
      calloutBorder: "#800000",
      coverAccent: "#800000",
    },
  },
  minimal: {
    colors: {
      text: "#333333",
      heading: "#000000",
      muted: "#777777",
      accent: "#555555",
      rule: "#cccccc",
      border: "#cccccc",
      tableHeaderBg: null,
      tableZebraBg: null,
      calloutBg: "#fafafa",
      calloutBorder: "#cccccc",
      coverAccent: "#333333",
    },
  },
};

class ThemeManager {
  constructor(themeOption) {
    this.resolved = this._resolve(themeOption);
  }

  _resolve(themeOption) {
    let basePreset = PRESETS.formal;
    let userColors = {};

    if (typeof themeOption === "string") {
      if (!PRESETS[themeOption]) {
        throw new Error(
          `Unknown theme preset: "${themeOption}". ` +
            `Valid presets: ${Object.keys(PRESETS).join(", ")}`,
        );
      }
      basePreset = PRESETS[themeOption];
    } else if (themeOption && typeof themeOption === "object") {
      if (themeOption.base && PRESETS[themeOption.base]) {
        basePreset = PRESETS[themeOption.base];
      }
      if (themeOption.colors && typeof themeOption.colors === "object") {
        userColors = themeOption.colors;
      }
    }

    const mergedColors = { ...basePreset.colors };

    for (const [key, value] of Object.entries(userColors)) {
      if (value === null || value === "transparent") {
        mergedColors[key] = null;
      } else if (typeof value === "string") {
        if (!isValidColor(value)) {
          throw new Error(
            `Invalid color value for "${key}": "${value}". ` +
              `Expected hex color (e.g., #1f2937).`,
          );
        }
        mergedColors[key] = normalizeColor(value);
      }
    }

    return { colors: mergedColors };
  }

  color(key) {
    return this.resolved.colors[key] || "#000000";
  }
}

module.exports = {
  ThemeManager,
  PRESETS,
  isValidColor,
  normalizeColor,
};
