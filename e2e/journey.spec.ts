import { expect, test, type Browser, type BrowserContext } from "@playwright/test";
import { cleanup, createUser, e2eReady, signInContext, type TestUser } from "./support/fixtures";

/**
 * The core journey end to end, against the real dev database:
 * owner creates a restaurant and menu -> customer orders (cash on delivery) -> owner accepts and
 * delivers -> customer sees "Delivered" and leaves a review.
 */
test.describe("order journey", () => {
  test.skip(
    !e2eReady,
    "needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and a database URL",
  );
  test.describe.configure({ mode: "serial" });

  const tag = crypto.randomUUID().slice(0, 8);
  const restaurantName = `E2E Kitchen ${tag}`;
  let baseURL = "";
  let owner: TestUser;
  let customer: TestUser;
  let ownerCtx: BrowserContext;
  let customerCtx: BrowserContext;

  async function login(browser: Browser, user: TestUser) {
    const ctx = await browser.newContext({ baseURL });
    await signInContext(ctx, user, baseURL);
    return ctx;
  }

  test.beforeAll(async ({ browser }, info) => {
    baseURL = info.project.use.baseURL!;
    owner = await createUser("owner", "Olive Owner");
    customer = await createUser("customer", "Asha Customer");
    ownerCtx = await login(browser, owner);
    customerCtx = await login(browser, customer);
  });

  test.afterAll(async () => {
    await ownerCtx?.close();
    await customerCtx?.close();
    if (owner && customer) await cleanup([owner, customer]);
  });

  test("owner creates a restaurant that goes live immediately", async () => {
    const page = await ownerCtx.newPage();
    await page.goto("/owner/restaurant");
    await page.getByLabel("Name").fill(restaurantName);
    await page.getByLabel("Cuisine").fill("E2E Fusion");
    await page.getByLabel("Address").fill("1 Test Road, Pune");
    await page.getByLabel("Opens at").fill("00:00");
    await page.getByLabel("Closes at").fill("23:59");
    await page.getByRole("button", { name: "Create restaurant" }).click();
    await expect(page.getByText("Your restaurant is live!")).toBeVisible();
    await expect(page.getByText("Status: Live")).toBeVisible();
  });

  test("owner adds a category and a menu item", async () => {
    const page = await ownerCtx.newPage();
    await page.goto("/owner/menu");
    await page.getByRole("button", { name: "+ Category" }).click();
    await page.getByPlaceholder("Category name").fill("Mains");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Mains" })).toBeVisible();

    await page.getByRole("link", { name: "+ Item" }).click();
    await page.getByLabel("Name").fill("Test Biryani");
    await page.getByLabel("Price (₹)").fill("200");
    await page.getByRole("button", { name: "Save item" }).click();
    await expect(page.getByText("Test Biryani")).toBeVisible();
    await expect(page.getByText("₹200")).toBeVisible();
  });

  test("a guest is sent to log in when adding to the cart", async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.getByRole("link", { name: new RegExp(restaurantName) }).click();
    await expect(page.getByRole("heading", { name: restaurantName })).toBeVisible();
    await page.waitForResponse((r) => r.url().includes("/api/me"));
    await page.getByRole("button", { name: "ADD" }).click();
    await expect(page).toHaveURL(/\/login\?next=/);
    await ctx.close();
  });

  test("customer places a cash-on-delivery order", async () => {
    const page = await customerCtx.newPage();
    const addr = await customerCtx.request.post("/api/me/addresses", {
      data: { label: "Home", line1: "12 Baner Road", city: "Pune", pincode: "411045" },
    });
    expect(addr.status()).toBe(201);

    await page.goto("/");
    await page.getByRole("link", { name: new RegExp(restaurantName) }).click();
    await page.waitForResponse((r) => r.url().includes("/api/me"));
    await page.getByRole("button", { name: "ADD" }).click();
    await expect(page.getByRole("link", { name: "Cart (1)" })).toBeVisible();

    await page.getByRole("link", { name: "Cart (1)" }).click();
    await expect(page.getByText("Test Biryani")).toBeVisible();
    // 200 + 5% tax (10) + 30 delivery
    await expect(page.getByLabel("Price summary")).toContainText("₹240");
    await page.getByRole("link", { name: "Proceed to checkout" }).click();

    await expect(page.getByText("Cash on delivery (only option in MVP)")).toBeVisible();
    await page.getByLabel("Delivery instructions").fill("Ring twice");
    await page.getByRole("button", { name: "Place order" }).click();
    await expect(page.getByRole("heading", { name: "Order placed!" })).toBeVisible();
    await expect(page.getByText("Pay ₹240 on delivery")).toBeVisible();
  });

  test("owner accepts and delivers the order", async () => {
    const page = await ownerCtx.newPage();
    await page.goto("/owner/orders");
    await expect(page.getByText("Asha Customer")).toBeVisible();
    const steps = [
      ["Accept", "Order marked accepted"],
      ["Start preparing", "Order marked preparing"],
      ["Out for delivery", "Order marked out for delivery"],
      ["Mark delivered", "Order marked delivered"],
    ] as const;
    for (const [action, toast] of steps) {
      await page.getByRole("button", { name: action, exact: true }).click();
      await expect(page.getByText(toast, { exact: true })).toBeVisible();
    }
    await page.goto("/owner/history");
    await expect(page.getByText("Delivered")).toBeVisible();
  });

  test("customer sees the delivery and leaves a review shown on the restaurant", async () => {
    const page = await customerCtx.newPage();
    await page.goto("/orders");
    await page.getByRole("link", { name: new RegExp(restaurantName) }).click();
    await expect(page.getByLabel("Order progress").getByText("Delivered")).toBeVisible();

    await page.getByRole("link", { name: "Rate this order" }).click();
    await page.getByRole("radio", { name: "5 stars" }).click();
    await page.getByLabel("Your review (optional)").fill("Fantastic e2e biryani");
    await page.getByRole("button", { name: "Submit review" }).click();
    await expect(page).toHaveURL(/\/orders$/);

    await page.goto("/");
    await page.getByRole("link", { name: new RegExp(restaurantName) }).click();
    await expect(page.getByRole("heading", { name: "Reviews" })).toBeVisible();
    await expect(page.getByText("Fantastic e2e biryani")).toBeVisible();
    await expect(page.getByText("5.0 ★").first()).toBeVisible();
  });

  test("role protection: a customer cannot open owner or admin pages", async () => {
    const page = await customerCtx.newPage();
    await page.goto("/owner/orders");
    await expect(page).toHaveURL(/access-denied/);
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/access-denied/);
    const api = await customerCtx.request.get("/api/admin/orders");
    expect(api.status()).toBe(403);
  });
});

test("sign-up form shows inline validation errors without calling the server", async ({ page }) => {
  await page.goto("/signup");
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByText("Enter your name")).toBeVisible();
  await expect(page.getByText("Enter a valid 10-digit mobile number")).toBeVisible();
  await expect(page.getByText("Enter a valid email")).toBeVisible();
  await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
});

test("API rejects an admin role at sign-up", async ({ request }) => {
  const res = await request.post("/api/auth/signup", {
    data: { name: "A", phone: "9876543210", email: "a@b.co", password: "password1", role: "admin" },
  });
  expect(res.status()).toBe(422);
});
