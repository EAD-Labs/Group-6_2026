import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

test("a visitor can improve a request, prepare a source draft and review it without an account", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", r => { if (r.method() !== "GET") writes.push(r.url()); });
  await page.goto("/try");
  await page.getByRole("button", { name: "Check my request" }).click();
  await expect(page.getByRole("status")).toContainText("Checklist signals");
  await page.getByRole("button", { name: "Try a clearer example" }).click();
  await page.getByRole("button", { name: "Check my request" }).click();
  await expect(page.getByRole("status")).toContainText("Previous check");
  await page.getByRole("button", { name: "Next: prepare a draft" }).click();
  await page.getByRole("button", { name: "Prepare my draft" }).click();
  await expect(page.getByLabel("Make it right for your learners")).toHaveValue(/\[S1\]/);
  await page.getByRole("button", { name: "Next: review before use" }).click();
  await expect(page.getByLabel("Material to review")).toHaveValue(/Evaporation classroom draft/);
  await page.locator("#original-evidence-evidence").fill("Source checked against the fictional passage.");
  await page.getByRole("button", { name: "Write a clear request" }).click();
  await page.getByRole("button", { name: "Review before use" }).click();
  await expect(page.locator("#original-evidence-evidence")).toHaveValue("Source checked against the fictional passage.");
  await page.getByRole("button", { name: "Start over", exact: true }).click();
  await expect(page.getByLabel("Your request")).toHaveValue("Explain evaporation.");
  expect(writes.filter(url => new URL(url).pathname.startsWith("/api/"))).toEqual([]);
});

