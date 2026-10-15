import { fireEvent,render,screen } from "@testing-library/react";
import { describe,expect,it,vi } from "vitest";
import { AssessmentAuthoringStudio } from "./assessment-authoring-studio";
import { baseAssessmentBanks,type AssessmentRelease } from "@/features/content-authoring/assessment-release";
describe("knowledge check authoring",()=>{
  it("saves an edited bank and bounded passing score as a new draft",()=>{
    const act=vi.fn().mockResolvedValue(undefined);const{container}=render(<AssessmentAuthoringStudio releases={[]} administrator={false} busy={false} act={act}/>);
    fireEvent.change(screen.getByLabelText("Passing score (%)"),{target:{value:"90"}});
    fireEvent.submit(container.querySelector("form")!);
    expect(act).toHaveBeenCalledWith("save_assessment_release",expect.objectContaining({module:1,passThresholdPercent:90,questions:baseAssessmentBanks[0]}),expect.any(String));
  });
  it("shows complete saved answers but reserves publication for administrators",()=>{
    const release:AssessmentRelease={id:"release",module_number:1,title:"Draft check",questions:baseAssessmentBanks[0],pass_threshold:90,version:1,status:"draft"};
    const view=render(<AssessmentAuthoringStudio releases={[release]} administrator={false} busy={false} act={vi.fn()}/>);
    expect(screen.queryByRole("button",{name:"Publish knowledge check version 1"})).not.toBeInTheDocument();
    view.rerender(<AssessmentAuthoringStudio releases={[release]} administrator busy={false} act={vi.fn()}/>);
    expect(screen.getByRole("button",{name:"Publish knowledge check version 1"})).toBeVisible();
  });
});
