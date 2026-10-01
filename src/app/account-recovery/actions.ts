"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasPublicSupabaseEnvironment } from "@/lib/env";

export async function requestRecovery(formData:FormData) {
  const email=String(formData.get("email")??"").trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)redirect("/account-recovery?error=email");
  if(!hasPublicSupabaseEnvironment())redirect("/account-recovery?error=service");
  const base=process.env.NEXT_PUBLIC_SITE_URL;
  if(!base||!/^https?:\/\//.test(base))redirect("/account-recovery?error=service");
  const client=await createClient();
  // A uniform response avoids revealing whether the address has an account.
  await client.auth.resetPasswordForEmail(email,{redirectTo:`${new URL(base).origin}/auth/callback?next=/reset-password`});
  redirect("/account-recovery?sent=1");
}
export async function updatePassword(formData:FormData) {
  const password=String(formData.get("password")??""),confirmation=String(formData.get("confirmation")??"");
  if(password.length<12||password.length>128||password!==confirmation)redirect("/reset-password?error=validation");
  if(!hasPublicSupabaseEnvironment())redirect("/reset-password?error=session");
  const client=await createClient();const {data,error}=await client.auth.getUser();
  if(error||!data.user)redirect("/reset-password?error=session");
  const result=await client.auth.updateUser({password});
  if(result.error)redirect("/reset-password?error=update");
  await client.auth.signOut();redirect("/sign-in?passwordUpdated=1");
}
