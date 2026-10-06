"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Route } from "next";

import { hasPublicSupabaseEnvironment } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

import { getSafePostAuthPath } from "@/features/auth/authorization";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/sign-in?error=missing");
  }

  if (!hasPublicSupabaseEnvironment()) {
    redirect("/sign-in?error=configuration");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(error.code === "email_not_confirmed" ? "/sign-in?error=unconfirmed" : "/sign-in?error=invalid");
  }

  (await cookies()).delete("promptshala_presentation_demo");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  const destination = String(formData.get("next") ?? "");
  redirect((destination === "/dashboard" && profile?.role === "admin" ? "/admin" : getSafePostAuthPath(destination)) as Route);
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("promptshala_presentation_demo");

  if (hasPublicSupabaseEnvironment()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/sign-in");
}
