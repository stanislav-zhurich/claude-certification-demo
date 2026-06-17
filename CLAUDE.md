# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A full-stack to-do app: **FastAPI** backend (Python) + **React/Vite** frontend (JavaScript). Data is stored in memory — it resets on backend restart, by design.

## Commands

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Interactive API docs available at http://localhost:8000/docs.

### Frontend

```powershell
cd frontend
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build
npm run preview  # preview production build
```

## Architecture

The two services are fully decoupled and communicate over HTTP. CORS is open (`allow_origins=["*"]`), so both can run independently.

**Backend (`backend/main.py`)** — single-file FastAPI app. All state lives in a module-level `todos: dict[int, Todo]` dict and a `next_id` counter. No database, no persistence layer. Pydantic models: `TodoCreate` (input) and `Todo` (stored, adds `id` and `done`).

REST API:
- `GET /todos` — list all
- `GET /todos/{id}` — get one
- `POST /todos` — create (body: `title`, `description`, `due_date`)
- `PATCH /todos/{id}?done=true|false` — toggle done state

**Frontend (`frontend/src/App.jsx`)** — single React component. Hits the backend directly at `http://localhost:8000` (hardcoded constant at the top of App.jsx). State: list of todos, form fields, and which todo's detail panel is expanded. No router, no state library.
