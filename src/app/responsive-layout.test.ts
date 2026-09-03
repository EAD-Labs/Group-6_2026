import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const stylesheetPath = resolve(process.cwd(), "src/app/globals.css");
const stylesheet = readFileSync(stylesheetPath, "utf8");

describe("responsive layout contract", () => {
  it("supports a 320 pixel minimum viewport", () => {
    expect(stylesheet).toMatch(/html\s*{[\s\S]*?min-width:\s*320px/);
  });

  it("uses a three-column desktop feature grid", () => {
    expect(stylesheet).toMatch(
      /\.feature-grid\s*{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/,
    );
  });

  it("collapses the feature grid at the mobile breakpoint", () => {
    expect(stylesheet).toMatch(
      /@media\s*\(max-width:\s*720px\)[\s\S]*?\.feature-grid\s*{[\s\S]*?grid-template-columns:\s*1fr/,
    );
  });

  it("provides mobile-width primary actions and touch-sized controls", () => {
    expect(stylesheet).toMatch(/\.button\s*{[\s\S]*?min-height:\s*48px/);
    expect(stylesheet).toMatch(
      /@media\s*\(max-width:\s*720px\)[\s\S]*?\.button\s*{[\s\S]*?width:\s*100%/,
    );
  });

  it("includes visible keyboard focus and reduced-motion handling", () => {
    expect(stylesheet).toMatch(/:focus-visible\s*{/);
    expect(stylesheet).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });
});
