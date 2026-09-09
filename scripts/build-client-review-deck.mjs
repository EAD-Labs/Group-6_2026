import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = process.env.WORKSPACE_DIR;
const skillDir = process.env.SKILL_DIR;
const tempDir = process.env.TMP_DIR;
const finalPptx = process.env.FINAL_PPTX;
const runtimePython = process.env.RUNTIME_PYTHON;

for (const [name, value] of Object.entries({
  WORKSPACE_DIR: workspaceDir,
  SKILL_DIR: skillDir,
  TMP_DIR: tempDir,
  FINAL_PPTX: finalPptx,
  RUNTIME_PYTHON: runtimePython,
})) {
  if (!value || !path.isAbsolute(value)) {
    throw new Error(`${name} must be an absolute path`);
  }
}

const { finalizePresentation } = await import(
  pathToFileURL(
    path.join(skillDir, "container_tools/artifact_tool_utils.mjs"),
  ).href,
);

const colors = {
  amber: "#D8A23A",
  coral: "#E66B52",
  forest: "#173E35",
  forestDark: "#102D27",
  ink: "#1E2A27",
  ivory: "#F7F2E7",
  moss: "#47715F",
  muted: "#5E6B66",
  paper: "#FFFCF5",
  sage: "#DDE8DE",
  white: "#FFFFFF",
};
const fonts = { body: "Arial", display: "Georgia" };
const screenshotsDir = path.join(
  workspaceDir,
  "docs/presentations/assets/client-review-2026-09-09",
);
const screenshotPaths = {
  craftComparison: "10-craft-comparison-desktop.png",
  craftFeedback: "09-craft-feedback-desktop.png",
  dashboard: "04-dashboard-desktop.png",
  dashboardMobile: "11-dashboard-mobile.png",
  home: "01-home-desktop.png",
  lesson: "05-lesson-desktop.png",
  progress: "06-progress-desktop.png",
  quizFailed: "07-quiz-failed-desktop.png",
  quizPassed: "08-quiz-passed-desktop.png",
  safeUse: "03-safe-use-desktop.png",
};
const imageBytes = {};
for (const [name, filename] of Object.entries(screenshotPaths)) {
  imageBytes[name] = await fs.readFile(path.join(screenshotsDir, filename));
}

await fs.mkdir(tempDir, { recursive: true });
await fs.mkdir(path.dirname(finalPptx), { recursive: true });

const presentation = Presentation.create({
  slideSize: { height: 720, width: 1280 },
});

function addText(slide, text, position, options = {}) {
  const shape = slide.shapes.add({
    fill: "none",
    geometry: "textbox",
    line: { fill: "none", width: 0 },
    position,
  });
  shape.text = text;
  shape.text.style = {
    alignment: options.alignment ?? "left",
    autoFit: options.autoFit ?? "shrinkText",
    bold: options.bold ?? false,
    color: options.color ?? colors.ink,
    fontSize: options.fontSize ?? 22,
    insets: { bottom: 0, left: 0, right: 0, top: 0 },
    lineSpacing: options.lineSpacing ?? 1.08,
    typeface: options.typeface ?? fonts.body,
    verticalAlignment: options.verticalAlignment ?? "top",
    wrap: "square",
  };
  return shape;
}

function addImage(slide, bytes, position, alt, options = {}) {
  return slide.images.add({
    alt,
    blob: bytes,
    borderRadius: 14,
    contentType: "image/png",
    fit: options.fit ?? "cover",
    geometry: "roundRect",
    position,
  });
}

function addTitle(slide, title, options = {}) {
  addText(
    slide,
    title,
    { height: 60, left: 58, top: 38, width: 1120 },
    {
      bold: true,
      color: options.color ?? colors.forestDark,
      fontSize: 42,
      lineSpacing: 0.98,
      typeface: fonts.display,
    },
  );
}

