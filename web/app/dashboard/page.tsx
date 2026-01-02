"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState<Array<{ id: string; title: string }>>([]);

  // 📝 API Base URL variable mein store kar lete hain
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const token = typeof window !== "undefined" && localStorage.getItem("token");

  // 🔐 Fetch user + todos
  useEffect(() => {
    if (!token) return router.push("/login");

    // Localhost ki jagah API_BASE_URL use kiya
    fetch(`${API_BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(err => console.log("Fetch error:", err));

    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await fetch(`${API_BASE_URL}/todos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTodos(data);
  };

  const addTodo = async () => {
    if (!todo) return;

    await fetch(`${API_BASE_URL}/todos`, {
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

  const deleteTodo = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this todo?"
    );

    if (!confirmDelete) {
      return; 
    }
    await fetch(`${API_BASE_URL}/todos/${id}`, {
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