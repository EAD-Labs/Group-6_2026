/**
 * Capture two actual public visitor states as vector PDF fragments.
 *
 * Run from app/ with the bundled Node runtime. Requires Chromium installed by
 * the project's @playwright/test dependency and Python with pypdf.
 * This uses only public, local-in-browser interactions; no sign-in or AI calls.
 * The live application's content/styles are not edited for the capture.
 */
import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "artifacts/final-presentation");
const scratch = path.join(root, "tmp/pdfs/poster-vector");
const baseUrl = process.env.POSTER_CAPTURE_URL ?? "https://promptshala.vercel.app";
const python = process.env.POSTER_PYTHON ?? "python3";
await mkdir(output, { recursive: true });
await mkdir(scratch, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 2,
});
await page.emulateMedia({ media: "screen", reducedMotion: "reduce" });
const captures = [];

async function capture(name) {
  await page.evaluate(() => document.fonts.ready);
  const workspace = page.locator(".visitor-workspace");
  await expect(workspace).toBeVisible();
  // Playwright waits for the visible element to settle before capturing it.
  // Measure after that settling point so React/font layout cannot change the
  // final crop boundary between checking the state and printing the page.
  await workspace.screenshot({ path: path.join(scratch, `${name}-browser.png`) });
  await page.evaluate(() => window.scrollTo(0, 0));
  const box = await workspace.boundingBox();
  if (!box) throw new Error("Visitor workspace has no bounding rectangle.");
  const pageHeight = await page.evaluate(() =>
    Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
  );
  const full = path.join(scratch, `${name}-full.pdf`);
  await page.pdf({
    path: full,
    width: "1440px",
    // Chromium may paginate a fractional bottom border onto a blank second
    // page when paper height equals rounded scrollHeight exactly.
    height: `${pageHeight + 8}px`,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    printBackground: true,
    scale: 1,
    preferCSSPageSize: false,
    displayHeaderFooter: false,
  });
  const destination = path.join(output, `${name}-vector.pdf`);
  const command = spawnSync(python, ["-c", `
import json, sys
from pypdf import PdfReader, PdfWriter, Transformation
from pypdf.generic import RectangleObject, NameObject, ContentStream
source, dest, raw_box = sys.argv[1:]
box = json.loads(raw_box)
reader = PdfReader(source)
page = reader.pages[0]
factor = 72 / 96
x = box["x"] * factor
y = float(page.mediabox.height) - (box["y"] + box["height"]) * factor
w, h = box["width"] * factor, box["height"] * factor
assert y >= 0 and x >= 0 and x+w <= float(page.mediabox.width), "Workspace must be fully contained on the first page"
page.cropbox = RectangleObject((x, y, x+w, y+h))
page.trimbox = RectangleObject((x, y, x+w, y+h))
writer = PdfWriter()
target = writer.add_blank_page(width=w, height=h)
target.merge_transformed_page(page, Transformation().translate(-x, -y))
target.pop(NameObject("/Annots"), None)
# The source-page header's raster wordmark is wholly above the crop. Remove
# its unused drawing and resource, retaining all visible UI and its shadows.
xobjects = target["/Resources"].get("/XObject", {})
hidden_wordmarks = {
    name for name, reference in xobjects.items()
    if reference.get_object().get("/Subtype") == "/Image"
    and reference.get_object().get("/Width") == 2172
    and reference.get_object().get("/Height") == 724
}
if hidden_wordmarks:
    contents = ContentStream(target.get_contents(), writer)
    contents.operations = [
        (operands, operator) for operands, operator in contents.operations
        if not (operator == b"Do" and operands[0] in hidden_wordmarks)
    ]
    target.replace_contents(contents)
    for name in hidden_wordmarks:
        del xobjects[name]
# Chromium's macOS Type 3 font boxes can have reversed vertical corners and
# omit the origin used by an empty space glyph. Include every declared glyph
# box without changing any glyph path, advance width or transform.
for reference in target["/Resources"]["/Font"].values():
    font = reference.get_object()
    if font.get("/Subtype") == "/Type3":
        x0, y0, x1, y1 = font["/FontBBox"]
        xs, ys = [x0, x1], [y0, y1]
        for glyph in font["/CharProcs"].values():
            for operands, operator in ContentStream(glyph.get_object(), writer).operations:
                if operator == b"d1":
                    xs.extend((operands[2], operands[4]))
                    ys.extend((operands[3], operands[5]))
        font[NameObject("/FontBBox")] = RectangleObject((
            min(xs), min(ys), max(xs), max(ys)
        ))
writer.add_metadata({
    "/Title": "PromptShala - actual public visitor interface",
    "/Subject": "Vector capture of browser screen media; fictional classroom material",
    "/Creator": "Chromium and pypdf",
})
writer.compress_identical_objects(remove_identicals=True, remove_orphans=True)
with open(dest, "wb") as stream:
    writer.write(stream)
print(json.dumps({"widthPt":w,"heightPt":h}))
`, full, destination, JSON.stringify(box)], { encoding: "utf8" });
  if (command.status !== 0) throw new Error(command.stderr || command.stdout);
  captures.push({
    name, file: path.relative(root, destination),
    rectangleCssPx: box, ...JSON.parse(command.stdout),
  });
}

try {
  await page.goto(`${baseUrl}/try`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Try a clearer example" }).click();
  await page.getByRole("textbox", { name: "Your request", exact: true }).fill(
    "Act as a science teacher. For Class 6 learners who know that water can change state, write a 15-minute activity on evaporation. Use two numbered observation steps, three discussion questions and a short answer guide. Use only the source I provide; flag missing information. Keep the language simple and offer a spoken-answer option."
  );
  await page.getByRole("button", { name: "Check my request" }).click();
  await expect(page.getByRole("status")).toContainText("Checklist signals");
  await capture("clear-request");
  await page.getByRole("button", { name: "Next: prepare a draft" }).click();
  await page.getByRole("button", { name: "Prepare my draft" }).click();
  await expect(page.getByLabel("Make it right for your learners")).toHaveValue(/\[S1\]/);
  await capture("source-draft");
  await writeFile(path.join(output, "vector-capture.json"), JSON.stringify({
    capturedAt: new Date().toISOString(),
    url: `${baseUrl}/try`,
    method: "Unmodified live browser UI rendered as screen-media PDFs, cropped to .visitor-workspace",
    fictionalMaterial: true,
    personalData: false,
    applicationWrites: false,
    providerCalls: false,
    viewportCssPx: { width: 1440, height: 1100 },
    sourceScript: "scripts/capture-poster-vector.mjs",
    captures,
  }, null, 2) + "\n");
  console.log(JSON.stringify({ captures }, null, 2));
} finally {
  await browser.close();
}
