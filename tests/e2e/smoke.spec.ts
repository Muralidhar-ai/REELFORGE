import { test, expect } from "@playwright/test";

test.describe("ReelForge End-to-End Smoke Test", () => {
  test("Complete brand brief creation, creator discovery, portfolio replay, and review flow", async ({ page }) => {
    // 1. Home page renders hero & creators
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Hire AI creators who can show how the work was made.");
    await expect(page.getByTestId("creator-card")).toHaveCount(4);

    // 2. Define Brief flow
    await page.goto("/briefs/new");
    await page.click("text=Use sample idea");
    await page.click("text=Structure brief with AI");

    // Quality score should be visible
    const qualityMeter = page.getByTestId("quality-score");
    await expect(qualityMeter).toBeVisible();

    // Select paid_ads
    await page.check("input[value='paid_ads']");

    // Publish brief
    await page.click("button:has-text('Publish campaign brief')");

    // Should navigate to brief detail page
    await expect(page.url()).toContain("/briefs/");
    await expect(page.getByTestId("match-row").first()).toBeVisible();

    // 3. Invite Creator & Verify Role Scope
    await page.click("button:has-text('Invite creator')");
    await page.waitForURL(/\/engagements\//);
    await expect(page.locator("text=Awaiting Creator Acceptance")).toBeVisible();

    // 4. Switch to Creator Delivery Desk Tab & Accept Invite
    await page.click("text=Creator Delivery Desk");
    await expect(page.locator("text=You have been invited to this campaign brief")).toBeVisible();
    await page.click("button:has-text('Accept invitation as Creator')");

    // 5. Submit Version v1 as Creator
    await expect(page.locator("h3:has-text('Submit Version v1')")).toBeVisible();
    await page.fill("textarea", "Rendered 9:16 liquid neon sequence using ComfyUI node pipeline");
    await page.click("button:has-text('Submit version v1')");

    // 6. Switch to Brand Review Desk Tab & Request Changes
    await page.click("text=Brand Review Desk");
    await page.fill("textarea", "Please make neon contrast brighter on beat drop");
    await page.click("button:has-text('Request changes with feedback')");

    // 7. Switch back to Creator Delivery Desk & Submit Version v2
    await page.click("text=Creator Delivery Desk");
    await page.fill("textarea", "Boosted neon contrast on frame 120");
    await page.click("button:has-text('Submit version v2')");

    // 8. Switch back to Brand Review Desk & Approve Version v2
    await page.click("text=Brand Review Desk");
    await page.click("button:has-text('Approve version v2')");
    await expect(page.getByText("APPROVED", { exact: true })).toBeVisible();

    // 9. Creator Directory & Filtering
    await page.goto("/creators");
    await expect(page.getByTestId("creator-card").first()).toBeVisible();

    // 10. Creator Profile & Workflow Replay Modal
    await page.goto("/creators/cr_1");
    await expect(page.locator("h1")).toContainText("Inbarasan");

    // Click first portfolio frame
    await page.locator(".cursor-pointer").first().click();
    await expect(page.getByTestId("workflow-step").first()).toBeVisible();

    // 11. Data Model & Review pages
    await page.goto("/data-model");
    await expect(page.locator("h1")).toContainText("Data Model & Architecture Documentation");

    await page.goto("/review");
    await expect(page.locator("h1")).toContainText("How this build maps to the brief");
  });
});
