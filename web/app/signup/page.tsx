"use client";
import { useState } from "react";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-[350px]"
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Create Account
        </h2>

        <input
          name="name"
          placeholder="Full Name"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          type="email"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={handleChange}
        />

        <input
          name="password"
          placeholder="Password"
          type="password"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={handleChange}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
        >
          Sign Up
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-semibold">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
