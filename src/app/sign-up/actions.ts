"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasPublicSupabaseEnvironment } from "@/lib/env";
import { validateRegistration } from "@/features/auth/registration";

export async function signUp(formData: FormData) {
  const input = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    confirmation: String(formData.get("confirmation") ?? ""),
    acknowledged: formData.get("acknowledgement") === "on",
  };
  const invalid = validateRegistration(input);
  if (invalid) redirect(`/sign-up?error=${invalid}`);
  if (!hasPublicSupabaseEnvironment() || !process.env.NEXT_PUBLIC_SITE_URL) redirect("/sign-up?error=service");
  const client = await createClient();
  const { data, error } = await client.auth.signUp({
    email: input.email, password: input.password,
    options: {
      emailRedirectTo: `${new URL(process.env.NEXT_PUBLIC_SITE_URL).origin}/auth/callback?next=/onboarding/safe-use`,
      data: { display_name: input.name },
    },
  });
  if (error) {
    const reason = error.code === "user_already_exists" ? "existing" : error.status === 429 ? "rate" : "service";
    redirect(`/sign-up?error=${reason}`);
  }
  if (data.session) redirect("/onboarding/safe-use");
  redirect("/sign-up?sent=1");
}
