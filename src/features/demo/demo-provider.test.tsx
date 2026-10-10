import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DemoProvider, useDemo } from "./demo-provider";
import { initialDemoState } from "./demo-state";
import { sanitizeDemoState } from "./server-state";
import { writeScopedState, readScopedState } from "./scoped-state";
vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
const fetchMock = vi.fn();
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const record = (id: string, name = id) => ({ mode: "supabase", participantId: id, role: "participant", revision: 1, state: { ...initialDemoState, displayName: name } });
function Probe() {
  const { state, syncStatus, storageScope, updateState, retrySync, hydrated, syncConflicts, resolveSyncConflict, saveGoals } = useDemo();
  return <><p>{hydrated ? state.displayName : "Loading"}</p><p data-testid="status">{syncStatus}</p><p data-testid="scope">{storageScope}</p><button onClick={() => updateState((value) => ({ ...value, displayName: "Edited" }))}>Edit</button><button onClick={retrySync}>Retry</button><p>{state.assistants[0]?.purpose}</p><button disabled={!syncConflicts.length} onClick={() => resolveSyncConflict(syncConflicts[0].id, "remote")}>Use remote</button><button onClick={() => saveGoals({ aiFamiliarity: "Use it regularly", aiToolsUsed: ["Gemini", "Other"], aiToolOther: "School helper", aiUseFrequency: "Every week", currentAiUse: "Writing quiz questions", goals: ["Make quizzes and worksheets"] })}>Save AI experience</button></>;
}
beforeEach(() => { window.localStorage.clear(); fetchMock.mockReset(); vi.stubGlobal("fetch", fetchMock); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe("participant synchronization", () => {
  it("sends onboarding AI experience to the verified account and retains it in its cache", async () => {
    fetchMock.mockImplementation((_url, options) => options?.method === "PUT"
      ? Promise.resolve(response({ saved: true, state: JSON.parse(options.body).state, revision: 2 }))
      : Promise.resolve(response(record("alice"))));
    render(<DemoProvider><Probe /></DemoProvider>);
    await screen.findByText("alice");
    fireEvent.click(screen.getByRole("button", { name: "Save AI experience" }));
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("saved"));
    const writes = fetchMock.mock.calls.filter((call) => call[1]?.method === "PUT");
    expect(writes).toHaveLength(1);
    expect(JSON.parse(writes[0][1].body).state).toMatchObject({ aiToolsUsed: ["Gemini", "Other"], aiUseFrequency: "Every week", currentAiUse: "Writing quiz questions", onboardingCompleted: true });
    expect(readScopedState(window.localStorage, "participant:alice")?.state.aiToolOther).toBe("School helper");
    expect(readScopedState(window.localStorage, "participant:bob")).toBeNull();
  });
  it("does not display a previous account cache before or after identity resolution", async () => {
    writeScopedState(window.localStorage, "participant:alice", { state: { ...initialDemoState, displayName: "Alice private" }, baseline: initialDemoState, revision: 1, pending: true });
    let resolve!: (value: Response) => void;
    fetchMock.mockImplementation(() => new Promise((done) => { resolve = done; }));
    render(<DemoProvider><Probe /></DemoProvider>);
    expect(screen.queryByText("Alice private")).not.toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await act(async () => { resolve(response(record("bob", "Bob"))); });
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByTestId("scope")).toHaveTextContent("participant:bob");
  });
  it("retains a failed save and replays it after retry with a verified account", async () => {
    fetchMock.mockImplementation((_url, options) => options?.method === "PUT" ? Promise.resolve(response({ error: "offline save" }, 503)) : Promise.resolve(response(record("alice"))));
    render(<DemoProvider><Probe /></DemoProvider>);
    await screen.findByText("alice"); fireEvent.click(screen.getByText("Edit"));
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("error"));
    expect(readScopedState(window.localStorage, "participant:alice")?.pending).toBe(true);
    fetchMock.mockImplementation((_url, options) => {
      if (options?.method === "PUT") { const body = JSON.parse(options.body); return Promise.resolve(response({ saved: true, state: body.state, revision: 2 })); }
      return Promise.resolve(response(record("alice")));
    });
    fireEvent.click(screen.getByText("Retry"));
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("saved"));
    expect(screen.getByText("Edited")).toBeInTheDocument();
    expect(readScopedState(window.localStorage, "participant:alice")?.pending).toBe(false);
  });
  it("never submits an old account draft to a newly signed-in account", async () => {
    fetchMock.mockResolvedValue(response(record("alice")));
    render(<DemoProvider><Probe /></DemoProvider>);
    await screen.findByText("alice"); fireEvent.click(screen.getByText("Edit"));
    fetchMock.mockResolvedValue(response(record("bob")));
    fireEvent.click(screen.getByText("Retry"));
    await screen.findByText("bob");
    expect(readScopedState(window.localStorage, "participant:alice")?.state.displayName).toBe("Edited");
    expect(readScopedState(window.localStorage, "participant:bob")?.state.displayName).toBe("bob");
    expect(fetchMock.mock.calls.filter((call) => call[1]?.method === "PUT")).toHaveLength(0);
  });
});

it("pauses cloud writes for an unresolved same-field conflict and saves the explicit choice", async () => {
  const base = sanitizeDemoState({ assistants: [{ id: "00000000-0000-4000-8000-000000000999", name: "Teacher assistant", purpose: "Original purpose" }] });
  const local = { ...base, assistants: [{ ...base.assistants[0], purpose: "Local purpose" }] };
  const remote = { ...base, assistants: [{ ...base.assistants[0], purpose: "Remote purpose" }] };
  writeScopedState(window.localStorage, "participant:alice", { state: local, baseline: base, revision: 1, pending: true });
  fetchMock.mockImplementation((_url, options) => {
    if (options?.method === "PUT") return Promise.resolve(response({ saved: true, state: JSON.parse(options.body).state, revision: 3 }));
    return Promise.resolve(response({ ...record("alice"), state: remote, revision: 2 }));
  });
  render(<DemoProvider><Probe /></DemoProvider>);
  await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("conflict"));
  expect(readScopedState(window.localStorage, "participant:alice")?.conflicts).toHaveLength(1);
  expect(fetchMock.mock.calls.filter(call => call[1]?.method === "PUT")).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "Use remote" }));
  await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("saved"));
  expect(screen.getByText("Remote purpose")).toBeVisible();
  expect(readScopedState(window.localStorage, "participant:alice")?.conflicts).toEqual([]);
});
