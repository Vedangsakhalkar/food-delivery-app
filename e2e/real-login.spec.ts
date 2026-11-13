import { expect, test } from "@playwright/test";
import { cleanup, createUser, e2eReady, type TestUser } from "./support/fixtures";

const hasPublishableKey = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith("sb_publishable_"),
);

/** Drives the real login form in the browser (needs the project's publishable key). */
test.describe("real login with the publishable key", () => {
  test.skip(!e2eReady || !hasPublishableKey, "needs the Supabase publishable key");
  let user: TestUser;
  test.beforeAll(async () => {
    user = await createUser("customer", "Login Tester");
  });
  test.afterAll(async () => {
    if (user) await cleanup([user]);
  });

  test("wrong password shows an error, right password logs in and out", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill("not-the-password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("Invalid email or password")).toBeVisible();

    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("button", { name: /Login Tester/ })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("button", { name: /Login Tester/ })).toBeVisible();

    await page.getByRole("button", { name: /Login Tester/ }).click();
    await page.getByRole("menuitem", { name: "Log out" }).click();
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
  });
});
