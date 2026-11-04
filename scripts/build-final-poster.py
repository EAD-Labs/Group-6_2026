"""Build the one-page A0 PromptShala poster from real application captures.

Run scripts/capture-poster-vector.mjs first (the e2e poster-assets capture is
the raster fallback). Render and inspect the output/pdf PDF before publishing
the matching PDF/PNG pair in artifacts/final-presentation.
"""
from pathlib import Path
import argparse
import json

from PIL import Image
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from pypdf import PdfReader, PdfWriter, Transformation

parser = argparse.ArgumentParser(description=__doc__)
# Preserve the earlier build command. Test counts stay in the release record.
parser.add_argument("--unit-tests", type=int, default=435)
parser.add_argument("--browser-journeys", type=int, default=27)
args = parser.parse_args()
if args.unit_tests < 1 or args.browser_journeys < 1:
    raise ValueError("Recorded test counts must be positive")

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "artifacts/final-presentation"
OUT = ROOT / "output/pdf"
OUT.mkdir(parents=True, exist_ok=True)
W, H = 841 * mm, 1189 * mm
M, GAP = 88, 48
INNER = W - 2 * M
CW = (INNER - GAP) / 2
RIGHT = M + CW + GAP
INK, BLUE, MUTED = "#143C43", "#176F70", "#3E5B60"
LINE, PALE, WHITE = "#CCDCD5", "#E4F0E8", "#FFFFFF"
PAPER, NIGHT, MINT, CORAL, GOLD = "#FCF7ED", "#123B43", "#C9E6D8", "#F28168", "#F4CB62"
for name, filename in [
    ("Body", "InstrumentSans-Regular.ttf"),
    ("Bold", "InstrumentSans-Bold.ttf"),
    ("Display", "InstrumentSerif-Regular.ttf"),
]:
    pdfmetrics.registerFont(TTFont(name, str(ASSETS / "fonts" / filename)))
pdfmetrics.registerFontFamily("Body", normal="Body", bold="Bold")
pdfmetrics.registerFontFamily("Bold", normal="Bold", bold="Bold")

PATH = OUT / "ET617_Group6_Poster.pdf"
C = canvas.Canvas(
    str(PATH), pagesize=(W, H), pageCompression=1, initialFontName="Body"
)
C.setTitle("PromptShala - Helping teachers use AI in class")
C.setAuthor(
    "ET617 Group 6: Darshan Sonawane, Vishal Patel, Ashok Kumar, Raghuram Gundi"
)
C.setSubject(
    "Teacher AI literacy, classroom practice, client feedback and future development"
)
LAYOUT = []


def text(content, x, top, width, size=30, color=INK, font="Body",
         leading=None, max_height=None, align=0):
    style = ParagraphStyle(
        "poster", fontName=font, fontSize=size,
        leading=leading or size * 1.32, textColor=HexColor(color),
        spaceBefore=0, spaceAfter=0, alignment=align,
    )
    paragraph = Paragraph(content, style)
    _, height = paragraph.wrap(width, H)
    if max_height is not None and height > max_height + 0.01:
        raise ValueError(
            f"Text overflow: {content[:65]} ({height:.1f} > {max_height})"
        )
    if min(x, top) < 60 or x + width > W - 60 or top + height > H - 60:
        raise ValueError(f"Text outside safe margins: {content[:65]}")
    paragraph.drawOn(C, x, H - top - height)
    LAYOUT.append({
        "kind": "text", "text": content, "x": x, "top": top,
        "width": width, "height": height, "fontSize": size,
    })
    return height


def rule(top, x=M, width=INNER, color=LINE, thickness=1.6):
    C.setStrokeColor(HexColor(color))
    C.setLineWidth(thickness)
    C.line(x, H - top, x + width, H - top)


def rect(x, top, width, height, color=PALE, radius=0):
    C.setFillColor(HexColor(color))
    if radius:
        C.roundRect(x, H - top - height, width, height, radius, fill=1, stroke=0)
    else:
        C.rect(x, H - top - height, width, height, fill=1, stroke=0)


def arrow(x, top, width, color=BLUE):
    C.setStrokeColor(HexColor(color))
    C.setLineWidth(2.5)
    C.line(x, H - top, x + width, H - top)
    p = C.beginPath()
    p.moveTo(x + width - 10, H - top + 6)
    p.lineTo(x + width, H - top)
    p.lineTo(x + width - 10, H - top - 6)
    C.drawPath(p)


