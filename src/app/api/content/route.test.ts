import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({participant:vi.fn(),from:vi.fn()}));
vi.mock("server-only",()=>({}));
vi.mock("@/features/platform/server",async()=>({ ...await vi.importActual<typeof import("@/features/platform/server")>("@/features/platform/server"), requireParticipant:mocks.participant }));
import { GET } from "./route";

beforeEach(()=>{vi.clearAllMocks();mocks.participant.mockResolvedValue({client:{from:mocks.from},user:{id:"ordinary-participant"}});});
describe("participant lesson updates",()=>{
  it("reads through the ordinary participant session, selects published versions and shows global before scoped updates",async()=>{
    const scoped={id:"scoped",cohort_id:"group",version:1,title:"Group activity"},global={id:"global",cohort_id:null,version:2,title:"Course update"};
    const query={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),order:vi.fn().mockResolvedValue({data:[scoped,global],error:null})};mocks.from.mockReturnValue(query);
    const response=await GET(new Request("https://example.test/api/content?module=1&lesson=meet-generative-ai"));
    expect(response.status).toBe(200);expect(mocks.from).toHaveBeenCalledWith("content_versions");
    expect(query.eq).toHaveBeenCalledWith("status","published");expect(query.eq).toHaveBeenCalledWith("module_number",1);
    const result=await response.json();expect(result.contents.map((item:{id:string})=>item.id)).toEqual(["global","scoped"]);
    expect(result.content.id).toBe("global");expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it.each(["module=9&lesson=real-lesson","module=1&lesson=%3Cscript%3E"])("rejects malformed lesson filters %s",async params=>{
    expect((await GET(new Request(`https://example.test/api/content?${params}`))).status).toBe(400);expect(mocks.from).not.toHaveBeenCalled();
  });
});
