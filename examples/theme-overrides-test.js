const FormalDocument = require("../src/core/FormalDocument");
const {
  createPlaceholderPng
} = require("../src/utils/createPlaceholderPng");

const doc = new FormalDocument({
  title: "Theme Override Test",
  subtitle: "Style Override Validation",
  author: "Engineering Team",
  organization: "Formal Document Engine",
  date: "August 2026",

  theme: {
    base: "modern",
    colors: {
      accent: "#7c3aed"
    }
  },

  styles: {
    h1: {
      fontSize: 26
    },
    paragraph: {
      fontSize: 11.5
    },
    table: {
      zebraBgColor: "#f5f3ff"
    },
    callout: {
      accentWidth: 4
    }
  },

  header: {
    left: "{organization}",
    right: "{date}"
  },

  footer: {
    left: "{title}",
    right: "Page {page} of {totalPages}"
  }
});

doc.cover();

doc.heading(1, "Theme Override Test");

doc.paragraph(
  "This document tests theme presets, custom theme colors, and user style overrides. " +
  "The base theme is modern, but the accent color has been overridden to purple."
);

doc.spacer(16);

doc.divider();

doc.heading(2, "1. Callout Test");

doc.callout(
  "This callout uses the modern theme callout colors, but the global accent color has been overridden.",
  {
    title: "Theme Override",
    type: "info"
  }
);

doc.heading(2, "2. Table Test");

doc.table({
  caption: "Theme override validation",
  headers: ["Area", "Status"],
  rows: [
    ["Theme preset", "Working"],
    ["Custom theme color", "Working"],
    ["Style overrides", "Working"],
    ["Zebra override", "Working"]
  ],
  columnWidths: [3, 2],
  zebra: true
});

doc.heading(2, "3. Figure Test");

doc.figure(createPlaceholderPng(520, 280), {
  caption: "Placeholder figure with themed border color.",
  width: "70%",
  border: true
});

doc.save("output/theme-overrides-test.pdf");