def screen(filename, x, top, width):
    path = ASSETS / filename
    vector_path = ASSETS / (path.stem + "-vector.pdf")
    if vector_path.exists():
        page = PdfReader(vector_path).pages[0]
        vw, vh = float(page.mediabox.width), float(page.mediabox.height)
        height = width * vh / vw
        LAYOUT.append({
            "kind": "vector-screen", "filename": vector_path.name,
            "x": x, "top": top, "width": width, "height": height,
            "sourceWidth": vw, "sourceHeight": vh,
        })
    else:
        with Image.open(path) as im:
            iw, ih = im.size
        height = width * ih / iw
        C.drawImage(str(path), x, H - top - height, width, height, mask="auto")
        LAYOUT.append({
            "kind": "screenshot", "filename": filename, "x": x, "top": top,
            "width": width, "height": height, "pixelWidth": iw, "pixelHeight": ih,
            "effectiveDpi": round(iw / (width / 72), 1),
        })
    return height


def qr(x, top, size):
    widget = QrCodeWidget("https://promptshala.vercel.app/try", barLevel="M")
    bounds = widget.getBounds()
    scale = size / (bounds[2] - bounds[0])
    # Vector modules include the complete quiet border.
    for item in widget.draw().contents:
        if item.fillColor is not None:
            C.setFillColor(item.fillColor)
            C.rect(
                x + item.x * scale, H - top - size + item.y * scale,
                item.width * scale, item.height * scale, fill=1, stroke=0,
            )
    C.linkURL(
        "https://promptshala.vercel.app/try",
        (x, H - top - size, x + size, H - top), relative=0,
    )
    LAYOUT.append({
        "kind": "qr", "x": x, "top": top, "width": size, "height": size,
        "url": "https://promptshala.vercel.app/try",
    })


rect(0, 0, W, H, PAPER)
rect(0, 0, W, 746, NIGHT)
rect(M, 69, 12, 68, CORAL, radius=6)
text("PromptShala", M + 34, 61, 1050, 72, WHITE, "Bold", 86, 90)
text("ET617  /  GROUP 6  /  IIT BOMBAY", 1510, 85, 790, 26, MINT, "Bold", 34, 38, align=2)

text("Helping teachers", M, 203, 1440, 116, WHITE, "Bold", 122, 128)
text("use AI in class.", M, 325, 1450, 134, GOLD, "Display", 145, 150)
text(
    "A guided learning platform for writing better requests,<br/>"
    "creating teaching materials and checking AI answers.",
    M + 3, 501, 1400, 34, WHITE, leading=46, max_height=96,
)

# One concrete classroom example makes the purpose readable from across the room.
text("ONE CLASSROOM IDEA. A CLEARER PATH.", 1590, 207, 690, 24, MINT, "Bold", 32, 35)
example_cards = [
    (1590, 263, 630, GOLD, "A TEACHER'S STARTING POINT", "Explain evaporation.", 38),
    (1650, 410, 630, MINT, "A MORE USEFUL REQUEST", "Plan a 15-minute Class 6 activity.", 30),
    (1590, 557, 690, CORAL, "THE TEACHER REVIEWS", "Check. Adapt. Use in class.", 38),
]
for x, y, width, color, label, content, size in example_cards:
    rect(x, y, width, 115, color, radius=18)
    text(label, x + 24, y + 15, width - 48, 21, INK, "Bold", 28, 30)
    text(content, x + 24, y + 55, width - 48, size, INK, "Bold", size * 1.15, 49)
# Connect each card to the next, rather than pointing away from the example.
for start_x, end_x, top in [(1905, 1965, 382), (1965, 1935, 529)]:
    C.setStrokeColor(HexColor(MINT))
    C.setLineWidth(3)
    p = C.beginPath()
    p.moveTo(start_x, H - top)
    p.lineTo(start_x, H - top - 10)
    p.lineTo(end_x, H - top - 10)
    p.lineTo(end_x, H - top - 23)
    p.moveTo(end_x - 6, H - top - 17)
    p.lineTo(end_x, H - top - 23)
    p.lineTo(end_x + 6, H - top - 17)
    C.drawPath(p)