function addFooter(slide, number, label = "PromptShala assessment review") {
  addText(
    slide,
    label,
    { height: 18, left: 58, top: 684, width: 430 },
    { color: colors.muted, fontSize: 11 },
  );
  addText(
    slide,
    String(number).padStart(2, "0"),
    { height: 18, left: 1170, top: 682, width: 52 },
    {
      alignment: "right",
      bold: true,
      color: colors.moss,
      fontSize: 12,
    },
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide, colors.forestDark);
  addText(
    slide,
    "PromptShala",
    { height: 88, left: 68, top: 88, width: 490 },
    {
      bold: true,
      color: colors.ivory,
      fontSize: 70,
      lineSpacing: 0.92,
      typeface: fonts.display,
    },
  );
  addText(
    slide,
    "Five-minute assessment review",
    { height: 42, left: 72, top: 190, width: 430 },
    { bold: true, color: colors.sage, fontSize: 27 },
  );
  addText(
    slide,
    "Practical AI literacy for beginner school teachers",
    { height: 116, left: 72, top: 292, width: 420 },
    {
      bold: true,
      color: colors.white,
      fontSize: 31,
      lineSpacing: 1.06,
      typeface: fonts.display,
    },
  );
  addText(
    slide,
    "10 September 2026\nET 617 Group 6",
    { height: 54, left: 72, top: 574, width: 320 },
    { color: "#BFD0C8", fontSize: 16, lineSpacing: 1.25 },
  );
  addImage(
    slide,
    imageBytes.home,
    { height: 420, left: 548, top: 135, width: 674 },
    "PromptShala home page from the verified local build",
  );
  addText(
    slide,
    "Working product, AI feedback and delivery evidence",
    { height: 26, left: 690, top: 582, width: 532 },
    { alignment: "right", bold: true, color: colors.sage, fontSize: 14 },
  );
  addNotes(
    slide,
    "Speaker: Darshan. Timing: 20 seconds. PromptShala helps beginner school teachers learn practical AI use through short activities and feedback. We will show the teacher persona, working participant journey, live CRAFT evaluation, engineering evidence and the next delivery target.",
  );
}

function addNotes(slide, notes) {
  slide.speakerNotes.textFrame.setText(notes);
  slide.speakerNotes.setVisible(true);
}

function setBackground(slide, color = colors.ivory) {
  slide.background.fill = color;
}

