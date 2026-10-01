// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ requireParticipant: vi.fn(), from: vi.fn(), select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(), build: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/features/platform/server", async (original) => ({ ...await original<typeof import("@/features/platform/server")>(), requireParticipant: mocks.requireParticipant }));
vi.mock("@/features/platform/certificate-pdf", async (original) => ({ ...await original<typeof import("@/features/platform/certificate-pdf")>(), buildCertificatePdf: mocks.build }));
import { CertificateNameError } from "@/features/platform/certificate-pdf";
import { RequestError } from "@/features/platform/server";
import { GET } from "./route";
const id = "20000000-0000-4000-8000-000000000001";
const record = { id, participant_name: "Sample Teacher", issued_at: "2026-10-01", rule_version: "2026-09-open-course-v1", revoked_at: null };
beforeEach(() => {
  vi.clearAllMocks();
  const query = { select: mocks.select, eq: mocks.eq, maybeSingle: mocks.maybeSingle };
  for (const method of [mocks.from, mocks.select, mocks.eq]) method.mockReturnValue(query);
  mocks.requireParticipant.mockResolvedValue({ user: { id: "account-owner" }, client: { from: mocks.from } });
  mocks.maybeSingle.mockResolvedValue({ data: record, error: null });
  mocks.build.mockResolvedValue(new TextEncoder().encode("%PDF-sample"));
});
const request = () => new Request("https://example.invalid/api/certificate/download?participant_id=other-account");

describe("private certificate download", () => {
  it("uses the authenticated owner, selects minimal fields, and can be downloaded repeatedly without writes", async () => {
    const first = await GET(request());
    const second = await GET(request());
    expect(first.status).toBe(200);
    expect(await second.text()).toBe("%PDF-sample");
    expect(mocks.eq).toHaveBeenCalledWith("participant_id", "account-owner");
    expect(mocks.eq).toHaveBeenCalledWith("rule_version", "2026-09-open-course-v1");
    expect(mocks.select).toHaveBeenCalledWith("id,participant_name,issued_at,revoked_at,rule_version");
    expect(mocks.build).toHaveBeenCalledWith(record, expect.objectContaining({ latin: expect.any(Uint8Array), devanagari: expect.any(Uint8Array) }), `https://example.invalid/verify/${id}`);
    expect(first.headers.get("content-type")).toBe("application/pdf");
    expect(first.headers.get("content-disposition")).toBe(`attachment; filename="PromptShala-${id}.pdf"`);
    expect(first.headers.get("cache-control")).toBe("private, no-store");
    expect(first.headers.get("x-content-type-options")).toBe("nosniff");
  });
  it("requires authentication before accessing a record", async () => {
    mocks.requireParticipant.mockRejectedValue(new RequestError(401, "Sign in"));
    expect((await GET(request())).status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it.each([[null, 404], [{ ...record, revoked_at: "2026-10-02" }, 410]])("refuses missing or revoked records", async (data, status) => {
    mocks.maybeSingle.mockResolvedValue({ data, error: null });
    expect((await GET(request())).status).toBe(status);
    expect(mocks.build).not.toHaveBeenCalled();
  });
  it("returns a readable font-support error instead of an invalid PDF", async () => {
    mocks.build.mockRejectedValue(new CertificateNameError("This script needs a suitable font."));
    const response = await GET(request());
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ error: "This script needs a suitable font." });
  });
});
