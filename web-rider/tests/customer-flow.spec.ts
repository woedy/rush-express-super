import { test, expect } from "@playwright/test";

const shouldRun = Boolean(process.env.E2E_BASE_URL);

test.describe("Customer flow", () => {
  test.skip(!shouldRun, "Set E2E_BASE_URL to run this test against a running app.");

  test("login -> create order -> see status", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Username").fill("customer");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Customer Dashboard")).toBeVisible();

    await page.getByRole("tab", { name: /new order/i }).click();
    await page.getByLabel("Merchant branch ID").fill("1");
    await page.getByLabel("Dropoff address ID").fill("1");
    await page.getByLabel("Inventory item ID").fill("1");
    await page.getByLabel("Quantity").fill("1");
    await page.getByRole("button", { name: /get quote/i }).click();
    await page.getByRole("button", { name: /confirm & pay/i }).click();

    await page.getByRole("tab", { name: /orders/i }).click();
    await expect(page.getByText(/Order #/i)).toBeVisible();
  });
});