function addNumberedLine(slide, number, label, top, options = {}) {
  const left = options.left ?? 62;
  addText(
    slide,
    String(number).padStart(2, "0"),
    { height: 30, left, top, width: 44 },
    {
      bold: true,
      color: options.numberColor ?? colors.amber,
      fontSize: 14,
    },
  );
  addText(
    slide,
    label,
    {
      height: options.height ?? 52,
      left: left + 52,
      top: top - 4,
      width: options.width ?? 420,
    },
    {
      bold: options.bold ?? false,
      color: options.color ?? colors.ink,
      fontSize: options.fontSize ?? 19,
      lineSpacing: 1.08,
    },
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide);
  addTitle(slide, "The teacher persona shaped the product");
  addText(
    slide,
    "Meera",
    { height: 70, left: 62, top: 124, width: 320 },
    {
      bold: true,
      color: colors.forest,
      fontSize: 52,
      typeface: fonts.display,
    },
  );
  addText(
    slide,
    "Science teacher, Classes 5 to 7",
    { height: 30, left: 64, top: 197, width: 410 },
    { bold: true, color: colors.coral, fontSize: 20 },
  );
  addNumberedLine(slide, 1, "Beginner with generative AI", 262);
  addNumberedLine(slide, 2, "Uses a phone or shared laptop", 326);
  addNumberedLine(slide, 3, "Has 20 to 30 minutes per session", 390);
  addNumberedLine(
    slide,
    4,
    "Needs plain feedback and safe classroom outputs",
    454,
    { height: 58 },
  );
  addText(
    slide,
    "Design response",
    { height: 28, left: 64, top: 554, width: 200 },
    { bold: true, color: colors.moss, fontSize: 16 },
  );
  addText(
    slide,
    "Short activities, clear locks, transcripts, captions, keyboard focus and mobile navigation",
    { height: 66, left: 64, top: 586, width: 480 },
    {
      bold: true,
      color: colors.forestDark,
      fontSize: 21,
      lineSpacing: 1.1,
      typeface: fonts.display,
    },
  );
  addImage(
    slide,
    imageBytes.safeUse,
    { height: 340, left: 622, top: 128, width: 590 },
    "Safe-use onboarding for a beginner school teacher",
  );
  addImage(
    slide,
    imageBytes.dashboardMobile,
    { height: 186, left: 826, top: 488, width: 180 },
    "PromptShala dashboard at a 390 pixel mobile viewport",
    { fit: "contain" },
  );
  addText(
    slide,
    "Wireframes became the responsive interface shown here",
    { height: 52, left: 618, top: 552, width: 190 },
    { color: colors.muted, fontSize: 17, lineSpacing: 1.12 },
  );
  addFooter(slide, 2);
  addNotes(
    slide,
    "Speaker: Vishal. Timing: 35 seconds. We designed for Meera, a beginner school teacher with limited time and mixed device access. The persona led directly to short activities, plain language, clear lock states, captions, transcripts, keyboard focus and mobile navigation. The Stitch wireframes were refined into the working responsive screens shown here.",
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide, colors.paper);
  addTitle(slide, "Working participant journey");
  const steps = [
    "Sign in",
    "Safe onboarding",
    "Dashboard",
    "Lesson",
    "Quiz",
    "Retry or pass",
    "Unlock Module 2",
  ];
  steps.forEach((label, index) => {
    addNumberedLine(slide, index + 1, label, 130 + index * 67, {
      bold: index >= 5,
      fontSize: 18,
      height: 34,
      width: 250,
    });
  });
  addImage(
    slide,
    imageBytes.dashboard,
    { height: 254, left: 386, top: 118, width: 390 },
    "Participant dashboard with the four-module pathway",
  );
  addImage(
    slide,
    imageBytes.quizFailed,
    { height: 254, left: 802, top: 118, width: 390 },
    "Quiz feedback after a failing attempt",
  );
  addImage(
    slide,
    imageBytes.lesson,
    { height: 254, left: 386, top: 398, width: 390 },
    "Interactive lesson with transcript and concept check",
  );
  addImage(
    slide,
    imageBytes.quizPassed,
    { height: 254, left: 802, top: 398, width: 390 },
    "Passed quiz and Module 2 unlock",
  );
  addFooter(slide, 3);
  addNotes(
    slide,
    "Speaker: Darshan. Timing: 55 seconds. The approved flow now works from sign-in through Module 2 unlock. Module 1 contains three short lessons, transcripts and concept checks. A three-out-of-five result shows focused feedback and an immediate retry. Four out of five meets the 70 percent rule, preserves the best score and unlocks the next module.",
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide);
  addTitle(slide, "CRAFT feedback is live");
  addText(
    slide,
    "1 / 15",
    { height: 56, left: 58, top: 112, width: 240 },
    {
      bold: true,
      color: colors.coral,
      fontSize: 45,
      typeface: fonts.display,
    },
  );
  addText(
    slide,
    "“Explain photosynthesis.”",
    { height: 46, left: 60, top: 174, width: 510 },
    { bold: true, color: colors.ink, fontSize: 20 },
  );
  addImage(
    slide,
    imageBytes.craftFeedback,
    { height: 350, left: 50, top: 228, width: 570 },
    "Live Gemini CRAFT evaluation of a weak teacher prompt",
  );
  addText(
    slide,
    "15 / 15",
    { height: 56, left: 662, top: 112, width: 240 },
    {
      bold: true,
      color: colors.forest,
      fontSize: 45,
      typeface: fonts.display,
    },
  );
  addText(
    slide,
    "Revised classroom prompt",
    { height: 46, left: 664, top: 174, width: 510 },
    { bold: true, color: colors.ink, fontSize: 20 },
  );
  addImage(
    slide,
    imageBytes.craftComparison,
    { height: 350, left: 658, top: 228, width: 570 },
    "Live Gemini CRAFT evaluation of a strong teacher prompt",
  );
  addText(
    slide,
    "Five scores from 0 to 3, evidence, one improvement suggestion and a safe fallback",
    { height: 50, left: 166, top: 606, width: 948 },
    {
      alignment: "center",
      bold: true,
      color: colors.forestDark,
      fontSize: 21,
      lineSpacing: 1.08,
      typeface: fonts.display,
    },
  );
  addFooter(slide, 4);
  addNotes(
    slide,
    "Speaker: Ashok. Timing: 55 seconds. CRAFT means Context, Role, Action, Format and Target. The weak prompt receives one point out of fifteen because the action is present but vague. The revised prompt receives detailed feedback for all five dimensions and reaches fifteen. The evaluator runs on the server. The browser never receives the key, raw prompts are not stored, and the deterministic CRAFT fallback remains available.",
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide, colors.paper);
  addTitle(slide, "Working system evidence");
  addText(
    slide,
    "56",
    { height: 56, left: 62, top: 132, width: 190 },
    {
      bold: true,
      color: colors.coral,
      fontSize: 45,
      typeface: fonts.display,
    },
  );
  addText(
    slide,
    "automated tests in the final suite",
    { height: 48, left: 64, top: 190, width: 280 },
    { color: colors.muted, fontSize: 17 },
  );
  addText(
    slide,
    "12",
    { height: 56, left: 62, top: 278, width: 190 },
    {
      bold: true,
      color: colors.forest,
      fontSize: 45,
      typeface: fonts.display,
    },
  );
  addText(
    slide,
    "public Supabase tables protected by RLS",
    { height: 48, left: 64, top: 336, width: 280 },
    { color: colors.muted, fontSize: 17 },
  );
  addNumberedLine(slide, 1, "Next.js, TypeScript and Supabase", 448, {
    fontSize: 17,
    width: 280,
  });
  addNumberedLine(
    slide,
    2,
    "Server-only Gemini 3.5 Flash evaluator",
    502,
    { fontSize: 17, width: 280 },
  );
  addNumberedLine(
    slide,
    3,
    "Desktop and 390 px mobile evidence",
    556,
    { fontSize: 17, width: 280 },
  );
  addImage(
    slide,
    imageBytes.progress,
    { height: 482, left: 404, top: 128, width: 808 },
    "Progress page showing lesson completion, quiz attempts and Module 2 status",
  );
  addText(
    slide,
    "Boundary: a real multi-user staging journey still needs execution",
    { height: 28, left: 650, top: 630, width: 562 },
    { alignment: "right", bold: true, color: colors.coral, fontSize: 14 },
  );
  addFooter(slide, 5);
  addNotes(
    slide,
    "Speaker: Raghuram. Timing: 40 seconds. The final suite contains 56 automated tests, and lint, type checking and the production build pass. We applied three migrations to the connected Supabase project, seeded four modules and verified RLS on twelve public tables. The health route reports Supabase and the evaluator as configured. The remaining boundary is a real two-participant staging test.",
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide);
  addTitle(slide, "Project evidence and team ownership");
  const workstreams = [
    [
      "Darshan Sonawane",
      "Planning and client flow",
      "HLD schedule, Jira structure, walkthrough",
    ],
    [
      "Vishal Patel",
      "Persona and experience design",
      "Teacher needs, wireframes, responsive UX",
    ],
    [
      "Ashok Chilka",
      "Learning and CRAFT content",
      "Lessons, scenarios, rubric and quiz review",
    ],
    [
      "Raghuram Gundi",
      "Platform and validation",
      "Supabase, AI integration, tests and staging",
    ],
  ];
  workstreams.forEach(([name, area, evidence], index) => {
    const left = 58 + index * 303;
    addText(
      slide,
      name,
      { height: 54, left, top: 132, width: 270 },
      {
        bold: true,
        color: index % 2 === 0 ? colors.forest : colors.coral,
        fontSize: 22,
        lineSpacing: 1.02,
        typeface: fonts.display,
      },
    );
    addText(
      slide,
      area,
      { height: 52, left, top: 204, width: 270 },
      { bold: true, color: colors.ink, fontSize: 18, lineSpacing: 1.08 },
    );
    addText(
      slide,
      evidence,
      { height: 92, left, top: 276, width: 270 },
      { color: colors.muted, fontSize: 17, lineSpacing: 1.17 },
    );
  });
  const evidence = [
    ["HLD v1.3", "signed page preserved"],
    ["4 MoMs", "date-wise client record"],
    ["20 Jira tasks", "5 assigned to each member"],
    ["16 commits", "scoped review-branch history"],
  ];
  evidence.forEach(([value, label], index) => {
    const left = 64 + index * 300;
    addText(
      slide,
      value,
      { height: 50, left, top: 454, width: 250 },
      {
        alignment: "center",
        bold: true,
        color: colors.forestDark,
        fontSize: 27,
        typeface: fonts.display,
      },
    );
    addText(
      slide,
      label,
      { height: 46, left, top: 510, width: 250 },
      { alignment: "center", color: colors.muted, fontSize: 16 },
    );
  });
  addText(
    slide,
    "Individual GitHub authorship remains tied to the account that actually commits or reviews.",
    { height: 42, left: 200, top: 606, width: 880 },
    { alignment: "center", bold: true, color: colors.moss, fontSize: 17 },
  );
  addFooter(slide, 6);
  addNotes(
    slide,
    "Speaker: Vishal. Timing: 40 seconds. We divided delivery into four equally sized workstreams. Darshan owns planning and client flow. I own the persona and responsive experience. Ashok owns learning content and CRAFT review. Raghuram owns platform validation and staging. The evidence includes HLD v1.3, four meeting records, twenty Jira tasks with five per member, and sixteen scoped commits on the review branch. GitHub attribution remains truthful to the account that commits or reviews.",
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide, colors.forestDark);
  addTitle(slide, "Next client review", { color: colors.ivory });
  addText(
    slide,
    "Module 1 ready on staging by 20 September",
    { height: 50, left: 62, top: 108, width: 1120 },
    {
      bold: true,
      color: colors.amber,
      fontSize: 27,
      typeface: fonts.display,
    },
  );
  addText(
    slide,
    "We will show",
    { height: 30, left: 64, top: 190, width: 420 },
    { bold: true, color: colors.sage, fontSize: 19 },
  );
  [
    "Stable staging link with real sign-in",
    "Two-participant RLS isolation evidence",
    "Server-backed lesson, quiz and progress persistence",
    "Module 1 test report with accessibility checks",
  ].forEach((label, index) => {
    addNumberedLine(slide, index + 1, label, 242 + index * 76, {
      color: colors.white,
      fontSize: 19,
      height: 50,
      left: 64,
      numberColor: colors.coral,
      width: 470,
    });
  });
  addText(
    slide,
    "Client confirmation needed",
    { height: 30, left: 676, top: 190, width: 460 },
    { bold: true, color: colors.sage, fontSize: 19 },
  );
  [
    "CRAFT wording and first three scenarios",
    "Pilot subjects, grades and language preferences",
    "Privacy and teacher-review wording",
    "One non-sensitive syllabus or worksheet",
  ].forEach((label, index) => {
    addNumberedLine(slide, index + 1, label, 242 + index * 76, {
      color: colors.white,
      fontSize: 19,
      height: 50,
      left: 676,
      numberColor: colors.amber,
      width: 470,
    });
  });
  addText(
    slide,
    "Final project presentation remains fixed for 15 October 2026",
    { height: 44, left: 192, top: 610, width: 896 },
    {
      alignment: "center",
      bold: true,
      color: colors.ivory,
      fontSize: 22,
      typeface: fonts.display,
    },
  );
  addFooter(slide, 7, "PromptShala assessment review, 10 September 2026");
  addNotes(
    slide,
    "Speaker: Raghuram. Timing: 30 seconds. For the next client review we will show a stable staging link, real sign-in, two-participant data isolation, server-backed lesson and quiz progress, and the Module 1 test report. We need confirmation on CRAFT wording, scenario priority, pilot context, privacy wording and one safe teacher-owned source. The final presentation date remains 15 October.",
  );
}

