import { expect, test } from "@playwright/test";

import { SAMPLE_ARENA_OUTPUT, SAMPLE_BRIDGE, seedArenaBridge } from "./helpers/arena-bridge";

test.describe("Arena sessionStorage bridge", () => {
  test("prefills Submit form from sessionStorage", async ({ page }) => {
    await seedArenaBridge(page);
    await page.goto("/submit");

    await expect(page.getByPlaceholder("Your name")).toHaveValue(SAMPLE_BRIDGE.name);
    await expect(page.getByPlaceholder("gpt-4o-mini")).toHaveValue(SAMPLE_BRIDGE.modelUsed);
    await expect(page.getByPlaceholder("0.08")).toHaveValue(String(SAMPLE_BRIDGE.costUsd));
    await expect(page.getByPlaceholder(/Executive Summary, Key Risks/i)).toHaveValue(
      SAMPLE_ARENA_OUTPUT,
    );
  });

  test("shows bridge banner on Battle page", async ({ page }) => {
    await seedArenaBridge(page);
    await page.goto("/battle");

    await expect(page.getByText(/Arena output loaded/i)).toBeVisible();
    await expect(page.getByText(new RegExp(`rank #${SAMPLE_BRIDGE.rank}`))).toBeVisible();
    await expect(page.getByRole("link", { name: /Submit to leaderboard/i })).toBeVisible();
  });

  test("prefills Enterprise benchmark from sessionStorage", async ({ page }) => {
    await seedArenaBridge(page);
    await page.goto("/enterprise");

    await expect(
      page.locator('label:has-text("Your internal workflow") + input'),
    ).toHaveValue(SAMPLE_BRIDGE.name);
    await expect(
      page.locator('label:has-text("Workflow output") + textarea'),
    ).toHaveValue(SAMPLE_ARENA_OUTPUT);
  });

  test("Arena judge saves bridge and Submit inherits it", async ({ page }) => {
    await page.goto("/arena");

    await page.getByPlaceholder("You", { exact: true }).fill("E2E Arena User");
    await page.getByPlaceholder(/Paste your summary/i).fill(SAMPLE_ARENA_OUTPUT);
    await page.getByRole("button", { name: /Submit & compete/i }).click();

    await expect(page.getByText(/Rank #/i)).toBeVisible({ timeout: 30_000 });

    await page.getByRole("link", { name: /Submit to leaderboard/i }).click();
    await expect(page).toHaveURL(/\/submit/);

    await expect(page.getByPlaceholder("Your name")).toHaveValue("E2E Arena User");
    await expect(page.getByPlaceholder(/Executive Summary, Key Risks/i)).toHaveValue(
      SAMPLE_ARENA_OUTPUT,
    );
  });
});
