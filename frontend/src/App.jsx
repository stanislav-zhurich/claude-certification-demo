import { useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:8000";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const dragId = useRef(null);

  async function loadTodos() {
    const res = await fetch(`${API_URL}/todos`);
    setTodos(await res.json());
  }

  useEffect(() => {
    loadTodos();
  }, []);

  async function addTodo(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    await fetch(`${API_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, due_date: dueDate || null }),
    });
    setTitle("");
    setDescription("");
    setDueDate("");
    setAdding(false);
    loadTodos();
  }

  async function toggleDone(todo) {
    await fetch(`${API_URL}/todos/${todo.id}?done=${!todo.done}`, { method: "PATCH" });
    loadTodos();
  }

  function handleDragStart(id) {
    dragId.current = id;
    setDraggingId(id);
  }

  function handleDragOver(e, targetId) {
    e.preventDefault();
    if (!dragId.current || dragId.current === targetId) return;
    setTodos((prev) => {
      const fromIdx = prev.findIndex((t) => t.id === dragId.current);
      const toIdx = prev.findIndex((t) => t.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      if (prev[fromIdx].done !== prev[toIdx].done) return prev;
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  }

  function handleDragEnd() {
    dragId.current = null;
    setDraggingId(null);
  }

  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">✦</div>
          <h2>New Task</h2>
        </div>

        <form onSubmit={addTodo} className="add-form">
          <label className="field-label">Title</label>
          <input
            className="field-input"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label className="field-label">Description</label>
          <textarea
            className="field-input"
            placeholder="Add some details…"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="field-label">Due date</label>
          <input
            className="field-input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <button type="submit" className="btn-primary" disabled={adding}>
            {adding ? "Adding…" : "Add task"}
          </button>
        </form>

        <div className="sidebar-stats">
          <div className="stat">
            <span className="stat-num">{open.length}</span>
            <span className="stat-lbl">Open</span>
          </div>
          <div className="stat">
            <span className="stat-num">{done.length}</span>
            <span className="stat-lbl">Done</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="main-header">
          <h1>My To‑Do List</h1>
          <p className="subtitle">Stay on top of everything that matters</p>
        </header>

        {todos.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No tasks yet — add one on the left!</p>
          </div>
        )}

        {open.length > 0 && (
          <section>
            <h3 className="section-title">Active <span className="badge">{open.length}</span></h3>
            <ul className="todo-list">
              {open.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  expanded={selected === todo.id}
                  onToggleExpand={() => setSelected(selected === todo.id ? null : todo.id)}
                  onToggleDone={() => toggleDone(todo)}
                  dragging={draggingId === todo.id}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </ul>
          </section>
        )}

        {done.length > 0 && (
          <section className="done-section">
            <h3 className="section-title muted">Completed <span className="badge muted">{done.length}</span></h3>
            <ul className="todo-list">
              {done.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  expanded={selected === todo.id}
                  onToggleExpand={() => setSelected(selected === todo.id ? null : todo.id)}
                  onToggleDone={() => toggleDone(todo)}
                  dragging={draggingId === todo.id}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function TodoCard({ todo, expanded, onToggleExpand, onToggleDone, dragging, onDragStart, onDragOver, onDragEnd }) {
  return (
    <li
      className={`todo-card ${todo.done ? "todo-done" : ""} ${dragging ? "dragging" : ""}`}
      draggable
      onDragStart={() => onDragStart(todo.id)}
      onDragOver={(e) => onDragOver(e, todo.id)}
      onDragEnd={onDragEnd}
    >
      <div className="todo-row">
        <span className="drag-handle" title="Drag to reorder">⠿</span>
        <button
          className={`check-btn ${todo.done ? "checked" : ""}`}
          onClick={onToggleDone}
          title={todo.done ? "Mark as open" : "Mark as done"}
        >
          {todo.done ? "✓" : ""}
        </button>
        <span className="todo-title">{todo.title}</span>
        <div className="todo-actions">
          {todo.due_date && (
            <span className={`due-chip ${isOverdue(todo) ? "overdue" : ""}`}>
              📅 {todo.due_date}
            </span>
          )}
          <button className="btn-ghost" onClick={onToggleExpand}>
            {expanded ? "Hide" : "Details"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="todo-detail">
          <p>{todo.description || <em>No description</em>}</p>
          <div className="detail-chips">
            {todo.due_date && <span className="chip">Due: {todo.due_date}</span>}
            <span className={`chip ${todo.done ? "chip-done" : "chip-open"}`}>
              {todo.done ? "✓ Done" : "● Open"}
            </span>
          </div>
        </div>
      )}
    </li>
  );
}

function isOverdue(todo) {
  if (!todo.due_date || todo.done) return false;
  return new Date(todo.due_date) < new Date(new Date().toDateString());
}