const stagingDir = path.join(
  workspaceDir,
  ".codex-finalizer",
  "assessment-review-2026-09-10",
);
await fs.mkdir(stagingDir, { recursive: true });
const candidatePath = path.join(stagingDir, "candidate.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

const result = await finalizePresentation({
  workspaceDir,
  candidatePath,
  finalPath: finalPptx,
  pythonExecutable: runtimePython,
  integrityValidatorPath: path.join(
    skillDir,
    "container_tools/inspect_presentation_package_integrity.py",
  ),
  layoutValidatorPath: path.join(
    skillDir,
    "container_tools/inspect_presentation_layout_geometry.py",
  ),
  layoutArgs: [
    "--expected-slide-size-emu",
    "12192000,6858000",
    "--validate-bullet-geometry",
    "--validate-heading-fit",
  ],
  explicitTotalSlideCount: 7,
  requiredNativeChartOwnerSlides: [],
  requiredNativeTableOwnerSlides: [],
  fontPolicy: {
    basis: "design",
    families: [fonts.display, fonts.body],
  },
  verifyArtifactToolImport: true,
  receiptPath: path.join(
    stagingDir,
    `${path.basename(finalPptx)}.validation.json`,
  ),
});

console.log(JSON.stringify({ finalPptx, validation: result }, null, 2));
