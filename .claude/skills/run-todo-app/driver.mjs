/**
 * Smoke driver for the claude-certification-demo todo app.
 *
 * Usage (from repo root):
 *   node .claude/skills/run-todo-app/driver.mjs [screenshot-path]
 *
 * Requires:
 *   - Backend running on http://localhost:8000
 *   - Frontend running on http://localhost:5173
 *   - npm i -D playwright (or npx playwright install chromium)
 *
 * Exits 0 on success, 1 on any failure.
 */

import { chromium } from "playwright";
import { writeFileSync } from "fs";

const FRONTEND = "http://localhost:5173";
const API = "http://localhost:8000";
const screenshotPath = process.argv[2] ?? "smoke-screenshot.png";

async function apiSmoke() {
  // POST a todo
  const res = await fetch(`${API}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Driver smoke test",
      description: "Created by driver.mjs",
      due_date: "2026-12-31",
    }),
  });
  if (!res.ok) throw new Error(`POST /todos failed: ${res.status}`);
  const todo = await res.json();
  console.log(`  API: created todo id=${todo.id}`);

  // Toggle done
  const patch = await fetch(`${API}/todos/${todo.id}?done=true`, { method: "PATCH" });
  if (!patch.ok) throw new Error(`PATCH /todos/${todo.id} failed: ${patch.status}`);
  const patched = await patch.json();
  if (!patched.done) throw new Error("Toggle done failed");
  console.log(`  API: toggled done=true`);

  // List
  const list = await fetch(`${API}/todos`);
  const todos = await list.json();
  console.log(`  API: ${todos.length} todo(s) in store`);
}

async function uiSmoke() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  console.log("  UI: navigating to", FRONTEND);
  await page.goto(FRONTEND, { waitUntil: "networkidle" });

  // Fill the add form
  await page.fill('input[placeholder="What needs to be done?"]', "UI smoke task");
  await page.fill("textarea", "Added by driver.mjs UI smoke");
  await page.fill('input[type="date"]', "2026-07-01");
  await page.click('button[type="submit"]');
  console.log("  UI: submitted new task");

  // Wait for it to appear in the list
  await page.waitForSelector("text=UI smoke task", { timeout: 5000 });
  console.log("  UI: task visible in list");

  // Expand details
  const detailsBtn = page.locator("text=Details").first();
  await detailsBtn.click();
  await page.waitForSelector("text=Added by driver.mjs UI smoke", { timeout: 3000 });
  console.log("  UI: detail panel expanded");

  // Take screenshot
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`  UI: screenshot saved → ${screenshotPath}`);

  await browser.close();
}

(async () => {
  try {
    console.log("=== Backend API smoke ===");
    await apiSmoke();

    console.log("=== Frontend UI smoke ===");
    await uiSmoke();

    console.log("\n✓ All checks passed");
    process.exit(0);
  } catch (err) {
    console.error("\n✗ Smoke failed:", err.message);
    process.exit(1);
  }
})();
