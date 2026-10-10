import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDemo } from "@/features/demo/demo-provider";
import { GeminiKeyProvider, useGeminiKey } from "./gemini-key-provider";

vi.mock("@/features/demo/demo-provider", () => ({ useDemo: vi.fn() }));
const testKey = "test_gemini_key_for_memory_only";
function Controls() {
  const { enabled, setKey, requestHeaders } = useGeminiKey();
  return <><button onClick={() => setKey(testKey)}>Connect</button><span>{enabled ? "Connected" : "Course connection"}</span><output>{JSON.stringify(requestHeaders())}</output></>;
}
function identity(participantId: string | null) {
  vi.mocked(useDemo).mockReturnValue({ participantId } as ReturnType<typeof useDemo>);
}
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); identity("alice"); });
describe("private Gemini connection lifetime", () => {
  it("keeps a key in memory and clears it when signing out", () => {
    render(<GeminiKeyProvider><Controls /></GeminiKeyProvider>);
    fireEvent.click(screen.getByText("Connect"));
    expect(screen.getByText("Connected")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(testKey);
    expect(localStorage.length).toBe(0); expect(sessionStorage.length).toBe(0);
    fireEvent(window, new Event("promptshala:signout"));
    expect(screen.getByText("Course connection")).toBeVisible();
    expect(screen.getByRole("status")).not.toHaveTextContent(testKey);
  });
  it("never forwards the previous account's key after an identity change", () => {
    const view = render(<GeminiKeyProvider><Controls /></GeminiKeyProvider>);
    fireEvent.click(screen.getByText("Connect"));
    identity("bob"); view.rerender(<GeminiKeyProvider><Controls /></GeminiKeyProvider>);
    expect(screen.getByText("Course connection")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("{}");
    identity("alice"); view.rerender(<GeminiKeyProvider><Controls /></GeminiKeyProvider>);
    expect(screen.getByRole("status")).toHaveTextContent("{}");
  });
});
