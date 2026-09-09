"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { hasPublicSupabaseEnvironment } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { presentationDemoCookie } from "@/lib/supabase/proxy";

export async function startPresentationDemo() {
  const cookieStore = await cookies();
  cookieStore.set(presentationDemoCookie, "active", {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/onboarding/safe-use?fresh=1");
}

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
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/sign-in?error=invalid");
  }

  redirect("/dashboard");
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(presentationDemoCookie);

  if (hasPublicSupabaseEnvironment()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/sign-in");
}
