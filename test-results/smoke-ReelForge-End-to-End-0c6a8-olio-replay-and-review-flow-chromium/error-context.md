# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> ReelForge End-to-End Smoke Test >> Complete brand brief creation, creator discovery, portfolio replay, and review flow
- Location: tests\e2e\smoke.spec.ts:4:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Hire AI directors with"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" locator('h1') with timeout 5000ms
  - waiting for locator('h1')

```

```yaml
- text: Internal Server Error
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("ReelForge End-to-End Smoke Test", () => {
  4  |   test("Complete brand brief creation, creator discovery, portfolio replay, and review flow", async ({ page }) => {
  5  |     // 1. Home page renders hero & creators
  6  |     await page.goto("/");
> 7  |     await expect(page.locator("h1")).toContainText("Hire AI directors with");
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  8  |     await expect(page.getByTestId("creator-card")).toHaveCount(4);
  9  | 
  10 |     // 2. Define Brief flow
  11 |     await page.goto("/briefs/new");
  12 |     await page.click("text=Use sample idea");
  13 |     await page.click("text=Structure brief with AI");
  14 | 
  15 |     // Quality score should be visible
  16 |     const qualityMeter = page.getByTestId("quality-score");
  17 |     await expect(qualityMeter).toBeVisible();
  18 | 
  19 |     // Select paid_ads
  20 |     await page.check("input[value='paid_ads']");
  21 | 
  22 |     // Publish brief
  23 |     await page.click("button:has-text('Publish campaign brief')");
  24 | 
  25 |     // Should navigate to brief detail page
  26 |     await expect(page.url()).toContain("/briefs/");
  27 |     await expect(page.getByTestId("match-row").first()).toBeVisible();
  28 | 
  29 |     // 3. Invite Creator & Verify Role Scope
  30 |     await page.click("button:has-text('Invite creator')");
  31 |     await page.waitForURL(/\/engagements\//);
  32 |     await expect(page.locator("text=01. Invited")).toBeVisible();
  33 | 
  34 |     // 4. Switch to Creator Studio Desk Tab & Accept Invite
  35 |     await page.click("text=Creator Studio Desk");
  36 |     await expect(page.locator("text=Campaign Brief Invitation Received")).toBeVisible();
  37 |     await page.click("button:has-text('Accept Brief as')");
  38 | 
  39 |     // 5. Submit Version v1 as Creator
  40 |     await expect(page.locator("h3:has-text('Submit Render Version v1')")).toBeVisible();
  41 |     await page.fill("textarea", "Rendered 9:16 liquid neon sequence using ComfyUI node pipeline");
  42 |     await page.click("button:has-text('Submit Version v1')");
  43 | 
  44 |     // 6. Switch to Brand Review Desk Tab & Request Changes
  45 |     await page.click("text=Brand Review Desk");
  46 |     await page.fill("textarea", "Please make neon contrast brighter on beat drop");
  47 |     await page.click("button:has-text('Request Revision with Feedback')");
  48 | 
  49 |     // 7. Switch back to Creator Studio Desk & Submit Version v2
  50 |     await page.click("text=Creator Studio Desk");
  51 |     await page.fill("textarea", "Boosted neon contrast on frame 120");
  52 |     await page.click("button:has-text('Submit Version v2')");
  53 | 
  54 |     // 8. Switch back to Brand Review Desk & Approve Version v2
  55 |     await page.click("text=Brand Review Desk");
  56 |     await page.click("button:has-text('Approve Version v2')");
  57 |     await expect(page.getByText("MASTER COMMERCIAL DELIVERY VAULT CLEARED")).toBeVisible();
  58 | 
  59 |     // 9. Creator Directory & Filtering
  60 |     await page.goto("/creators");
  61 |     await expect(page.getByTestId("creator-card").first()).toBeVisible();
  62 | 
  63 |     // 10. Creator Profile & Workflow Replay Modal
  64 |     await page.goto("/creators/cr_1");
  65 |     await expect(page.locator("h1")).toContainText("Inbarasan");
  66 | 
  67 |     // Click first portfolio frame
  68 |     await page.locator(".cursor-pointer").first().click();
  69 |     await expect(page.getByTestId("workflow-step").first()).toBeVisible();
  70 | 
  71 |     // 11. Data Model & Review pages
  72 |     await page.goto("/data-model");
  73 |     await expect(page.locator("h1")).toContainText("Data Model & Clearance Schema");
  74 | 
  75 |     await page.goto("/review");
  76 |     await expect(page.locator("h1")).toContainText("Platform Implementation Audit");
  77 |   });
  78 | });
  79 | 
```