import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { initialDemoState } from "@/features/demo/demo-state";
import { downloadFile } from "@/lib/download";
import CertificatePage from "./page";
vi.mock("@/features/demo/demo-provider", () => ({ useDemo: () => ({ state: initialDemoState, storageScope: "participant:sample", syncStatus: "saved", isPresentationDemo: false }) }));
vi.mock("@/components/app-shell", () => ({ AppShell: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("@/components/ui/hydration-gate", () => ({ HydrationGate: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("@/lib/download", () => ({ downloadFile: vi.fn() }));
const certificate = { id: "sample-record", participant_name: "Fictional Sample Teacher", issued_at: "2026-10-01T00:00:00Z", revoked_at: null };
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
describe("certificate download feedback", () => {
  it("keeps an unsupported-script error in the workspace instead of navigating to JSON", async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ certificate, eligible: true }))).mockResolvedValueOnce(new Response(JSON.stringify({ error: "This name uses an unsupported script. Contact your facilitator." }), { status: 422 }));
    vi.stubGlobal("fetch", fetch);
    render(<CertificatePage />);
    fireEvent.click(await screen.findByRole("button", { name: "Download certificate PDF" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Contact your facilitator");
    expect(downloadFile).not.toHaveBeenCalled();
    expect(screen.getByText("Fictional Sample Teacher")).toBeVisible();
  });
  it("requests the private PDF and restores the button after download preparation", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ certificate, eligible: true }))).mockResolvedValueOnce(new Response("%PDF sample", { headers: { "Content-Type": "application/pdf" } })));
    render(<CertificatePage />);
    fireEvent.click(await screen.findByRole("button", { name: "Download certificate PDF" }));
    await waitFor(() => expect(downloadFile).toHaveBeenCalledWith(expect.any(Blob), "PromptShala-certificate.pdf"));
    expect(screen.getByRole("button", { name: "Download certificate PDF" })).toBeEnabled();
  });
});
