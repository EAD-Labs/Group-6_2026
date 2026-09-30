import { notFound } from "next/navigation";
import { ModuleLessonExperience } from "@/components/module-lesson-experience";
import { moduleThreeLessons } from "@/features/learning/module-three-content";

export function generateStaticParams() { return moduleThreeLessons.map((lesson) => ({ slug: lesson.id })); }

export default async function ModuleThreeLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!moduleThreeLessons.some((lesson) => lesson.id === slug)) notFound();
  return <ModuleLessonExperience module={3} slug={slug} />;
}
