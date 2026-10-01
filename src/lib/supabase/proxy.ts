import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { appRoles, getRouteAccessDecision, isPathWithin, requiresAuthentication, type AppRole } from "@/features/auth/authorization";
import {
  getPublicSupabaseEnvironment,
  hasPublicSupabaseEnvironment,
} from "@/lib/env";

export const presentationDemoCookie = "promptshala_presentation_demo";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const isProtectedRoute = requiresAuthentication(request.nextUrl.pathname);
  const hasPresentationSession =
    request.cookies.get(presentationDemoCookie)?.value === "active";

  if (hasPresentationSession) {
    if (isPathWithin(request.nextUrl.pathname, "/admin") || isPathWithin(request.nextUrl.pathname, "/staff")) {
      const accessUrl = request.nextUrl.clone();
      accessUrl.pathname = "/access-denied";
      accessUrl.search = "";
      return NextResponse.redirect(accessUrl);
    }
    return response;
  }

  if (!hasPublicSupabaseEnvironment()) {
    if (!isProtectedRoute) {
      return response;
    }

    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/sign-in";
    signInUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  const { publishableKey, url } = getPublicSupabaseEnvironment();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims && isProtectedRoute) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/sign-in";
    signInUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (data?.claims && (isPathWithin(request.nextUrl.pathname, "/admin") || isPathWithin(request.nextUrl.pathname, "/staff"))) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.claims.sub).maybeSingle();
    const role: AppRole | null = profile && appRoles.includes(profile.role) ? profile.role : null;
    if (getRouteAccessDecision({ hasVerifiedIdentity: true, pathname: request.nextUrl.pathname, role }) !== "allow") {
      const accessUrl = request.nextUrl.clone();
      accessUrl.pathname = "/access-denied";
      accessUrl.search = "";
      return NextResponse.redirect(accessUrl);
    }
  }

  return response;
}
