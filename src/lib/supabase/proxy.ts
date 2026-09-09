import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { requiresAuthentication } from "@/features/auth/authorization";
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

  return response;
}
