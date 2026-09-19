const test = require("node:test");
const assert = require("node:assert/strict");

const StyleRegistry = require("../src/core/StyleRegistry");
const { ThemeManager } = require("../src/core/ThemeManager");

test("formal theme uses default formal colors", () => {
  const theme = new ThemeManager("formal");
  const styles = new StyleRegistry(theme);

  assert.equal(styles.get("paragraph").color, "#111111");
  assert.equal(styles.get("h1").color, "#111111");
  assert.equal(styles.get("table").headerBgColor, null);
});

test("modern theme changes base colors", () => {
  const theme = new ThemeManager("modern");
  const styles = new StyleRegistry(theme);

  assert.equal(styles.get("paragraph").color, "#1f2937");
  assert.equal(styles.get("h1").color, "#111827");
  assert.equal(styles.get("table").headerBgColor, "#f3f4f6");
  assert.equal(styles.get("table").zebraBgColor, "#f9fafb");
});

test("custom theme colors override preset colors", () => {
  const theme = new ThemeManager({
    base: "formal",
    colors: {
      accent: "#ff0000"
    }
  });

  const styles = new StyleRegistry(theme);

  assert.equal(styles.get("list").markerColor, "#ff0000");
});

test("user style overrides are applied", () => {
  const styles = new StyleRegistry(null, {
    h1: {
      fontSize: 30,
      color: "#222222"
    },
    paragraph: {
      fontSize: 12,
      align: "left"
    }
  });

  assert.equal(styles.get("h1").fontSize, 30);
  assert.equal(styles.get("h1").color, "#222222");
  assert.equal(styles.get("paragraph").fontSize, 12);
  assert.equal(styles.get("paragraph").align, "left");
});

test("short hex colors are normalized", () => {
  const styles = new StyleRegistry(null, {
    paragraph: {
      color: "#abc"
    }
  });

  assert.equal(styles.get("paragraph").color, "#aabbcc");
});

test("invalid theme preset throws", () => {
  assert.throws(
    () => new ThemeManager("not-a-theme"),
    /Unknown theme preset/i
  );
});

test("invalid color override throws", () => {
  assert.throws(
    () =>
      new StyleRegistry(null, {
        paragraph: {
          color: "not-a-color"
        }
      }),
    /Invalid color/i
  );
});

test("unknown style override throws", () => {
  assert.throws(
    () =>
      new StyleRegistry(null, {
        fakeStyle: {
          fontSize: 12
        }
      }),
    /Unknown style override/i
  );
});

test("unknown style property throws", () => {
  assert.throws(
    () =>
      new StyleRegistry(null, {
        paragraph: {
          fakeProperty: 12
        }
      }),
    /Unknown style property/i
  );
});