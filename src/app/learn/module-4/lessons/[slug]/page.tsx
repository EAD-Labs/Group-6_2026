import { notFound } from "next/navigation";
import { ModuleLessonExperience } from "@/components/module-lesson-experience";
import { moduleFourLessons } from "@/features/learning/module-four-content";

export function generateStaticParams() { return moduleFourLessons.map((lesson) => ({ slug: lesson.id })); }

export default async function ModuleFourLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!moduleFourLessons.some((lesson) => lesson.id === slug)) notFound();
  return <ModuleLessonExperience module={4} slug={slug} />;
}
