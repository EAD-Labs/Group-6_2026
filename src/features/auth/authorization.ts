export const appRoles = ["participant", "facilitator", "content_manager", "admin"] as const;

export type AppRole = (typeof appRoles)[number];

export type RouteAccessDecision = "allow" | "forbidden" | "sign_in";

type RouteAccessInput = {
  hasVerifiedIdentity: boolean;
  pathname: string;
  role: AppRole | null;
};

const authenticatedRoutePrefixes = [
  "/admin",
  "/dashboard",
  "/learn",
  "/onboarding",
  "/profile",
  "/progress",
  "/settings",
  "/staff",
  "/certificate",
];

export function isPathWithin(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function requiresAuthentication(pathname: string) {
  return authenticatedRoutePrefixes.some((prefix) =>
    isPathWithin(pathname, prefix),
  );
}

export function getRouteAccessDecision({
  hasVerifiedIdentity,
  pathname,
  role,
}: RouteAccessInput): RouteAccessDecision {
  if (!requiresAuthentication(pathname)) {
    return "allow";
  }

  if (!hasVerifiedIdentity) {
    return "sign_in";
  }

  if (isPathWithin(pathname, "/admin") || isPathWithin(pathname, "/staff")) {
    if (role === "admin") return "allow";
    const isStaff = role === "facilitator" || role === "content_manager";
    if (isStaff && (pathname === "/admin" || pathname === "/staff" ||
      isPathWithin(pathname, "/admin/content") || isPathWithin(pathname, "/staff/content"))) return "allow";
    if (role === "facilitator" && (isPathWithin(pathname, "/admin/reports") || isPathWithin(pathname, "/staff/reports"))) return "allow";
    return "forbidden";
  }

  return "allow";
}

export function getSafePostAuthPath(
  requestedPath: string | null,
  fallbackPath = "/dashboard",
) {
  if (
    !requestedPath ||
    !requestedPath.startsWith("/") ||
    requestedPath.startsWith("//") ||
    requestedPath.includes("\\")
  ) {
    return fallbackPath;
  }

  const parsedPath = new URL(requestedPath, "https://promptshala.local");

  if (parsedPath.origin !== "https://promptshala.local") {
    return fallbackPath;
  }

  return `${parsedPath.pathname}${parsedPath.search}${parsedPath.hash}`;
}
