import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDemo } from "@/features/demo/demo-provider";
import { initialDemoState } from "@/features/demo/demo-state";
import TransformPage from "@/app/learn/module-4/transform/page";

vi.mock("@/features/demo/demo-provider", () => ({ useDemo: vi.fn() }));
vi.mock("./app-shell", () => ({ AppShell: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("./ui/hydration-gate", () => ({ HydrationGate: ({ children }: { children: ReactNode }) => <>{children}</> }));
const resource = { id: "resource-1", title: "Water changes", source_text: "Evaporation changes liquid water into water vapour at the surface. It can happen below the boiling point.", audience: "Class 6 science", objective: "Explain evaporation using an everyday observation.", output_format: "worksheet", draft: "A saved worksheet for a class exploring evaporation.", permission: "own", reviewed: true, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 30 * 86400000).toISOString() };

beforeEach(() => {
  localStorage.clear();
  vi.mocked(useDemo).mockReturnValue({ state: initialDemoState, storageScope: "participant:alice", participantId: "alice", isPresentationDemo: false, hydrated: true } as ReturnType<typeof useDemo>);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("teacher resource workspace", () => {
  it("opens the complete saved teaching brief and keeps the resource if deletion fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ resources: [resource] }) }).mockResolvedValueOnce({ ok: false, json: async () => ({ error: "The deletion service is unavailable." }) }));
    render(<TransformPage />);
    fireEvent.click(screen.getByRole("button", { name: "Load saved resources" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Open resource" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Open resource" }));
    expect(screen.getByRole("textbox", { name: "Who is this for?" })).toHaveValue(resource.audience);
    expect(screen.getByRole("textbox", { name: "What should learners be able to do?" })).toHaveValue(resource.objective);
    expect(screen.getByRole("textbox", { name: "Editable draft" })).toHaveValue(resource.draft);
    expect(screen.getByRole("textbox", { name: "Paste your source text" })).toHaveValue(resource.source_text);
    fireEvent.click(screen.getByText("Delete", { selector: "summary" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete this resource" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("The deletion service is unavailable."));
    expect(screen.getByRole("textbox", { name: "Editable draft" })).toHaveValue(resource.draft);
    expect(screen.getByRole("button", { name: "Open resource" })).toBeEnabled();
  });

  it("creates a local scaffold without calling an AI service and resets review checks after edits", async () => {
    const request = vi.fn(); vi.stubGlobal("fetch", request);
    const mounted = render(<TransformPage />);
    fireEvent.change(screen.getByRole("textbox", { name: "Source title" }), { target: { value: resource.title } });
    fireEvent.change(screen.getByRole("textbox", { name: "Who is this for?" }), { target: { value: resource.audience } });
    fireEvent.change(screen.getByRole("textbox", { name: "What should learners be able to do?" }), { target: { value: resource.objective } });
    fireEvent.change(screen.getByRole("textbox", { name: "Paste your source text" }), { target: { value: resource.source_text } });
    fireEvent.change(screen.getByRole("combobox", { name: "Permission to use this material" }), { target: { value: "own" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "I checked that this contains no identifiable learner information." }));
    fireEvent.click(screen.getByRole("button", { name: "Create source scaffold" }));
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Editable draft" })).toBeVisible());
    expect(request).not.toHaveBeenCalled();
    const check = screen.getByRole("checkbox", { name: "Every factual claim is supported by the source." });
    fireEvent.click(check); expect(check).toBeChecked();
    fireEvent.change(screen.getByRole("textbox", { name: "Who is this for?" }), { target: { value: "Class 7 science" } });
    expect(check).not.toBeChecked();
    const localDraft = screen.getByRole("textbox", { name: "Editable draft" }).textContent;
    mounted.unmount();
    render(<TransformPage />);
    expect(screen.getByRole("textbox", { name: "Source title" })).toHaveValue(resource.title);
    expect(screen.getByRole("textbox", { name: "Who is this for?" })).toHaveValue("Class 7 science");
    expect(screen.getByRole("textbox", { name: "Editable draft" })).toHaveValue(localDraft);
  });
});
