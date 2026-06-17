import { useEffect, useState } from "react";

const API_URL = "http://localhost:8000";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selected, setSelected] = useState(null);

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
    await fetch(`${API_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        due_date: dueDate || null,
      }),
    });
    setTitle("");
    setDescription("");
    setDueDate("");
    loadTodos();
  }

  async function toggleDone(todo) {
    await fetch(`${API_URL}/todos/${todo.id}?done=${!todo.done}`, {
      method: "PATCH",
    });
    loadTodos();
  }

  return (
    <div className="container">
      <h1>To-Do List</h1>

      <form onSubmit={addTodo}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button type="submit">Add item</button>
      </form>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className={todo.done ? "done" : ""}>
            <div className="todo-header">
              <span className="todo-title">{todo.title}</span>
              <div>
                <button
                  className="secondary"
                  onClick={() =>
                    setSelected(selected === todo.id ? null : todo.id)
                  }
                >
                  {selected === todo.id ? "Hide" : "Details"}
                </button>{" "}
                <button onClick={() => toggleDone(todo)}>
                  {todo.done ? "Undo" : "Done"}
                </button>
              </div>
            </div>
            {selected === todo.id && (
              <div className="meta">
                <p>{todo.description || "No description"}</p>
                <p>Due: {todo.due_date || "—"}</p>
                <p>Status: {todo.done ? "Done" : "Open"}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
