"""A0 portrait, vector type/diagrams/QR, embedded font and real UI captures.

Run after e2e/poster-assets.spec.ts. Authoring outputs are under output/pdf;
after render/preflight, publish matching PDF/preview copies in artifacts.
Regenerate after final deployment/evidence updates; never invent study results.
"""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, toColor
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.graphics.barcode.qr import QrCodeWidget
from PIL import Image
import json
import argparse

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--unit-tests", type=int, default=435, help="Actually passed final automated test count")
parser.add_argument("--browser-journeys", type=int, default=27, help="Actually passed browser journey count, excluding capture/skip rows")
args = parser.parse_args()
if args.unit_tests < 1 or args.browser_journeys < 1:
    raise ValueError("Use recorded positive test counts, not estimates")

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "artifacts/final-presentation"
OUT = ROOT / "output/pdf"
OUT.mkdir(parents=True, exist_ok=True)
W, H = 841 * mm, 1189 * mm
M, GAP = 90, 38
CW = (W - 2*M - GAP)/2
INK, MUTED, BLUE = "#172f4d", "#455d79", "#214f84"
PALE, PAPER, LINE = "#e8f0fb", "#f7f9fc", "#d8e2ef"
pdfmetrics.registerFont(TTFont("Poster", str(ROOT / "public/fonts/NotoSans-Regular.ttf")))
PATH = OUT / "ET617_Group6_Poster.pdf"
C = canvas.Canvas(str(PATH), pagesize=(W,H), pageCompression=1, initialFontName="Poster")
C.setTitle("PromptShala - ET617 Group 6 Final Project Poster")
C.setAuthor("ET617 Group 6: Darshan Sonawane, Vishal Patel, Ashok Kumar, Raghuram Gundi")
C.setSubject("Teacher-centred AI literacy; working application, design decisions and future implementation")

def box(x, top, width, height, fill="white", radius=24, stroke=LINE):
    C.setFillColor(toColor(fill)); C.setStrokeColor(toColor(stroke))
    C.roundRect(x, H-top-height, width, height, radius, fill=1, stroke=1)

def para(text, x, top, width, size=28, color=INK, leading=None, max_height=None):
    style = ParagraphStyle("p", fontName="Poster", fontSize=size, leading=leading or size*1.38,
                           textColor=HexColor(color), spaceAfter=0)
    p = Paragraph(text, style); _, height=p.wrap(width, H)
    if max_height is not None and height > max_height:
        raise ValueError(f"Text overflow: {text[:80]} ({height} > {max_height})")
    p.drawOn(C, x, H-top-height)
    return height

def heading(number, title, x, top, width):
    para(number, x, top, 100, 25, BLUE)
    para(title, x+90, top-5, width-90, 39, INK, 49)

def rule(x, top, width):
    C.setStrokeColor(HexColor(LINE)); C.setLineWidth(1.5); C.line(x,H-top,x+width,H-top)

def arrow(x, top, width):
    C.setStrokeColor(HexColor(BLUE)); C.setLineWidth(3); C.line(x,H-top,x+width,H-top)
    C.setFillColor(HexColor(BLUE)); p=C.beginPath(); p.moveTo(x+width,H-top);p.lineTo(x+width-14,H-top+8);p.lineTo(x+width-14,H-top-8);p.close();C.drawPath(p,fill=1,stroke=0)

C.setFillColor(HexColor(PAPER)); C.rect(0,0,W,H,fill=1,stroke=0)
C.drawImage(str(ROOT / "public/brand/promptshala-logo.png"), M, H-185, width=480, height=160, preserveAspectRatio=True, mask="auto")
para("ET617 FINAL PROJECT · GROUP 6", W-M-700, 80, 700, 25, BLUE)
para("Practical AI literacy<br/>for everyday teaching.", M, 220, W-2*M-560, 84, INK, 101, 240)
para("Learn. Try. Check. Improve. Keep the teacher in control.", M, 445, W-2*M-510, 33, MUTED)
para("Client: Centre for Educational Technology, IIT Bombay", M, 510, W-2*M, 26, MUTED)
para("Darshan Sonawane · Vishal Patel · Ashok Kumar · Raghuram Gundi", M, 551, W-2*M, 25, MUTED)
box(W-M-450, 200, 450, 350, "white")
qr = QrCodeWidget("https://promptshala.vercel.app/try", barLevel="M")
qr_bounds=qr.getBounds()
qr_scale=240/(qr_bounds[2]-qr_bounds[0])
# Draw the widget's vector rectangles directly so all text fonts stay embedded.
# The quiet border is included in the widget bounds; do not crop it.
for rect in qr.draw().contents:
    if rect.fillColor is not None:
        C.setFillColor(rect.fillColor)
        C.rect(W-M-345+rect.x*qr_scale,H-465+rect.y*qr_scale,
               rect.width*qr_scale,rect.height*qr_scale,fill=1,stroke=0)
para("TRY IT IN YOUR BROWSER",W-M-423,465,400,23,BLUE)
para("No sign-in needed",W-M-423,504,400,22,MUTED)
C.linkURL("https://promptshala.vercel.app/try",(W-M-450,H-550,W-M,H-200),relative=0)

# Problem and learner design, not an unsupported claim about learning impact.
for x in [M,M+CW+GAP]: box(x,630,CW,395)
heading("01", "The client problem", M+30,663,CW-60)
para("Workshops introduce AI. Teachers still need guided practice to turn it into responsible classroom work.",M+30,733,CW-60,32,max_height=130)
para("The brief: four self-paced modules, formative feedback, reusable teaching workflows, saved progress and evidence of completion.",M+30,873,CW-60,27,MUTED,max_height=120)
heading("02", "Designing for Meera",M+CW+GAP+30,663,CW-60)
para("A beginner science teacher, Classes 5–10. A phone or shared laptop. Short learning windows. Limited technical confidence.",M+CW+GAP+30,733,CW-60,30,max_height=130)
para("Design consequences: familiar classroom language, short steps, editable examples, visible feedback, accessible navigation and account isolation.",M+CW+GAP+30,873,CW-60,27,MUTED,max_height=120)

