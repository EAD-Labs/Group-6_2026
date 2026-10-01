import "regenerator-runtime/runtime.js";
import {
  beginText, endText, PDFDocument, PDFHexString, PDFName, PDFOperator, PDFOperatorNames,
  popGraphicsState, pushGraphicsState, rgb, setFillingRgbColor, setFontAndSize, setTextMatrix, showText, StandardFonts,
} from "pdf-lib";
import fontkit, { type Font } from "@pdf-lib/fontkit";

export type CertificateRecord = {id:string;participant_name:string;issued_at:string;rule_version:string;revoked_at:string|null};
export type CertificateFonts = { latin: Uint8Array; devanagari: Uint8Array };
export class CertificateNameError extends Error {}

type NameRun = { text: string; font: Font; fontIndex: number };
function nameRuns(text: string, fonts: Font[]): NameRun[] {
  const runs: NameRun[] = [];
  for (const character of text) {
    const point = character.codePointAt(0)!;
    const joiner = point === 0x200c || point === 0x200d;
    const preferred = /[\u0900-\u097f\u1cd0-\u1cff\ua8e0-\ua8ff]/u.test(character) || (joiner && runs.at(-1)?.fontIndex === 1) ? 1 : 0;
    const fontIndex = fonts[preferred]?.hasGlyphForCodePoint(point) || joiner ? preferred : fonts.findIndex((font) => font.hasGlyphForCodePoint(point));
    if (fontIndex < 0) throw new CertificateNameError("Some characters in your name are not supported by the certificate fonts. Contact your facilitator for an export in the correct script.");
    if (runs.at(-1)?.fontIndex === fontIndex) runs[runs.length - 1].text += character;
    else runs.push({ text: character, font: fonts[fontIndex], fontIndex });
  }
  return runs;
}
function nameWidth(text: string, fonts: Font[]) {
  return nameRuns(text, fonts).reduce((width, run) => width + run.font.layout(run.text).advanceWidth / run.font.unitsPerEm, 0);
}

