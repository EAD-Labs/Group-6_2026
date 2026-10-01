export class RequestValidationError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export async function readJsonBody(request: Request, maxBytes = 64_000): Promise<Record<string, unknown>> {
  if (Number(request.headers.get("content-length")) > maxBytes) throw new RequestValidationError("This request is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestValidationError("A JSON request is required.");
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > maxBytes) { await reader.cancel(); throw new RequestValidationError("This request is too large.", 413); }
    chunks.push(value);
  }
  try {
    const combined = new Uint8Array(bytes);
    let offset = 0;
    chunks.forEach((chunk) => { combined.set(chunk, offset); offset += chunk.length; });
    const body = JSON.parse(new TextDecoder().decode(combined));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body;
  } catch { throw new RequestValidationError("A valid JSON object is required."); }
}

export function hasSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