box(M,1060,W-2*M,397)
heading("03","How the design became a working learning experience",M+30,1090,W-2*M-60)
steps=[("Understand","Client brief + persona"),("Design","Authentic teaching tasks"),("Build","Four guided modules"),("Review","Feedback + iteration"),("Verify","Tests; client UAT next")]
SW=(W-2*M-100)/5
for i,(label,detail) in enumerate(steps):
    x=M+35+i*SW
    box(x,1180,SW-30,108,PALE,16,PALE)
    para(label,x+18,1196,SW-65,29,BLUE)
    para(detail,x+18,1241,SW-65,21,MUTED)
    if i<4: arrow(x+SW-25,1230,20)
para("Pedagogy: explain an idea; practise a classroom task; get formative feedback; revise; transfer to a new context.",M+35,1320,W-2*M-70,29,max_height=90)

# Three real public application screens with large captions; no private data.
heading("04","A visitor can independently try the core learning loop",M+5,1500,W-2*M-10)
SCREEN_GAP=24; SW=(W-2*M-2*SCREEN_GAP)/3
screens=[("clear-request.png","1. Make the request clearer","CRAFT checklist feedback supports deliberate revision."),("source-draft.png","2. Work from your own material","Numbered passages connect an editable scaffold to its source."),("review-lab.png","3. Check before classroom use","Human evidence ratings, essential checks and revision comparison.")]
for i,(name,title,caption) in enumerate(screens):
    x=M+i*(SW+SCREEN_GAP); box(x,1570,SW,530)
    f=ASSETS/name
    if not f.exists(): raise FileNotFoundError(f"Capture actual UI first: {f}")
    C.drawImage(str(f),x+15,H-1910,width=SW-30,height=315,preserveAspectRatio=True,anchor="c",mask="auto")
    para(title,x+24,1935,SW-48,27,INK,max_height=80)
    para(caption,x+24,2025,SW-48,23,MUTED,max_height=65)
para("Screens show genuine browser interactions with fictional sample material. Public practice is local; full cloud learning and live AI require an account.",M+8,2120,W-2*M-16,23,MUTED,max_height=70)

box(M,2225,W-2*M,405)
heading("05","Client feedback changed the product",M+30,2255,W-2*M-60)
rows=[("Too much technical language","Task-based names, plain-language home page, shorter guided steps."),("Understand existing AI use","Optional tools, frequency, confidence and teaching-goal questions."),("Let teachers use their own Gemini key","One optional connection; tab-memory key, no database storage."),("Save crafted requests","Private prompt + feedback history, reuse, account export and deletion.")]
for i,(feedback,change) in enumerate(rows):
    y=2330+i*68
    para(feedback,M+35,y,750,25,BLUE,max_height=64)
    arrow(M+810,y+22,55)
    para(change,M+900,y,W-2*M-935,25,INK,max_height=64)

for x in [M,M+CW+GAP]: box(x,2670,CW,440)
heading("06","Current status & evidence",M+30,2702,CW-60)
metrics=[("4","modules"),("29","lessons"),("75","questions")]
for i,(n,label) in enumerate(metrics):
    x=M+35+i*(CW-70)/3; para(n,x,2780,(CW-80)/3,68,BLUE);para(label,x,2878,(CW-80)/3,25,MUTED)
para("Working course: saved learning, trusted quizzes, prompt practice, helpers, source tools, certificates and staff authoring.",M+35,2930,CW-70,25,max_height=115)
para(f"{args.unit_tests} tests passed; {args.browser_journeys} browser journeys (Chromium, WebKit, 360px). Keyboard + accessibility smoke; full audit pending.",M+35,3015,CW-70,22,MUTED,max_height=65)
para("Client UAT and teacher field study pending.",M+35,3076,CW-70,20,MUTED,max_height=35)
heading("07","Implementation & wider use",M+CW+GAP+30,2702,CW-60)
para("Deployed web app: Next.js + Supabase + optional server-side Gemini. Responsive access, private records and versioned assessment evidence.",M+CW+GAP+35,2780,CW-70,27,max_height=145)
para("Beyond this client: the Teaching Review Lab accepts portable rubrics for other subjects and teacher-development programmes.",M+CW+GAP+35,2922,CW-70,26,max_height=100)
para("Next: client UAT, operational recovery checks, real classroom study, and institution-approved curriculum and retention policies.",M+CW+GAP+35,3030,CW-70,23,MUTED,max_height=70)

rule(M,3150,W-2*M)
para("WORKING DEMO",M,3180,450,23,BLUE)
para("promptshala.vercel.app/try",M,3223,950,30,INK)
C.linkURL("https://promptshala.vercel.app/try",(M,H-3270,M+950,H-3215),relative=0)
para("Source & engineering evidence",M+1200,3180,950,23,BLUE)
para("github.com/EAD-Labs/Group-6_2026",M+1200,3223,950,26,INK)
C.linkURL("https://github.com/EAD-Labs/Group-6_2026",(M+1200,H-3270,W-M,H-3215),relative=0)
para("23 October 2026 · LA–LHC Complex Foyer, IIT Bombay · ET617",M,3290,W-2*M,20,MUTED)
C.showPage();C.save()
print(json.dumps({"path":str(PATH),"widthMm":841,"heightMm":1189,"pages":1,"qr":"https://promptshala.vercel.app/try","screenshots":str(ASSETS)},indent=2))
