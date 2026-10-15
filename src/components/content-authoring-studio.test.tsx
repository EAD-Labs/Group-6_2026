import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContentAuthoringStudio } from "./content-authoring-studio";
import { LessonPackagePreview } from "./lesson-package-preview";
import { emptyLessonPackage, type LessonVersion } from "@/features/content-authoring/lesson-package";

describe("teacher-friendly content authoring",()=>{
  const version:LessonVersion={id:"draft-id",module_number:1,lesson_slug:"meet-generative-ai",title:"A source check",body:"Read the source and check every answer before using the worksheet.",version:1,status:"draft",cohort_id:"group-id",package:emptyLessonPackage()};
  it("shows the learner preview and audience without allowing content managers to publish",()=>{
    const act=vi.fn();render(<ContentAuthoringStudio versions={[version]} scopes={[{id:"group-id",title:"October teachers"}]} administrator={false} busy={false} act={act}/>);
    expect(screen.queryByRole("button",{name:"Publish version 1"})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Revise as a new draft"}));
    expect(screen.getByText("Unpublished preview · October teachers")).toBeVisible();
    expect(screen.getByLabelText("Who should see this update?")).toHaveValue("group-id");
    expect(act).not.toHaveBeenCalled();
  });
  it("keeps revision and publication separate and exposes archive for administrators",()=>{
    const act=vi.fn().mockResolvedValue(undefined);render(<ContentAuthoringStudio versions={[version]} scopes={[]} administrator busy={false} act={act}/>);
    fireEvent.click(screen.getByRole("button",{name:"Publish version 1"}));
    expect(act).toHaveBeenCalledWith("publish_content",{id:"draft-id"},expect.any(String));
    expect(screen.getByRole("button",{name:"Archive draft"})).toBeVisible();
  });
  it("renders plain text safely and excludes unsafe links from saved package previews",()=>{
    const pkg=emptyLessonPackage();pkg.media=[{kind:"video",title:"Unsafe resource",url:"javascript:alert(1)",accessibilityNote:"A text alternative is available."}];
    const {container}=render(<LessonPackagePreview title="Check sources" body="<script>alert('no')</script>" lessonPackage={pkg}/>);
    expect(container.querySelector("script")).toBeNull();expect(screen.getByText("<script>alert('no')</script>")).toBeVisible();
    expect(screen.queryByRole("link",{name:/Unsafe resource/})).not.toBeInTheDocument();
  });
  it("opens a collapsed resource section when browser validation finds a missing field",()=>{
    render(<ContentAuthoringStudio versions={[]} scopes={[]} administrator busy={false} act={vi.fn()}/>);
    fireEvent.click(screen.getByText("Reading and video links (0 of 6)"));
    fireEvent.click(screen.getByRole("button",{name:"Add a reading or video"}));
    const field=screen.getByLabelText("Link title"),details=field.closest("details");
    details?.removeAttribute("open");fireEvent.invalid(field);
    expect(details).toHaveAttribute("open");
  });
});
