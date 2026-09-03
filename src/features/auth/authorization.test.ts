import { describe, expect, it } from "vitest";

import {
  getRouteAccessDecision,
  getSafePostAuthPath,
  requiresAuthentication,
} from "./authorization";

describe("authentication route rules", () => {
  it.each(["/", "/sign-in", "/auth/callback"])(
    "keeps the public route %s available",
    (pathname) => {
      expect(requiresAuthentication(pathname)).toBe(false);
      expect(
        getRouteAccessDecision({
          hasVerifiedIdentity: false,
          pathname,
          role: null,
        }),
      ).toBe("allow");
    },
  );

  it.each([
    "/dashboard",
    "/dashboard/profile",
    "/learn/module-1",
    "/settings/api-key",
    "/admin",
  ])("requires a verified identity for %s", (pathname) => {
    expect(requiresAuthentication(pathname)).toBe(true);
    expect(
      getRouteAccessDecision({
        hasVerifiedIdentity: false,
        pathname,
        role: null,
      }),
    ).toBe("sign_in");
  });

  it("does not protect paths that only share a text prefix", () => {
    expect(requiresAuthentication("/dashboard-public")).toBe(false);
    expect(requiresAuthentication("/learning-resources")).toBe(false);
  });
});

describe("role authorization", () => {
  it("allows a participant to access participant routes", () => {
    expect(
      getRouteAccessDecision({
        hasVerifiedIdentity: true,
        pathname: "/learn/module-1",
        role: "participant",
      }),
    ).toBe("allow");
  });

  it("forbids a participant from admin routes", () => {
    expect(
      getRouteAccessDecision({
        hasVerifiedIdentity: true,
        pathname: "/admin/reports",
        role: "participant",
      }),
    ).toBe("forbidden");
  });

  it("allows an administrator to access admin routes", () => {
    expect(
      getRouteAccessDecision({
        hasVerifiedIdentity: true,
        pathname: "/admin/reports",
        role: "admin",
      }),
    ).toBe("allow");
  });
});

describe("post-authentication redirects", () => {
  it.each([
    ["/dashboard", "/dashboard"],
    ["/learn/module-1?resume=true", "/learn/module-1?resume=true"],
    ["https://attacker.example", "/dashboard"],
    ["//attacker.example/path", "/dashboard"],
    ["/\\attacker.example", "/dashboard"],
    [null, "/dashboard"],
  ])("normalizes %s to %s", (requestedPath, expectedPath) => {
    expect(getSafePostAuthPath(requestedPath)).toBe(expectedPath);
  });
});
