import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDemo } from "@/features/demo/demo-provider";
import { GeminiKeyProvider } from "./gemini-key-provider";
import { GeminiConnection } from "./gemini-connection";

vi.mock("@/features/demo/demo-provider", () => ({ useDemo: vi.fn() }));
beforeEach(() => { vi.mocked(useDemo).mockReturnValue({ participantId: "alice" } as ReturnType<typeof useDemo>); });
describe("optional Gemini connection controls", () => {
  it("masks and clears the pasted key, then lets the user remove the connection", () => {
    render(<GeminiKeyProvider><GeminiConnection /></GeminiKeyProvider>);
    expect(screen.getByText("No personal key added")).toBeVisible();
    const input = screen.getByLabelText("Your Gemini API key");
    expect(input).toHaveAttribute("type", "password");
    fireEvent.change(input, { target: { value: "AQ.a_private_gemini_authorization_key_for_test" } });
    fireEvent.click(screen.getByRole("button", { name: "Use my key" }));
    expect(input).toHaveValue("");
    expect(screen.getByText("Your key is ready for AI requests")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Your next AI request will use it");
    fireEvent.click(screen.getByRole("button", { name: "Remove my key" }));
    expect(screen.getByText("No personal key added")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Remove my key" })).not.toBeInTheDocument();
  });
  it("blocks incomplete keys and directs signed-out users to sign in", () => {
    const view = render(<GeminiKeyProvider><GeminiConnection /></GeminiKeyProvider>);
    fireEvent.change(screen.getByLabelText("Your Gemini API key"), { target: { value: "short" } });
    expect(screen.getByRole("button", { name: "Use my key" })).toBeDisabled();
    expect(screen.getByLabelText("Your Gemini API key")).toHaveAttribute("aria-invalid", "true");
    vi.mocked(useDemo).mockReturnValue({ participantId: null } as ReturnType<typeof useDemo>);
    view.rerender(<GeminiKeyProvider><GeminiConnection /></GeminiKeyProvider>);
    expect(screen.getByRole("link", { name: "Sign in to add a key" })).toHaveAttribute("href", "/sign-in");
    expect(screen.queryByLabelText("Your Gemini API key")).not.toBeInTheDocument();
  });
});
