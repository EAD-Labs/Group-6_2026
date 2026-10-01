export const transformationFormats=[{id:"summary",label:"Source summary"},{id:"worksheet",label:"Worksheet"},{id:"quiz",label:"Knowledge check"},{id:"study-guide",label:"Study guide"},{id:"slides",label:"Slide outline"},{id:"audio-script",label:"Audio script"}] as const;
export type TransformationFormat=typeof transformationFormats[number]["id"];
export type SourcePassage={id:string;text:string};
export type TransformationInput={title:string;source:string;format:TransformationFormat;audience:string;objective:string;permission:"own"|"licensed"|"public-domain";safe:boolean};
export const transformationReview=["Every factual claim is supported by the source.","Questions and answers have been independently checked.","Language and difficulty fit these learners.","The activity serves the intended learning objective.","The material contains no identifiable learner information.","I have permission to use and share the material."];
export function sourcePassages(source:string):SourcePassage[] {
  const passages: string[] = [];
  for (let paragraph of source.trim().split(/\n\s*\n/).filter(Boolean)) {
    while (paragraph.length > 1800) {
      const boundary = paragraph.slice(0, 1801).search(/\s+\S*$/);
      const end = boundary > 0 ? boundary : 1800;
      passages.push(paragraph.slice(0, end).trim());
      paragraph = paragraph.slice(end).trimStart();
    }
    if (paragraph.trim()) passages.push(paragraph.trim());
  }
  return passages.map((text, i) => ({ id: `S${i + 1}`, text }));
}
export function validateTransformation(value:unknown):TransformationInput {
  if(!value||typeof value!=="object")throw new Error("Add your source and teaching brief.");
  const raw=value as Record<string,unknown>;
  function field(name:string,min:number,max:number,label:string){const v=raw[name];if(typeof v!=="string"||v.trim().length<min||v.length>max)throw new Error(`${label} needs ${min}–${max} characters.`);return v.trim();}
  const title=field("title",3,120,"Source title"),source=field("source",80,20000,"Source text"),audience=field("audience",3,160,"Audience"),objective=field("objective",10,500,"Learning objective");
  if(!transformationFormats.some(f=>f.id===raw.format))throw new Error("Choose an output format.");
  if(!["own","licensed","public-domain"].includes(String(raw.permission))||raw.safe!==true)throw new Error("Confirm source permission and remove identifiable learner information first.");
  return {title,source,audience,objective,format:raw.format as TransformationFormat,permission:raw.permission as TransformationInput["permission"],safe:true};
}
/** An extractive scaffold, intentionally not represented as an AI-authored answer. */
export function buildSourceScaffold(input:TransformationInput) {
  const passages=sourcePassages(input.source);
  const selected=passages.slice(0,6);
  const excerpts=selected.map(p=>`[${p.id}] ${p.text}`).join("\n\n");
  const heading=`# ${input.title}\n\nAudience: ${input.audience}\nLearning objective: ${input.objective}\n`;
  const sourceNote="\n\n## Teacher review\nCheck every claim against the numbered source passages. This is a source-based scaffold; questions and teaching instructions still need your adaptation and review.";
  const bodies:Record<TransformationFormat,string>={
    summary:`## Source extracts\n${excerpts}\n\n## Your concise explanation\nRewrite the relevant extracts in language your learners understand. Preserve qualifications and distinguish observations from explanations.`,
    worksheet:`## Read and notice\n${excerpts}\n\n## Work with the evidence\n1. State one claim in your own words. Give its source number.\n2. Underline the passage that supports it. Explain the connection.\n3. What does this source leave unanswered?\n\n## Apply the idea\nTeacher: add a new example aligned with the learning objective. Write and verify the expected answer before use.`,
    quiz:`## Question bank to adapt\n${selected.map((p,i)=>`${i+1}. What does passage [${p.id}] tell us? Restate its main claim without adding new facts.\nEvidence for your answer key: ${p.text}\nTeacher: write and independently verify the expected response.`).join("\n\n")}\n\n## Check uncertainty\nWhich question cannot be answered from this source? Explain what further evidence would be needed.`,
    "study-guide":`## Evidence to learn from\n${excerpts}\n\n## Explain it without looking\nFor each source number, write a one-sentence explanation, then compare it with the original.\n\n## Connections and limits\nExplain how two passages connect. Record one uncertainty the material cannot resolve.`,
    slides:`## Slide 1 — The learning question\n${input.objective}\n\n${selected.map((p,i)=>`## Slide ${i+2} — Evidence [${p.id}]\n${p.text}\nSpeaker note: explain this passage in your own words and invite a learner question.`).join("\n\n")}\n\n## Final slide — Check understanding\nAsk learners to explain one claim and cite the source passage.`,
    "audio-script":`## Opening\nToday we are working towards this goal: ${input.objective}\n\n${selected.map(p=>`## Source segment [${p.id}]\nRead or paraphrase this verified passage: ${p.text}\n[Pause. Ask learners to explain the idea in their own words.]`).join("\n\n")}\n\n## Closing\nWhat can you explain using the source, and what still needs further evidence?`,
  };
  return {draft:heading+"\n"+bodies[input.format]+sourceNote,passages,source:"extractive" as const};
}
export function exportTransformation(input:TransformationInput,draft:string,checks:string[]) {
  return `# ${input.title} — Teacher resource\n\nFormat: ${input.format}\nAudience: ${input.audience}\nObjective: ${input.objective}\nSource permission: ${input.permission}\n\n## Editable classroom draft\n\n${draft}\n\n## Original source passages\n\n${sourcePassages(input.source).map(p=>`### ${p.id}\n${p.text}`).join("\n\n")}\n\n## Teacher review\n\n${transformationReview.map(c=>`- [${checks.includes(c)?"x":" "}] ${c}`).join("\n")}\n\nThis is a teacher-prepared resource, not a certificate or a guarantee of factual correctness.\n`;
}
