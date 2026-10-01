import type { QuizQuestion } from "@/features/learning/catalog";
import { isQuestionCorrect } from "@/features/learning/quiz";

export type CohortMember = { participant_id:string; cohort_id:string };
export type CohortRosterEntry = { id:string; display_name:string };
export type VerifiedSubmission = {
  participant_id:string; attempt_id:string; quiz_id:string; content_version:string;
  answers:Record<string,string[]>; verified_at:string;
};
export type ReportQuestionBank = { module:number; quizId:string; contentVersion:string; questions:QuizQuestion[] };
export const minimumQuestionRespondents = 3;
export type QuestionPattern = { module:number; questionId:string; question:string; concept:string; respondents:number; missed:number|null };

// One latest server-verified attempt per participant and current quiz version.
// Never expose selections, participant identifiers or attempt records in this result.
export function aggregateQuestionPatterns(members:CohortMember[], submissions:VerifiedSubmission[], banks:ReportQuestionBank[]):QuestionPattern[] {
  const ids=new Set(members.map(member=>member.participant_id));
  return banks.flatMap(bank=>{
    const latest=new Map<string,VerifiedSubmission>();
    for(const row of submissions) {
      if(!ids.has(row.participant_id)||row.quiz_id!==bank.quizId||row.content_version!==bank.contentVersion) continue;
      const previous=latest.get(row.participant_id);
      const time=Date.parse(row.verified_at), previousTime=previous?Date.parse(previous.verified_at):-Infinity;
      if(!Number.isFinite(time)) continue;
      if(!previous||time>previousTime||(time===previousTime&&row.attempt_id>previous.attempt_id)) latest.set(row.participant_id,row);
    }
    return bank.questions.map(question=>({
      module:bank.module,questionId:question.id,question:question.prompt,concept:question.concept,
      respondents:latest.size,
      missed:latest.size<minimumQuestionRespondents?null:[...latest.values()].filter(row=>!isQuestionCorrect(question,row.answers[question.id]??[])).length,
    }));
  });
}
export type ProgressRecord = { participant_id:string; module_id:string; status:string; best_score_percent:number|null };
export function aggregateProgress(members:CohortMember[], progress:ProgressRecord[]) {
  const ids=new Set(members.map(m=>m.participant_id));
  const scoped=progress.filter(p=>ids.has(p.participant_id));
  const modules=Array.from({length:4},(_,i)=>{
    const moduleId=`00000000-0000-4000-8000-${String(i+1).padStart(12,"0")}`;
    const rows=scoped.filter(p=>p.module_id===moduleId);
    const scores=rows.flatMap(p=>p.best_score_percent===null?[]:[p.best_score_percent]);
    return {module:i+1,passed:rows.filter(p=>p.status==="passed").length,started:rows.filter(p=>p.status!=="available"&&p.status!=="locked").length,meanScore:scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null};
  });
  const completed=[...ids].filter(id=>modules.every(m=>scoped.some(p=>p.participant_id===id&&p.module_id===`00000000-0000-4000-8000-${String(m.module).padStart(12,"0")}`&&p.status==="passed"))).length;
  return {participants:ids.size,completed,modules};
}
export function csvCell(value:unknown) {
  const text=String(value??"");
  return `"${(/^(?:\s*[=+@\-]|[\t\r])/.test(text)?"'":"")+text.replaceAll('"','""')}"`;
}
export function reportCsv(title:string, report:ReturnType<typeof aggregateProgress>) {
  return [["Cohort","Participants","Course completed","Module","Module passed","Module started","Mean best quiz score"],...report.modules.map(m=>[title,report.participants,report.completed,m.module,m.passed,m.started,m.meanScore??""])].map(row=>row.map(csvCell).join(",")).join("\r\n");
}

export function questionPatternsCsv(title:string, patterns:QuestionPattern[]) {
  return [["Cohort","Module","Question ID","Concept","Question","Participants with current-version attempt","Missed on latest attempt"],
    ...patterns.map(row=>[title,row.module,row.questionId,row.concept,row.question,row.respondents,row.missed])]
    .map(row=>row.map(csvCell).join(",")).join("\r\n");
}
