---
name: run-todo-app
description: Run, start, launch, screenshot, or smoke-test the claude-certification-demo todo app (FastAPI backend + React/Vite frontend). Use this skill whenever you need to start the app, take a screenshot, verify a change works, or drive the UI programmatically.
---

# run-todo-app

Full-stack todo app: **FastAPI** backend (port 8000) + **React/Vite** frontend (port 5173).
The interaction harness is `.claude/skills/run-todo-app/driver.mjs` — a Playwright script that exercises the REST API and drives the browser UI. Run it from the **repo root**.

## Prerequisites

- Python 3.11+ (for the backend)
- Node.js 18+ (for the frontend and driver)
- Playwright's Chromium browser — install once per machine:

```powershell
cd frontend
npx playwright install chromium
cd ..
```

- Playwright package at the repo root (already in `package.json`):

```powershell
npm install
```

## Build

No build step needed for development. Dependencies are already installed.

Backend:
```powershell
cd backend
pip install -r requirements.txt
```

Frontend:
```powershell
cd frontend
npm install
```

## Run (agent path)

**Step 1 — start both servers** (each in its own terminal or background process):

```powershell
# Terminal A — backend
cd backend
python -m uvicorn main:app --reload --port 8000

# Terminal B — frontend
cd frontend
npm run dev
```

Wait until both respond:
```powershell
Invoke-WebRequest http://localhost:8000/todos -UseBasicParsing   # expect 200
Invoke-WebRequest http://localhost:5173 -UseBasicParsing          # expect 200
```

**Step 2 — run the smoke driver** from the repo root:

```powershell
node .claude/skills/run-todo-app/driver.mjs [optional-screenshot-path]
```

Default screenshot lands at `.claude/skills/run-todo-app/smoke-screenshot.png`.

The driver:
1. POSTs a todo via the REST API and patches it to done — verifies the backend.
2. Opens a headless Chromium window, fills the add form, submits, expands Details — verifies the frontend end-to-end.
3. Saves a screenshot.
4. Exits 0 on success, 1 on any failure with a message.

**To verify a specific change** after editing code, restart the affected server, then re-run the driver.

## Run (human path)

Same two servers as above. Open `http://localhost:5173` in a browser.
Ctrl-C both terminals to stop.

## Gotchas

- **`playwright` must be installed at the repo root** (`package.json` + `node_modules/` at repo root), not just inside `frontend/`. The driver is an ESM module and Node.js ESM does not traverse `NODE_PATH`. Running `node driver.mjs` from inside `frontend/` also fails because the working directory changes module resolution.
- **Driver must be run from repo root** — `node .claude/skills/run-todo-app/driver.mjs` — not from inside the skill directory. The screenshot path is resolved relative to the process CWD.
- **Backend state resets on restart** — all todos are in-memory. Each driver run adds todos; re-running with a fresh backend gives id=1 again.
- **`npx playwright install chromium`** must be run from inside `frontend/` (where playwright appears in `devDependencies`) so Playwright finds its own binary registry. Running it from the root works too if Playwright is installed there.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot find package 'playwright'` | Run `npm install` at the repo root, then retry |
| `POST /todos failed: 422` | Backend is up but request body is malformed — check `main.py` Pydantic model |
| `waiting for selector 'text=UI smoke task'` timeout | Frontend didn't re-render after POST — check CORS or that Vite dev server reloaded |
| `net::ERR_CONNECTION_REFUSED` on port 5173 | Vite not running — start it with `npm run dev` in `frontend/` |
| `net::ERR_CONNECTION_REFUSED` on port 8000 | uvicorn not running — start it in `backend/` |
