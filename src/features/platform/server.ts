import "server-only";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasPublicSupabaseEnvironment } from "@/lib/env";

export class RequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function requireParticipant() {
  if (!hasPublicSupabaseEnvironment()) throw new RequestError(503, "Account services are not connected. Your guided practice remains available.");
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new RequestError(401, "Sign in to your participant account to continue.");
  return { client, user: data.user };
}

export async function requireStaff() {
  const { client, user } = await requireParticipant();
  const { data: profile, error } = await client.from("profiles").select("role,display_name").eq("id",user.id).single();
  if (error || !profile || !["admin","facilitator","content_manager"].includes(profile.role)) throw new RequestError(403, "This workspace is available to authorised programme staff.");
  let admin;
  try { admin = createAdminClient(); } catch { throw new RequestError(503,"The secure programme service needs to be configured."); }
  return { client, admin, user, role: profile.role as "admin"|"facilitator"|"content_manager", name: profile.display_name as string };
}

export async function readBody(request: Request, limit = 80000): Promise<Record<string,unknown>> {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new RequestError(403,"Please submit from this website.");
  if (!request.headers.get("content-type")?.includes("application/json")) throw new RequestError(415,"Use a JSON request.");
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400,"The request is empty.");
  let bytes=0; let text=""; const decoder=new TextDecoder();
  while (true) { const part=await reader.read(); if (part.done) break; bytes+=part.value.byteLength; if (bytes>limit) { await reader.cancel(); throw new RequestError(413,"This request is too large. Shorten the material and try again."); } text+=decoder.decode(part.value,{stream:true}); }
  text+=decoder.decode();
  try { const value=JSON.parse(text); if (!value || typeof value!=="object" || Array.isArray(value)) throw new Error(); return value; } catch { throw new RequestError(400,"The request could not be read."); }
}

export function textField(value:unknown, name:string, min:number,max:number) {
  if (typeof value!=="string" || value.trim().length<min || value.trim().length>max) throw new RequestError(400,`${name} must contain ${min}–${max} characters.`);
  return value.trim();
}
export const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function uuidField(value:unknown,name="Record") { if(typeof value!=="string"||!uuidPattern.test(value)) throw new RequestError(400,`${name} is invalid.`); return value; }
export function failure(error:unknown) {
  if (error instanceof RequestError) return NextResponse.json({error:error.message},{status:error.status,headers:{"Cache-Control":"no-store"}});
  // No provider response, source material or database internals are logged.
  console.error(JSON.stringify({event:"platform_request_failed",requestId:crypto.randomUUID()}));
  return NextResponse.json({error:"We could not complete that request. Your work is unchanged; please try again."},{status:503,headers:{"Cache-Control":"no-store"}});
}
export function json(value:unknown) { return NextResponse.json(value,{headers:{"Cache-Control":"no-store"}}); }