export function certificateNameLayout(name: string, fonts: CertificateFonts) {
  const normalized = name.normalize("NFC").replace(/\s+/gu, " ").trim();
  if (!normalized || normalized.length > 120 || /[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u.test(normalized)) throw new CertificateNameError("Your certificate name needs 1–120 printable characters.");
  const parsed = [fontkit.create(fonts.latin), fontkit.create(fonts.devanagari)];
  const measurements = new Map<string, number>();
  const measure = (text: string) => {
    if (!measurements.has(text)) measurements.set(text, nameWidth(text, parsed));
    return measurements.get(text)!;
  };
  const width = measure(normalized);
  if (width * 24 <= 680) return { name: normalized, lines: [normalized], size: Math.min(33, 680 / Math.max(width, 1)), fonts: parsed };
  const words = normalized.split(" ");
  const splitWords = words.length > 1 && words.every((word) => measure(word) * 18 <= 680);
  const segments = splitWords ? words : [...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(normalized)].map((part) => part.segment);
  const join = (items: string[]) => items.join(splitWords ? " " : "").trim();
  let best = [normalized]; let bestWidth = width;
  for (let boundary = 1; boundary < segments.length; boundary++) {
    const lines = [join(segments.slice(0, boundary)), join(segments.slice(boundary))];
    const candidate = Math.max(...lines.map(measure));
    if (candidate < bestWidth) { best = lines; bestWidth = candidate; }
  }
  if (680 / bestWidth < 18) {
    // Search a bounded number of widths, keeping grapheme clusters intact.
    // This also bounds work for a 120-character name without word breaks.
    let lower = 0; let upper = bestWidth;
    for (let pass = 0; pass < 12; pass++) {
      const target = (lower + upper) / 2;
      const lines: string[] = []; let current: string[] = [];
      for (const segment of segments) {
        if (current.length && measure(join([...current, segment])) > target) {
          lines.push(join(current)); current = [];
        }
        current.push(segment);
      }
      if (current.length) lines.push(join(current));
      const candidate = Math.max(...lines.map(measure));
      if (lines.length <= 3 && candidate <= target) {
        upper = target;
        if (candidate < bestWidth) { best = lines; bestWidth = candidate; }
      } else lower = target;
    }
  }
  return { name: normalized, lines: best, size: Math.min(28, 680 / bestWidth), fonts: parsed };
}

export async function buildCertificatePdf(record: CertificateRecord, fonts: CertificateFonts, verificationUrl: string) {
  if (record.revoked_at) throw new Error("A revoked completion record cannot be downloaded.");
  const issuedDate = new Date(record.issued_at);
  if (!Number.isFinite(issuedDate.getTime())) throw new Error("Invalid certificate issue date.");
  const layout = certificateNameLayout(record.participant_name, fonts);
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  document.setTitle(`PromptShala - ${layout.name}`);
  document.setAuthor("PromptShala");
  document.setSubject("Completion of four AI-literacy learning modules and required practice evidence");
  document.setKeywords(["PromptShala", "course completion"]);
  const page = document.addPage([842, 595]);
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const serif = await document.embedFont(StandardFonts.TimesRoman);
  const nameFonts = await Promise.all([fonts.latin, fonts.devanagari].map((bytes) => document.embedFont(bytes, { subset: true })));
  const fontKeys = nameFonts.map((font) => page.node.newFontDictionary(font.name, font.ref));
  const navy = rgb(.09,.14,.24), paper = rgb(.98,.97,.94), muted = rgb(.36,.40,.46), clay = rgb(.61,.30,.19);
  page.drawRectangle({x:0,y:0,width:842,height:595,color:paper});
  page.drawRectangle({x:26,y:26,width:790,height:543,borderColor:navy,borderWidth:1});
  page.drawRectangle({x:40,y:40,width:762,height:515,borderColor:rgb(.81,.77,.70),borderWidth:.5});
  const center = (text:string,y:number,size:number,font=regular,color=navy) => page.drawText(text,{x:(842-font.widthOfTextAtSize(text,size))/2,y,size,font,color});
  center("P R O M P T S H A L A",499,15,bold);
  center("PRACTICAL AI LITERACY FOR EDUCATORS",474,9,regular,muted);
  center("Certificate of completion",410,35,serif);
  center("This records that",371,12,regular,muted);

  // pdf-lib's drawText omits fontkit's glyph offsets. Preserve Indic shaping with
  // positioned glyphs and ActualText so selection/search retains the original name.
  page.pushOperators(pushGraphicsState(), setFillingRgbColor(.09,.14,.24),
    PDFOperator.of(PDFOperatorNames.BeginMarkedContentSequence, [PDFName.of("Span"), `<< /ActualText ${PDFHexString.fromText(layout.name).toString()} >>`]));
  const firstBaseline = layout.lines.length === 1 ? 318 : layout.lines.length === 2 ? 335 : 346;
  layout.lines.forEach((line, lineIndex) => {
    let x = (842 - nameWidth(line, layout.fonts) * layout.size) / 2;
    const y = firstBaseline - lineIndex * (layout.lines.length === 3 ? 23 : 33);
    for (const run of nameRuns(line, layout.fonts)) {
      const shaped = run.font.layout(run.text);
      const codes = nameFonts[run.fontIndex].encodeText(run.text).asString().match(/.{4}/g) ?? [];
      const scale = layout.size / run.font.unitsPerEm;
      page.pushOperators(beginText(), setFontAndSize(fontKeys[run.fontIndex], layout.size));
      shaped.positions.forEach((position, index) => {
        page.pushOperators(setTextMatrix(1,0,0,1,x + position.xOffset * scale,y + position.yOffset * scale), showText(PDFHexString.of(codes[index])));
        x += position.xAdvance * scale;
      });
      page.pushOperators(endText());
    }
  });
  page.pushOperators(PDFOperator.of(PDFOperatorNames.EndMarkedContent), popGraphicsState());

  page.drawLine({start:{x:230,y:286},end:{x:612,y:286},color:clay,thickness:1.4});
  center("completed all four learning modules, knowledge checks",263,14);
  center("and the required classroom practice evidence.",241,14);
  center("Foundations  /  Prompt writing  /  Teacher assistants  /  Source-based resources",202,10,regular,muted);
  center("Course completion is evidence of professional learning, not accreditation.",176,10,regular,muted);
  const issued = issuedDate.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"});
  center(`Issued ${issued}`,130,12,bold);
  center(`Record ${record.id}`,106,9,regular,muted);
  center(`Rule ${record.rule_version}`,87,8,regular,muted);
  const urlSize = Math.min(8,710/Math.max(regular.widthOfTextAtSize(verificationUrl,1),1));
  center(verificationUrl,65,urlSize,regular,muted);
  return document.save();
}