for x, number, label in [(M, "4", "modules"), (M + 430, "29", "lessons"),
                         (M + 900, "75", "questions")]:
    text(number, x, 637, 120, 63, GOLD, "Bold", 73, 76)
    text(label, x + 135, 665, 270, 29, WHITE, leading=37, max_height=40)

# Problem and persona: compact, readable and directly linked to design.
text("From workshops to practice", M, 796, CW, 44, INK, "Bold", 55, 58)
text(
    "Knowing about AI is only the start. Teachers need guided practice "
    "to ask useful questions and judge what belongs in a lesson.",
    M, 867, CW - 34, 32, leading=43, max_height=132,
)
text(
    "The client asked for self-paced learning, classroom tasks "
    "and progress teachers can return to.",
    M, 1016, CW - 34, 29, MUTED, leading=39, max_height=85,
)
rect(RIGHT - 12, 786, CW + 12, 352, PALE, radius=18)
text("A teacher like Meera", RIGHT + 25, 811, CW - 50, 44, INK, "Bold", 55, 58)
text(
    "Learner persona · Classes 5-10 · New to AI",
    RIGHT + 25, 881, CW - 50, 28, BLUE, "Bold", 37, 40,
)
for i, (need, design) in enumerate([
    ("Busy school day", "Short, guided lessons"),
    ("Limited AI experience", "Familiar classroom examples"),
    ("Phone or shared laptop", "Simple screens; saved progress"),
]):
    y = 951 + i * 55
    text(need, RIGHT + 25, y, 410, 28, INK, leading=37, max_height=40)
    arrow(RIGHT + 442, y + 18, 42)
    text(design, RIGHT + 510, y, CW - 535, 27, INK, leading=36, max_height=39)

rect(M, 1175, INNER, 146, BLUE, radius=16)
text("Built with the client", M + 28, 1202, 470, 31, WHITE, "Bold", 41, 44)
text("Classroom needs shape the design", M + 28, 1254, 480, 23, MINT, leading=31, max_height=33)
process = [
    ("Listen", "Teacher needs"), ("Plan", "Learning tasks"), ("Build", "Working app"),
    ("Review", "Client feedback"), ("Refine", "Clearer steps"),
]
for i, (title, detail) in enumerate(process):
    x = 675 + i * 317
    text(title, x, 1202, 255, 32, GOLD, "Bold", 41, 44)
    text(detail, x, 1254, 255, 24, WHITE, leading=32, max_height=34)
    if i < len(process) - 1:
        arrow(x + 238, 1224, 48, MINT)

# Two authentic application screens anchor the visual learning journey.
text("See how a lesson takes shape.", M, 1373, INNER, 57, INK, "Bold", 68, 72)
text(
    "Learn a concept  →  Practise  →  Get feedback  →  Revise for your learners",
    M, 1458, INNER, 31, BLUE, "Bold", 41, 44,
)
for x, number, title, color in [
    (M, "01", "Ask for something useful", GOLD),
    (RIGHT, "02", "Turn notes into a draft", CORAL),
]:
    rect(x, 1537, 77, 61, color, radius=12)
    text(number, x + 9, 1547, 60, 31, INK, "Bold", 39, 42, align=1)
    text(title, x + 100, 1546, CW - 100, 36, INK, "Bold", 45, 48)

image_top = 1622
left_height = screen("clear-request.png", M, image_top, CW)
right_height = screen("source-draft.png", RIGHT, image_top, CW)
text(
    "CRAFT guides the context, role, action, format and audience.",
    M, image_top + left_height + 20, CW, 28, MUTED, leading=37, max_height=78,
)
review_top = image_top + right_height + 25
rect(RIGHT, review_top, CW, 152, MINT, radius=16)
text("03", RIGHT + 20, review_top + 18, 70, 33, BLUE, "Bold", 42, 45)
text(
    "Review before classroom use", RIGHT + 105, review_top + 17,
    CW - 130, 34, INK, "Bold", 43, 46,
)
text(
    "Check accuracy and learner fit.<br/>Compare revisions in Teaching Review Lab.",
    RIGHT + 105, review_top + 72, CW - 130, 27, INK, leading=36, max_height=76,
)

