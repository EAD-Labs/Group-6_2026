import { notFound } from "next/navigation";
import { ModuleLessonExperience } from "@/components/module-lesson-experience";
import { moduleTwoLessons } from "@/features/learning/module-two-content";

export function generateStaticParams() { return moduleTwoLessons.map((lesson) => ({ slug: lesson.id })); }

export default async function ModuleTwoLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!moduleTwoLessons.some((lesson) => lesson.id === slug)) notFound();
  return <ModuleLessonExperience module={2} slug={slug} />;
}
