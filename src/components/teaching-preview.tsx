"use client";

import { useState } from "react";
import { Icon } from "./ui/icon";
import styles from "@/app/page.module.css";

const examples = [
  { label: "Plan a lesson", request: "Help me plan a 30-minute lesson on plants for Class 5. Include a simple activity using things in the classroom.", title: "Plants, all around us", subtitle: "Class 5 · 30-minute lesson", steps: [{ title: "Start with a question", text: "What plants did you notice on your way to school?" }, { title: "Explore together", text: "Observe a leaf. Find its shape, colour, and veins." }, { title: "Check understanding", text: "Ask students to draw and label the parts of a plant." }] },
  { label: "Make a quiz", request: "Write three short questions about the parts of a plant for Class 5. Include the answers so I can check them.", title: "A quick plant quiz", subtitle: "Class 5 · 3 questions", steps: [{ title: "Which part absorbs water?", text: "Answer: the roots." }, { title: "What does the stem do?", text: "Answer: supports the plant and carries water." }, { title: "Where does a plant make food?", text: "Answer: mainly in its leaves." }] },
  { label: "Explain a topic", request: "Explain how plants make food to Class 5 students. Use simple words and a familiar example.", title: "A plant’s little kitchen", subtitle: "Class 5 · Simple explanation", steps: [{ title: "Begin with something familiar", text: "We need food to grow. Plants need food too." }, { title: "Connect it to the idea", text: "Leaves use sunlight, water, and air to make food." }, { title: "Invite a question", text: "What might happen to a plant kept in the dark?" }] },
];

export function TeachingPreview() {
  const [selected,setSelected] = useState(0);
  const example = examples[selected];
  return <div className={styles.previewWrap}>
    <div className={styles.preview}>
      <div className={styles.previewToolbar}><span className={styles.previewMark}><Icon name="sparkles" /></span><div><strong>A little teaching inspiration</strong><small>See what a clear request can look like</small></div><span className={styles.exampleBadge}>Example</span></div>
      <div className={styles.previewTabs} role="group" aria-label="Choose a classroom example">{examples.map((item,index) => <button aria-pressed={selected === index} key={item.label} onClick={() => setSelected(index)} type="button">{item.label}</button>)}</div>
      <div className={styles.request}><span className={styles.previewLabel}><Icon name="user" />Your request to AI</span><p>{example.request}</p></div>
      <div className={styles.previewResult} aria-live="polite" aria-atomic="true"><span className={styles.previewLabel}><Icon name="sparkles" />A starting point for your lesson</span><h2>{example.title}</h2><span className={styles.resultMeta}>{example.subtitle}</span><ol>{example.steps.map((step,index) => <li key={step.title}><span>{index+1}</span><div><strong>{step.title}</strong><p>{step.text}</p></div></li>)}</ol></div>
      <div className={styles.previewFooter}><Icon name="shield" /><span>You review. You decide. Your teaching comes first.</span></div>
    </div>
    <span className={styles.previewCaption}><span />Illustrative example · No AI request is sent</span>
  </div>;
}
