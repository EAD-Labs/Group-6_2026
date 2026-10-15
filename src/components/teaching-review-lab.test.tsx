import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TeachingReviewLab } from "./teaching-review-lab";
afterEach(cleanup);
function rateObjective(container: HTMLElement) {
  fireEvent.change(container.querySelector("#original-objective-score")!, { target: { value: "3" } });
  fireEvent.change(container.querySelector("#original-objective-evidence")!, { target: { value: "Evidence supporting the original fictional activity." } });
}
describe("ratings belong to the exact reviewed material and teaching context", () => {
  it("preserves a review until a newer parent draft is explicitly imported", () => {
    const first = "First fictional teaching draft with enough material to review.";
    const latest = "Latest fictional teaching draft with a different classroom activity.";
    const { container, rerender } = render(<TeachingReviewLab initialMaterial={first} />);
    rateObjective(container);
    rerender(<TeachingReviewLab initialMaterial={latest} />);
    expect(screen.getByLabelText("Material to review")).toHaveValue(first);
    expect(container.querySelector("#original-objective-score")).toHaveValue("3");
    fireEvent.click(screen.getByRole("button", { name: "Review latest teaching draft" }));
    expect(screen.getByLabelText("Material to review")).toHaveValue(latest);
    expect(container.querySelector("#original-objective-score")).toHaveValue("");
    expect(container.querySelector("#original-objective-evidence")).toHaveValue("");
  });
  it.each(["Learners", "Learning objective", "Source or answer-key evidence", "Material to review"])("clears obsolete ratings when %s changes", label => {
    const { container } = render(<TeachingReviewLab />);
    rateObjective(container);
    fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value: "A changed fictional classroom context or source." } });
    expect(container.querySelector("#original-objective-score")).toHaveValue("");
    expect(container.querySelector("#original-objective-evidence")).toHaveValue("");
  });
  it("clears entered audience and objectives along with the material and evidence", () => {
    render(<TeachingReviewLab />);
    fireEvent.change(screen.getByLabelText("Learners", { exact: true }), { target: { value: "Private fictional learner group" } });
    fireEvent.change(screen.getByLabelText("Source or answer-key evidence"), { target: { value: "Private fictional source evidence" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear this review" }));
    for (const label of ["Learners", "Learning objective", "Source or answer-key evidence", "Material to review"]) expect(screen.getByLabelText(label, { exact: true })).toHaveValue("");
  });
});
