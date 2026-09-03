import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApiKeyForm } from "./api-key-form";

describe("ApiKeyForm", () => {
  it("stores a key only in the tab session and removes it", () => {
    render(<ApiKeyForm />);

    const input = screen.getByLabelText("Gemini API key");
    fireEvent.change(input, { target: { value: "pilot-secret-key" } });
    fireEvent.click(screen.getByRole("button", { name: "Use for this session" }));

    expect(window.sessionStorage.getItem("promptshala:gemini-api-key")).toBe(
      "pilot-secret-key",
    );
    expect(screen.getByText("A key is available for this tab session.")).toBeVisible();
    expect(input).toHaveValue("");
    expect(screen.queryByText("pilot-secret-key")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove key" }));

    expect(window.sessionStorage.getItem("promptshala:gemini-api-key")).toBeNull();
    expect(screen.getByText("No key is stored.")).toBeVisible();
  });

  it("does not store an empty value", () => {
    render(<ApiKeyForm />);

    fireEvent.click(screen.getByRole("button", { name: "Use for this session" }));

    expect(window.sessionStorage.getItem("promptshala:gemini-api-key")).toBeNull();
  });
});
