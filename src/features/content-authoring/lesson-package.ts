import { moduleOneLessons } from "@/features/learning/catalog";
import { moduleTwoLessons } from "@/features/learning/module-two-content";
import { moduleThreeLessons } from "@/features/learning/module-three-content";
import { moduleFourLessons } from "@/features/learning/module-four-content";

export const authoringLessons = [moduleOneLessons.map(lesson => ({ id: lesson.slug, title: lesson.title })), moduleTwoLessons, moduleThreeLessons, moduleFourLessons];
export type LessonMedia = { kind: "video" | "reading"; title: string; url: string; accessibilityNote: string };
export type LessonPackage = { schemaVersion: 1; learningGoal: string; media: LessonMedia[]; activity: { title: string; instructions: string; reflection: string }; rightsConfirmed: boolean };
export type LessonVersion = { id: string; module_number: number; lesson_slug: string; title: string; body: string; version: number; status: "draft" | "published" | "archived"; cohort_id: string | null; package: LessonPackage | Record<string, never>; published_at?: string | null };
export type LessonDraft = { module: number; lessonSlug: string; title: string; body: string; cohortId: string; package: LessonPackage };
export type ContentScope = { id: string; title: string; status?: string };
export const emptyLessonPackage = (): LessonPackage => ({ schemaVersion: 1, learningGoal: "", media: [], activity: { title: "", instructions: "", reflection: "" }, rightsConfirmed: false });
export const emptyLessonDraft = (): LessonDraft => ({ module: 1, lessonSlug: authoringLessons[0][0].id, title: "", body: "", cohortId: "", package: emptyLessonPackage() });

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function text(value: unknown, label: string, min: number, max: number) {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) throw new Error(`${label} must contain ${min}–${max} characters.`);
  return value.trim();
}
function record(value: unknown) { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
export function safeLearningUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 1500) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password || !url.hostname.includes(".") || /[\u0000-\u0020]/.test(value)) return null;
    return url.href;
  } catch { return null; }
}
export function validateLessonDraft(payload: Record<string, unknown>, packageRequired = true): LessonDraft {
  const moduleNumber = Number(payload.module), lessonSlug = String(payload.lessonSlug ?? "");
  if (!Number.isInteger(moduleNumber) || !authoringLessons[moduleNumber - 1]?.some(lesson => lesson.id === lessonSlug)) throw new Error("Choose a lesson from the course.");
  const cohortId = payload.cohortId == null || payload.cohortId === "" ? "" : String(payload.cohortId);
  if (cohortId && !uuid.test(cohortId)) throw new Error("Choose a valid learning group.");
  const base = { module: moduleNumber, lessonSlug, cohortId, title: text(payload.title, "Title", 3, 180), body: text(payload.body, "Teaching text", 30, 16000) };
  if (!packageRequired) return { ...base, package: emptyLessonPackage() };
  const pkg = record(payload.package), activity = record(pkg.activity);
  if (pkg.schemaVersion !== 1 || !Array.isArray(pkg.media) || pkg.media.length > 6) throw new Error("Add up to six reading or video links to this lesson package.");
  if (pkg.rightsConfirmed !== true) throw new Error("Confirm permission to share these teaching materials before saving.");
  const media = pkg.media.map((entry: unknown): LessonMedia => {
    const item = record(entry), url = safeLearningUrl(item.url);
    if (!["reading", "video"].includes(String(item.kind)) || !url) throw new Error("Use a complete HTTPS reading or video link without login credentials.");
    return { kind: item.kind as LessonMedia["kind"], title: text(item.title, "Link title", 3, 160), url, accessibilityNote: text(item.accessibilityNote, "Accessible alternative or caption note", 10, 500) };
  });
  return { ...base, package: { schemaVersion: 1, learningGoal: text(pkg.learningGoal, "Learning goal", 10, 500), media, activity: { title: text(activity.title, "Activity title", 3, 160), instructions: text(activity.instructions, "Activity instructions", 30, 4000), reflection: text(activity.reflection, "Reflection question", 10, 500) }, rightsConfirmed: true } };
}

export function reviseLessonVersion(version: LessonVersion): LessonDraft {
  const pkg = version.package?.schemaVersion === 1 ? version.package as LessonPackage : emptyLessonPackage();
  return { module: version.module_number, lessonSlug: version.lesson_slug, title: version.title, body: version.body, cohortId: version.cohort_id ?? "", package: { ...pkg, media: pkg.media.map(item => ({ ...item })), activity: { ...pkg.activity } } };
}
