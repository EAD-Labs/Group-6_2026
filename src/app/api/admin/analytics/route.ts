import { failure, json, RequestError, requireStaff, uuidField } from "@/features/platform/server";

export async function GET(request: Request) {
  try {
    const { admin, user, role } = await requireStaff();
    if (role !== "admin") throw new RequestError(403, "Only administrators can view individual learning activity.");
    const params = new URL(request.url).searchParams;
    const participant = params.get("participant");
    if (participant) {
      const id = uuidField(participant, "Participant");
      const page = Number(params.get("eventsPage") ?? 0);
      if (!Number.isSafeInteger(page) || page < 0 || page > 100_000) throw new RequestError(400, "Invalid activity page.");
      const [detail, events] = await Promise.all([
        admin.rpc("admin_learning_detail", { p_actor: user.id, p_participant: id }),
        admin.from("learning_events").select("id,kind,path,target,module_number,question_id,selected_options,correct,active_ms,occurred_at,attempt_id,content_version", { count: "exact" })
          .eq("participant_id", id).order("occurred_at", { ascending: false }).order("id").range(page * 50, page * 50 + 49),
      ]);
      if (detail.error || events.error) throw new RequestError(503, "Learning reports are temporarily unavailable.");
      return json({ ...detail.data, events: events.data, eventsTotal: events.count, eventsPage: page });
    }
    const search = params.get("search")?.trim() ?? "";
    const page = Number(params.get("page") ?? 0);
    if (search.length > 100 || !Number.isSafeInteger(page) || page < 0 || page > 100_000) throw new RequestError(400, "Invalid participant search.");
    const result = await admin.rpc("admin_learning_roster", { p_actor: user.id, p_search: search, p_page: page });
    if (result.error) throw new RequestError(503, "Participant reports are temporarily unavailable.");
    return json(result.data);
  } catch (error) { return failure(error); }
}
