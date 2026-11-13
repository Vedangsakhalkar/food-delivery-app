import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  { name: "home", path: "/" },
  { name: "search", path: "/search?q=biryani" },
  { name: "login", path: "/login" },
  { name: "sign up", path: "/signup" },
  { name: "forgot password", path: "/forgot-password" },
  { name: "privacy", path: "/privacy" },
  { name: "not found", path: "/definitely-not-a-page" },
  { name: "access denied", path: "/access-denied" },
];

for (const { name, path } of PAGES) {
  test(`${name} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(
      serious.map(
        (v) =>
          `${v.id}: ${v.help} -> ${v.nodes.map((n) => n.target.join(" ") + " " + (n.any[0]?.message ?? "")).join(" | ")}`,
      ),
      `violations on ${path}`,
    ).toEqual([]);
  });
}

test("pages are usable at phone width without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const path of ["/", "/login", "/signup", "/privacy"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(0);
  }
});

test("security headers are present and the page loads without CSP violations", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (m) => {
    if (m.text().includes("Content Security Policy")) violations.push(m.text());
  });
  const res = await page.goto("/");
  expect(res?.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(res?.headers()["x-frame-options"]).toBe("DENY");
  await page.waitForLoadState("networkidle");
  expect(violations).toEqual([]);
});
