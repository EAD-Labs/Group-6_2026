// @vitest-environment node
import { createRequire } from "node:module";
import { expect, it } from "vitest";
it("keeps ordinary tooling globs usable and rejects hostile nested brace patterns before recursion", () => {
  const root = createRequire(import.meta.url);
  const eslint = createRequire(root.resolve("eslint-config-next/core-web-vitals"));
  const plugin = createRequire(eslint.resolve("@next/eslint-plugin-next/package.json"));
  const glob = createRequire(plugin.resolve("fast-glob/package.json"));
  const match = createRequire(glob.resolve("micromatch/package.json"));
  const braces = match("braces");
  expect(braces("src/{app,components}/**/*.tsx", { expand: true })).toEqual(["src/app/**/*.tsx", "src/components/**/*.tsx"]);
  expect(() => braces("{".repeat(4000) + "a,b" + "}".repeat(4000))).toThrow("nesting exceeds the safe limit");
  expect(() => braces.parse("(".repeat(4000) + "a" + ")".repeat(4000))).toThrow("nesting exceeds the safe limit");
});
