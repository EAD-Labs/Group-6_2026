"use client";

import { useEffect,useState } from "react";
import { useDemo } from "@/features/demo/demo-provider";

export function PublishedContent({module,lessonSlug}:{module:number;lessonSlug:string}) {
  const {isPresentationDemo}=useDemo();
  const [content,setContent]=useState<{title:string;body:string;version:number}|null>(null);
  useEffect(()=>{if(isPresentationDemo)return; const controller=new AbortController(); fetch(`/api/content?module=${module}&lesson=${encodeURIComponent(lessonSlug)}`,{signal:controller.signal}).then(r=>r.ok?r.json():null).then(p=>setContent(p?.content??null)).catch(()=>undefined);return()=>controller.abort();},[module,lessonSlug,isPresentationDemo]);
  if(!content)return null;
  return <section className="course-activity published-content"><span className="eyebrow">From your course team · Version {content.version}</span><h2>{content.title}</h2>{content.body.split(/\n\s*\n/).map((p,i)=><p key={i} style={{whiteSpace:"pre-wrap"}}>{p}</p>)}</section>;
}
