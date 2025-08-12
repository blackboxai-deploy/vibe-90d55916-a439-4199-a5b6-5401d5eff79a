"use client";

import { useEffect, useMemo, useState } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

function uid() {
  // Simple unique id based on time and randomness
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const STORAGE_KEY = "next-todo-list";

type Filter = "all" | "active" | "completed";

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Todo[] = JSON.parse(raw);
        if (Array.isArray(parsed)) setTodos(parsed);
      }
    } catch {}
    setMounted(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {}
  }, [todos, mounted]);

  const remaining = useMemo(() => todos.filter(t => !t.completed).length, [todos]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter(t => !t.completed);
      case "completed":
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  function addTodo(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const next: Todo = { id: uid(), text, completed: false, createdAt: Date.now() };
    setTodos(prev => [next, ...prev]);
    setInput("");
  }

  function toggle(id: string) {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function remove(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  function clearCompleted() {
    setTodos(prev => prev.filter(t => !t.completed));
  }

  function edit(id: string, text: string) {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, text } : t)));
  }

  return (
    <div className="card">
      <form onSubmit={addTodo} className="row">
        <input
          aria-label="Add todo"
          className="input"
          placeholder="What needs to be done?"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" className="btn primary" aria-label="Add">
          Add
        </button>
      </form>

      <div className="toolbar">
        <div className="filters" role="tablist" aria-label="Filters">
          <button
            className={`chip ${filter === "all" ? "chip-active" : ""}`}
            onClick={() => setFilter("all")}
            role="tab"
            aria-selected={filter === "all"}
          >
            All
          </button>
          <button
            className={`chip ${filter === "active" ? "chip-active" : ""}`}
            onClick={() => setFilter("active")}
            role="tab"
            aria-selected={filter === "active"}
          >
            Active
          </button>
          <button
            className={`chip ${filter === "completed" ? "chip-active" : ""}`}
            onClick={() => setFilter("completed")}
            role="tab"
            aria-selected={filter === "completed"}
          >
            Completed
          </button>
        </div>
        <div className="status">{remaining} remaining</div>
      </div>

      <ul className="list" role="list">
        {filtered.map(todo => (
          <TodoItem key={todo.id} todo={todo} onToggle={toggle} onDelete={remove} onEdit={edit} />)
        )}
      </ul>

      <div className="row">
        <button className="btn" onClick={clearCompleted} aria-label="Clear completed">
          Clear Completed
        </button>
      </div>
    </div>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.text);

  useEffect(() => setText(todo.text), [todo.text]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onEdit(todo.id, trimmed);
    setEditing(false);
  }

  return (
    <li className="item">
      <label className="checkbox">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          aria-label={todo.completed ? "Mark as active" : "Mark as completed"}
        />
        <span className={todo.completed ? "completed" : undefined}>
          {editing ? (
            <form onSubmit={handleSubmit} className="edit-form">
              <input
                className="input"
                value={text}
                onChange={e => setText(e.target.value)}
                autoFocus
                onBlur={handleSubmit}
              />
            </form>
          ) : (
            todo.text
          )}
        </span>
      </label>
      <div className="actions">
        {!editing && (
          <button className="btn small" onClick={() => setEditing(true)} aria-label="Edit">
            Edit
          </button>
        )}
        <button className="btn small danger" onClick={() => onDelete(todo.id)} aria-label="Delete">
          Delete
        </button>
      </div>
    </li>
  );
}
