import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { AiExperienceFields, type AiExperienceAnswers } from "./ai-experience-fields";
import { emptyAiExperience } from "@/features/demo/ai-experience";

function ExperienceForm() {
  const [value, setValue] = useState<AiExperienceAnswers>({ ...emptyAiExperience, aiFamiliarity: "New to AI" });
  return <><AiExperienceFields value={value} onChange={(changes) => setValue((previous) => ({ ...previous, ...changes }))} /><output data-testid="answers">{JSON.stringify(value)}</output></>;
}

describe("beginner-friendly AI experience questions", () => {
  it("supports several familiar tools and a reversible exclusive no-experience choice", () => {
    render(<ExperienceForm />);
    fireEvent.click(screen.getByRole("checkbox", { name: "ChatGPT" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Gemini" }));
    fireEvent.change(screen.getByRole("textbox", { name: /What do you use AI for today/ }), { target: { value: "Making quizzes" } });
    fireEvent.click(screen.getByRole("radio", { name: "Every week" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "None yet" }));
    expect(screen.getByRole("checkbox", { name: "ChatGPT" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Gemini" })).not.toBeChecked();
    expect(screen.queryByRole("textbox", { name: /What do you use AI for today/ })).not.toBeInTheDocument();
    expect(screen.getByText(/We’ll start with the basics/)).toBeVisible();
    expect(JSON.parse(screen.getByTestId("answers").textContent!)).toMatchObject({ aiToolsUsed: ["None yet"], currentAiUse: "", aiUseFrequency: "Not yet" });
    fireEvent.click(screen.getByRole("checkbox", { name: "Claude" }));
    expect(screen.getByRole("checkbox", { name: "None yet" })).not.toBeChecked();
    expect(screen.getByRole("textbox", { name: /What do you use AI for today/ })).toBeVisible();
  });

  it("only requests another tool name when Other is selected and clears it when deselected", () => {
    render(<ExperienceForm />);
    expect(screen.queryByRole("textbox", { name: /Which other tool/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Other" }));
    fireEvent.change(screen.getByRole("textbox", { name: /Which other tool/ }), { target: { value: "School assistant" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Other" }));
    expect(JSON.parse(screen.getByTestId("answers").textContent!)).toMatchObject({ aiToolsUsed: [], aiToolOther: "" });
  });
});
