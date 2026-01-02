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

    // 1. URL ko yahan define karein taaki ensure ho ki ye variable se aa raha hai
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    
    // Debugging ke liye: Browser console (F12) mein check karein ye kya print kar raha hai
    console.log("Connecting to:", `${API_BASE_URL}/signup`);

    try {
      const res = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
        return;
      }

      const data = await res.json();
      alert("Success: " + data.message);
      // Success ke baad user ko login par bhej sakte hain
      window.location.href = "/login";

    } catch (error) {
      console.error("FETCH ERROR:", error);
      alert("Failed to connect to server. Check your internet or API URL.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-[350px]"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        <input
          name="name"
          placeholder="Full Name"
          required
          className="w-full mb-4 p-3 border rounded-lg text-black"
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder=" enter password "
          type="email"
          required
          className="w-full mb-4 p-3 border rounded-lg text-black"
          onChange={handleChange}
        />

        <input
          name="password"
          placeholder="Password"
          type="password"
          required
          className="w-full mb-4 p-3 border rounded-lg text-black"
          onChange={handleChange}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-bold"
        >
          Sign Up
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-semibold underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}