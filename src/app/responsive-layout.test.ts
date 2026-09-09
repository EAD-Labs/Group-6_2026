import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const stylesheetPath = resolve(process.cwd(), "src/app/globals.css");
const stylesheet = readFileSync(stylesheetPath, "utf8");

describe("responsive layout contract", () => {
  it("supports a 320 pixel minimum viewport", () => {
    expect(stylesheet).toMatch(/html\s*{[\s\S]*?min-width:\s*320px/);
  });

  it("uses a two-column desktop learning grid", () => {
    expect(stylesheet).toMatch(
      /\.module-grid\s*{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
    );
  });

  it("collapses learning and feedback grids at the mobile breakpoint", () => {
    expect(stylesheet).toMatch(
      /@media\s*\(max-width:\s*720px\)[\s\S]*?\.dashboard-grid,[\s\S]*?\.review-grid[\s\S]*?grid-template-columns:\s*1fr/,
    );
  });

  it("provides touch-sized controls and labelled mobile navigation", () => {
    expect(stylesheet).toMatch(/\.button\s*{[\s\S]*?min-height:\s*48px/);
    expect(stylesheet).toMatch(
      /\.bottom-navigation\s*{[\s\S]*?display:\s*none/,
    );
    expect(stylesheet).toMatch(
      /@media\s*\(max-width:\s*720px\)[\s\S]*?\.bottom-navigation\s*{[\s\S]*?display:\s*grid/,
    );
  });

  it("includes visible keyboard focus and reduced-motion handling", () => {
    expect(stylesheet).toMatch(/:focus-visible\s*{/);
    expect(stylesheet).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });
});
