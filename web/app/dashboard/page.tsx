"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState<Array<{ id: string; title: string }>>([]);

  const token = typeof window !== "undefined" && localStorage.getItem("token");

  // 🔐 Fetch user + todos
  useEffect(() => {
    if (!token) return router.push("/login");

    fetch("http://localhost:5000/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data.user));

    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await fetch("http://localhost:5000/todos", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTodos(data);
  };

  const addTodo = async () => {
    if (!todo) return;

    await fetch("http://localhost:5000/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: todo }),
    });

    setTodo("");
    fetchTodos();
  };
//to do api se delete krna hai
  const deleteTodo = async (id: string) => {
    const confirmDelete = window.confirm(
    "Are you sure you want to delete this todo?"
  );

  if (!confirmDelete) {
    return; // ❌ user clicked NO
  }
    await fetch(`http://localhost:5000/todos/${id}`, {
      method: "DELETE",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
    });
    fetchTodos();
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="center">
      <div className="card wide">
        <div className="top">
          <h2>Hello {user?.email}</h2>
          <button onClick={logout}>Logout</button>
        </div>

        <div className="todo-input">
          <input
            placeholder="Write your todo..."
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
          />
          <button onClick={addTodo}>Add</button>
        </div>

        <div className="todo-list">
          {todos.map((t) => (
            <div className="todo-item" key={t.id}>
              <span>{t.title}</span>
              <button onClick={() => deleteTodo(t.id)}>❌</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
