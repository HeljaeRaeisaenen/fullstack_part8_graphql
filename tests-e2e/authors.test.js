import { test, describe, expect, beforeEach } from "@playwright/test";

describe("Library app", () => {
  beforeEach(async ({ page }) => {
    await page.goto("");
  });
  test("has heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "authors" })).toBeVisible();
  });

  test("books link", async ({ page }) => {
    await page.getByRole("button", { name: "books" }).click();
    await expect(page.getByText("published")).toBeVisible();
  });
});
