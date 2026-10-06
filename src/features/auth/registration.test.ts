import { describe, expect, it } from "vitest";
import { validateRegistration } from "./registration";
const valid = { name: "Teacher Example", email: "teacher@example.com", password: "Long pilot password", confirmation: "Long pilot password", acknowledged: true };
describe("pilot registration", () => {
  it("accepts independent email/password registration", () => expect(validateRegistration(valid)).toBeNull());
  it.each([
    [{ email: "not-an-email" }, "email"], [{ password: "short" }, "password"],
    [{ confirmation: "different password" }, "confirmation"], [{ acknowledged: false }, "acknowledgement"], [{ name: " " }, "name"],
  ])("rejects invalid input: %j", (change, reason) => expect(validateRegistration({ ...valid, ...change })).toBe(reason));
});