# Four client requests become four compact, distinct improvements.
rect(0, 2540, W, 353, "#F6E8D3")
text("You asked. We simplified.", M, 2573, 1500, 46, INK, "Bold", 57, 60)
text("FROM CLIENT FEEDBACK", 1710, 2595, 585, 23, BLUE, "Bold", 31, 34, align=2)
feedback = [
    ("01", "Simpler language", "Clearer names, classroom examples<br/>and obvious next steps."),
    ("02", "A personal starting point", "Onboarding asks about AI tools,<br/>confidence and teaching goals."),
    ("03", "Use your own Gemini key", "An optional connection.<br/>The key stays in the open tab."),
    ("04", "Keep useful work", "Private prompts and feedback,<br/>saved for the next sign-in."),
]
fw = INNER / 4
for i, (number, title, description) in enumerate(feedback):
    x = M + i * fw
    if i:
        C.setStrokeColor(HexColor("#D8C7AF"))
        C.setLineWidth(1.5)
        C.line(x - 25, H - 2674, x - 25, H - 2820)
    text(number, x, 2664, 75, 26, BLUE, "Bold", 35, 38)
    text(title, x, 2711, fw - 46, 29, INK, "Bold", 38, 41)
    text(description, x, 2770, fw - 46, 26, MUTED, leading=35, max_height=74)

# A bold closing invitation balances current features with genuine next steps.
rect(0, 2893, W, H - 2893, NIGHT)
text("Ready to explore", M, 2930, 1360, 37, WHITE, "Bold", 47, 50)
text(
    "A deployed web course with saved prompts, progress checks,<br/>"
    "certificates and staff tools. Live AI verification is pending.",
    M, 2991, 1420, 28, WHITE, leading=38, max_height=79,
)
text("Next: test, refine and adapt", M, 3088, 1360, 34, GOLD, "Bold", 44, 47)
text(
    "Teacher trials, curriculum review and accessibility checks.<br/>"
    "Reusable Review Lab rubrics support other subjects and programmes.",
    M, 3145, 1420, 27, MINT, leading=37, max_height=77,
)
rule(3232, M, 1420, "#3D656A")
text(
    "Darshan Sonawane · Vishal Patel · Ashok Kumar · Raghuram Gundi",
    M, 3244, 1440, 22, WHITE, leading=28, max_height=31,
)
text(
    "Client: Centre for Educational Technology, IIT Bombay",
    M, 3280, 1440, 21, MINT, leading=28, max_height=30,
)

rect(1610, 2930, W - M - 1610, 375, GOLD, radius=24)
text("Try a classroom task", 1640, 2952, 622, 38, INK, "Bold", 47, 51, align=1)
qr(1636, 3020, 225)
text("Scan. Try. Explore.", 1880, 3061, 365, 29, INK, "Bold", 38, 42)
text("No sign-in needed", 1880, 3117, 365, 26, INK, leading=35, max_height=38)
text("promptshala.vercel.app/try", 1640, 3256, 622, 25, INK, "Bold", 33, 36, align=1)
C.linkURL(
    "https://promptshala.vercel.app/try",
    (1610, H - 3305, W - M, H - 2930), relative=0,
)
C.showPage()
C.save()

# Preserve browser-rendered vector text when placing the application panels.
reader = PdfReader(PATH)
page = reader.pages[0]
for element in LAYOUT:
    if element["kind"] == "vector-screen":
        source = PdfReader(ASSETS / element["filename"]).pages[0]
        scale = element["width"] / element["sourceWidth"]
        transform = Transformation().scale(scale).translate(
            element["x"], H - element["top"] - element["height"]
        )
        page.merge_transformed_page(source, transform)
writer = PdfWriter()
writer.add_page(page)
writer.add_metadata({key: str(value) for key, value in reader.metadata.items()})
merged = OUT / "ET617_Group6_Poster-merged.pdf"
writer.write(merged)
merged.replace(PATH)
manifest = {
    "pdf": str(PATH), "widthMm": 841, "heightMm": 1189, "pages": 1,
    "qr": "https://promptshala.vercel.app/try", "elements": LAYOUT,
    "historicalValidation": {
        "automatedTests": args.unit_tests, "browserJourneys": args.browser_journeys,
        "displayedOnPoster": False,
    },
}
(OUT / "poster-layout.json").write_text(json.dumps(manifest, indent=2))
print(json.dumps({
    "path": str(PATH), "widthMm": 841, "heightMm": 1189,
    "pages": 1, "elements": len(LAYOUT),
}, indent=2))
