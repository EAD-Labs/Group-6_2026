import { notFound } from "next/navigation";

import { LessonExperience } from "@/components/lesson-experience";
import { getLessonBySlug, moduleOneLessons } from "@/features/learning/catalog";

type LessonPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return moduleOneLessons.map((lesson) => ({ slug: lesson.slug }));
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  return <LessonExperience lesson={lesson} />;
}
