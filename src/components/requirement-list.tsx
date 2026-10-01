import type { Route } from "next";
import Link from "next/link";
import type { LearningRequirement } from "./learning-plan";
import { Icon } from "./ui/icon";

export function RequirementList({ requirements, incompleteOnly = false }: { requirements: LearningRequirement[]; incompleteOnly?: boolean }) {
  const visible = incompleteOnly ? requirements.filter((item) => !item.complete) : requirements;
  return <ul className="requirement-list">{visible.map((item) => <li className={item.complete ? "complete" : "pending"} key={item.label}><span aria-label={item.complete ? "Complete" : "To do"}><Icon name={item.complete ? "check" : "clock"} /></span>{item.complete ? <span>{item.label}</span> : <Link href={item.href as Route}>{item.label}<Icon name="arrow-right" /></Link>}</li>)}</ul>;
}
