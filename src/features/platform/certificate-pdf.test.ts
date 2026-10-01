// @vitest-environment node
import { readFile } from "node:fs/promises";
import { beforeAll, describe, expect, it } from "vitest";
import { decodePDFRawStream, PDFArray, PDFDocument, PDFHexString, PDFName, PDFRawStream } from "pdf-lib";
import { buildCertificatePdf, certificateNameLayout, CertificateNameError, type CertificateFonts, type CertificateRecord } from "./certificate-pdf";

let fonts: CertificateFonts;
const record: CertificateRecord = { id: "00000000-0000-4000-8000-000000000000", participant_name: "Sample Teacher", issued_at: "2026-10-01T00:00:00Z", rule_version: "SAMPLE-RENDER-CHECK", revoked_at: null };
beforeAll(async () => {
  const [latin, devanagari] = await Promise.all(["NotoSans-Regular.ttf", "NotoSansDevanagari-Regular.ttf"].map((font) => readFile(`public/fonts/${font}`)));
  fonts = { latin, devanagari };
});

async function content(document: PDFDocument) {
  const streams = document.getPage(0).node.lookup(PDFName.of("Contents"), PDFArray);
  return streams.asArray().map((ref) => {
    const stream = document.context.lookup(ref);
    if (!(stream instanceof PDFRawStream)) throw new Error("Expected PDF content stream");
    return Buffer.from(decodePDFRawStream(stream).decode()).toString("utf8");
  }).join("\n");
}

describe("certificate PDFs", () => {
  it.each(["Sample Teacher Alexandra Morgan", "साक्षी त्रिवेदी", "Dr. मीरा शर्मा (Sample)", "Alexandra Catherine Elizabeth Frances Genevieve Helena Isabelle Josephine Katherine Louise Margaret Natalia Ophelia"])("embeds a selectable, intact name: %s", async (name) => {
    const bytes = await buildCertificatePdf({ ...record, participant_name: name }, fonts, "https://example.invalid/verify/sample");
    const document = await PDFDocument.load(bytes);
    expect(document.getPages()).toHaveLength(1);
    expect(document.getPage(0).getSize()).toEqual({ width: 842, height: 595 });
    expect(document.getTitle()).toBe(`PromptShala - ${name}`);
    const operators = await content(document);
    expect(operators).toContain(`/ActualText ${PDFHexString.fromText(name).toString()}`);
    expect(operators).not.toContain("<0000> Tj"); // No .notdef glyph boxes.
    expect(operators.match(/BDC/g)).toHaveLength(1);
    expect(operators.match(/EMC/g)).toHaveLength(1);
    expect(document.catalog.has(PDFName.of("OpenAction"))).toBe(false);
    expect(document.catalog.has(PDFName.of("Names"))).toBe(false); // No embedded files or JavaScript.
  });
  it("keeps a maximum-length unbroken name readable and inside the name area", () => {
    const layout = certificateNameLayout("W".repeat(120), fonts);
    expect(layout.lines).toHaveLength(3);
    expect(layout.lines.join("")).toBe("W".repeat(120));
    expect(layout.size).toBeGreaterThanOrEqual(18);
    for (const line of layout.lines) expect(layout.fonts[0].layout(line).advanceWidth / layout.fonts[0].unitsPerEm * layout.size).toBeLessThanOrEqual(680.01);
  });
  it("does not serialize private account data accidentally passed by the caller", async () => {
    const extended = { ...record, participant_id: "PRIVATE-ACCOUNT-ID", email: "private@example.invalid", evidence_summary: { notes: "PRIVATE-TEACHER-NOTES" } };
    const document = await PDFDocument.load(await buildCertificatePdf(extended, fonts, "https://example.invalid/verify/sample"));
    const decoded = document.context.enumerateIndirectObjects().map(([, object]) => object instanceof PDFRawStream ? Buffer.from(decodePDFRawStream(object).decode()).toString("utf8") : object.toString()).join("\n");
    for (const secret of [extended.participant_id, extended.email, extended.evidence_summary.notes]) expect(decoded).not.toContain(secret);
    expect(document.getAuthor()).toBe("PromptShala");
  });
  it.each(["", "W".repeat(121), "Teacher\u202eName", "শিক্ষক"])("rejects unsafe or unsupported names without generating broken text: %s", (name) => {
    expect(() => certificateNameLayout(name, fonts)).toThrow(CertificateNameError);
  });
  it("refuses revoked records and invalid issue dates", async () => {
    await expect(buildCertificatePdf({ ...record, revoked_at: "2026-10-02" }, fonts, "https://example.invalid")).rejects.toThrow(/revoked/);
    await expect(buildCertificatePdf({ ...record, issued_at: "invalid" }, fonts, "https://example.invalid")).rejects.toThrow(/issue date/);
  });
});
