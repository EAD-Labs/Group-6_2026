import { safeLearningUrl, type LessonPackage } from "@/features/content-authoring/lesson-package";

export function LessonPackagePreview({ title, body, lessonPackage, heading = "h3" }: { title: string; body: string; lessonPackage?: LessonPackage | Record<string, never>; heading?: "h2" | "h3" }) {
  const Heading = heading, Subheading = heading === "h2" ? "h3" : "h4", pkg = lessonPackage?.schemaVersion === 1 ? lessonPackage as LessonPackage : null;
  return <>
    <Heading>{title || "Your lesson update"}</Heading>
    {pkg?.learningGoal ? <p><strong>What you will practise:</strong> {pkg.learningGoal}</p> : null}
    {body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index} style={{ whiteSpace: "pre-wrap" }}>{paragraph}</p>)}
    {pkg?.media.length ? <div><Subheading>Watch or read</Subheading><ul>{pkg.media.map((item, index) => <li key={`${item.url}:${index}`}>{safeLearningUrl(item.url) ? <a className="text-link" href={item.url} target="_blank" rel="noopener noreferrer">{item.title} <span className="visually-hidden">(opens in a new tab)</span></a> : <span>{item.title}</span>} <small>· {item.kind === "video" ? "Video" : "Reading"}</small><p>{item.accessibilityNote}</p></li>)}</ul></div> : null}
    {pkg?.activity.title ? <div className="course-activity"><Subheading>{pkg.activity.title}</Subheading><p style={{ whiteSpace: "pre-wrap" }}>{pkg.activity.instructions}</p><p><strong>Pause and reflect:</strong> {pkg.activity.reflection}</p><small>Use fictional classroom details. This activity is for practice and does not change your course completion requirements.</small></div> : null}
  </>;
}