test("review exports contain actual evidence and never export an incomplete score", async ({ page }, testInfo) => {
  await page.goto("/review-lab");
  await page.getByRole("button", { name: "Download my review" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("Rate every criterion");
  for (const id of ["objective", "evidence", "learner-fit", "accessibility", "safe-use"]) {
    await page.locator(`#original-${id}-score`).selectOption("2");
    await page.locator(`#original-${id}-evidence`).fill(`Reviewed ${id}: fictional classroom evidence and a concrete change.`);
  }
  const waiting = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my review" }).click();
  const download = await waiting, destination = testInfo.outputPath("review.json");
  await download.saveAs(destination);
  const record = JSON.parse(await readFile(destination, "utf8"));
  expect(record.schemaVersion).toBe("teaching-review/1"); expect(record.original.summary.score).toBe(67);
  expect(record.original.ratings.evidence.evidence).toContain("fictional classroom evidence");
  expect(record.revision).toBeNull();
  await page.getByRole("button", { name: "Clear this review" }).click();
  await expect(page.getByLabel("Material to review")).toHaveValue("");
  await expect(page.getByLabel("Learners", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Learning objective", { exact: true })).toHaveValue("");
});

test("rubric adaptation rejects unsafe structure and resets ratings on a valid import", async ({ page }) => {
  await page.goto("/review-lab");
  await page.getByText("Use this review in another subject or course", { exact: true }).click();
  const input = page.getByLabel("Load your rubric JSON");
  await input.setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from('{"criteria":[]}') });
  await expect(page.locator("main").getByRole("alert")).toBeVisible();
  const criteria = ["source", "language", "privacy"].map(id => ({ id, label: `Check ${id}`, question: `What evidence supports ${id}?`, weight: 2, critical: true }));
  await input.setInputFiles({ name: "rubric.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ id: "other-course", version: "1.0", title: "Another course review", criteria })) });
  await expect(page.getByText("Another course review · 1.0", { exact: true })).toBeVisible();
  await expect(page.locator("#original-source-score")).toHaveValue("");
  await expect(page.getByRole("status").first()).toContainText("3 checks still need evidence");
});

test("public paths expose no personal key or learner-only access", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Try without an account" }).click();
  await expect(page).toHaveURL(/\/try$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in/);
});

test("visitor and review pages have no automated WCAG A/AA violations or horizontal overflow", async ({ page }) => {
  for (const url of ["/try", "/review-lab"]) {
    await page.goto(url);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(result.violations).toEqual([]);
  }
});

test("keyboard visitors can reach the main content and every practice step", async ({ page, browserName }) => {
  await page.goto("/try");
  await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  const second = page.getByRole("button", { name: "Prepare a teaching draft" });
  await second.focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Start with your teaching notes." })).toBeVisible();
});

test("a review opened before drafting preserves evidence until the visitor imports the latest draft", async ({ page }) => {
  await page.goto("/try");
  await page.getByRole("button", { name: "Review before use", exact: true }).click();
  const original = page.getByLabel("Material to review"), oldMaterial = await original.inputValue();
  await page.locator("#original-evidence-score").selectOption("2");
  await page.locator("#original-evidence-evidence").fill("Checked this earlier fictional source before making a draft.");
  await page.getByLabel("Compare a revised draft").check();
  await page.getByLabel("Revised material").fill("An earlier revision with a different fictional classroom observation.");
  await page.getByRole("button", { name: "Prepare a teaching draft", exact: true }).click();
  await page.getByRole("button", { name: "Prepare my draft" }).click();
  const latest = await page.getByLabel("Make it right for your learners").inputValue();
  await page.getByRole("button", { name: "Next: review before use" }).click();
  await expect(original).toHaveValue(oldMaterial);
  await expect(page.locator("#original-evidence-score")).toHaveValue("2");
  await expect(page.getByLabel("Compare a revised draft")).toBeChecked();
  await page.getByRole("button", { name: "Review latest teaching draft" }).click();
  await expect(original).toHaveValue(latest);
  await expect(page.locator("#original-evidence-score")).toHaveValue("");
  await expect(page.locator("#original-evidence-evidence")).toHaveValue("");
  await expect(page.getByLabel("Compare a revised draft")).not.toBeChecked();
  await page.getByLabel("Compare a revised draft").check();
  await expect(page.getByLabel("Revised material")).toHaveValue("");
});

test("changing reviewed material invalidates ratings and refreshing clears private visitor work", async ({ page }) => {
  await page.goto("/review-lab");
  await page.locator("#original-objective-score").selectOption("3");
  await page.locator("#original-objective-evidence").fill("Evidence from the original fictional learning activity.");
  await page.getByLabel("Material to review").fill("A different fictional activity that needs a fresh teacher review.");
  await expect(page.locator("#original-objective-score")).toHaveValue("");
  await expect(page.locator("#original-objective-evidence")).toHaveValue("");
  await page.reload();
  await expect(page.getByLabel("Material to review")).not.toHaveValue(/different fictional activity/);
  await page.goto("/try");
  await page.getByLabel("Your request").fill("PRIVATE FICTIONAL REQUEST THAT SHOULD NOT PERSIST");
  await page.reload();
  await expect(page.getByLabel("Your request")).toHaveValue("Explain evaporation.");
  expect(await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }))).not.toContain("PRIVATE FICTIONAL REQUEST");
});

test("a complete revision export records comparable ratings and resolved critical checks", async ({ page }, testInfo) => {
  await page.goto("/review-lab");
  await page.getByLabel("Compare a revised draft").check();
  await page.getByLabel("Revised material").fill("A revised fictional evaporation activity with checked sources, an answer guide and an accessible spoken response option.");
  for (const id of ["objective", "evidence", "learner-fit", "accessibility", "safe-use"]) {
    await page.locator(`#original-${id}-score`).selectOption(id === "evidence" ? "1" : "2");
    await page.locator(`#original-${id}-evidence`).fill(`Original ${id}: a source or classroom adaptation still needs checking.`);
    await page.locator(`#revised-${id}-score`).selectOption("3");
    await page.locator(`#revised-${id}-evidence`).fill(`Revised ${id}: independently checked fictional source and concrete revision.`);
  }
  await expect(page.getByText(/This reflects your ratings; it does not measure learner improvement/)).toBeVisible();
  const waiting = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my review" }).click();
  const destination = testInfo.outputPath("revised-review.json");
  await (await waiting).saveAs(destination);
  const record = JSON.parse(await readFile(destination, "utf8"));
  expect(record.original.summary.blockers).toEqual(["evidence"]);
  expect(record.revision.summary.score).toBe(100);
  expect(record.comparison.resolvedCriticalChecks).toEqual(["evidence"]);
  expect(record.comparison.scoreChange).toBe(100 - record.original.summary.score);
});
