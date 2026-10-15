"use client";

import { useEffect,useState } from "react";
import { useDemo } from "@/features/demo/demo-provider";
import { type LessonPackage } from "@/features/content-authoring/lesson-package";
import { LessonPackagePreview } from "./lesson-package-preview";

type PublishedLesson={id:string;title:string;body:string;version:number;cohort_id:string|null;package:LessonPackage|Record<string,never>};

export function PublishedContent({module,lessonSlug}:{module:number;lessonSlug:string}) {
  const {isPresentationDemo,storageScope}=useDemo();
  const identity=`${storageScope}:${module}:${lessonSlug}`;
  const [loaded,setLoaded]=useState<{identity:string;contents:PublishedLesson[]}|null>(null);
  useEffect(()=>{if(isPresentationDemo)return; const controller=new AbortController(); fetch(`/api/content?module=${module}&lesson=${encodeURIComponent(lessonSlug)}`,{signal:controller.signal}).then(r=>r.ok?r.json():null).then(p=>{if(!controller.signal.aborted)setLoaded({identity,contents:p?.contents??(p?.content?[p.content]:[])});}).catch(()=>undefined);return()=>controller.abort();},[module,lessonSlug,isPresentationDemo,identity]);
  const contents=loaded?.identity===identity?loaded.contents:[];
  if(isPresentationDemo||!contents.length)return null;
  return <>{contents.map(content=><section className="course-activity published-content" key={`${module}:${lessonSlug}:${content.id}`}><span className="eyebrow">{content.cohort_id?"For your learning group":"From your course team"} · Version {content.version}</span><LessonPackagePreview title={content.title} body={content.body} lessonPackage={content.package} heading="h2" /></section>)}</>;
}
