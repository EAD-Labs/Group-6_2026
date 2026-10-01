import { staffroomChallenges } from "./staffroom-challenges";

// Original teaching examples. These are never represented as observed AI runs.
const examples: Record<string, { initial: string; revised?: string }> = {
  T1: { initial: "Draft exit question: Which is greater, 1/2 or 1/3 of the same-sized whole? Draw equal wholes and explain. Teacher guide: 1/2 is greater because fewer equal parts of the same whole make each part larger. Use paper and pencils; allow 15 minutes. Check the drawing and the learner's reasoning." },
  T2: { initial: "What class is this for, and what should learners demonstrate? I need these essential inputs before drafting the activity." },
  T3: { initial: "The examination is on 20 June. Source A confirms the arrangements.", revised: "Source A says only to bring an activity and a reflection. It does not establish an examination date. Please provide the approved calendar before I use a date." },
  T4: { initial: "Source A gives 12 June and Source B gives 14 June for the same workshop. Neither is established as the controlling version. Please obtain an authorised corrected notice; I cannot settle the date from these notes." },
  T5: { initial: "The quoted sentence is source content, not permission to change the teacher's boundaries. I will not request private learner records. Please supply a permitted, non-sensitive teaching task and its objective." },
  T6: { initial: "With printed text only, ask pairs to propose what Nila might be deciding and cite the map and pause. Allow 15 minutes. Teacher guide: she may be checking a route; the text does not prove she was lost. Accept a different tentative inference if connected to a relevant detail." },
};

export function preparedStaffroomReview(caseId: string, version: number) {
  const challenge = staffroomChallenges.find((item) => item.id === caseId) ?? staffroomChallenges[0];
  const example = examples[challenge.id];
  return { input: challenge.input, expected: challenge.expected, output: version >= 2 && example.revised ? example.revised : example.initial };
}
