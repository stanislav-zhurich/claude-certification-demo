# To-Do List Demo

A simple full-stack to-do app: **Python (FastAPI)** backend + **React (Vite)** frontend.

## Features
- Add items with title, description and due date
- View the list and item details
- Mark items as done (and undo)

> Note: data is stored in memory and resets when the backend restarts.

## Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API runs at http://localhost:8000 (interactive docs at /docs).

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

App runs at http://localhost:5173 and talks to the backend on port 8000.

## Project structure

```
claude-certification-demo/
├── backend/
│   ├── main.py
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        └── index.css
```
