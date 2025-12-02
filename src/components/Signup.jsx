import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL; // ✅ Use env variable

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setMessage("⚠️ Please fill in all fields.");
      return;
    }

    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/signup`, {
        name,
        email,
        password,
      });

      // ✅ Save JWT token & user info in sessionStorage
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("userId", data.user.id);
      sessionStorage.setItem("userName", data.user.name);

      setMessage("✅ Signup successful! Redirecting to login...");
      
      setTimeout(() => navigate("/login"), 1000);

    } catch (err) {
      console.error("Signup error:", err);
      setMessage(
        err.response?.data?.message || "❌ Signup failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        <h2 className="text-xl font-bold text-green-600 mb-6">
          Welcome to QuickPay
        </h2>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full rounded mb-3 focus:ring-2 focus:ring-green-400"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full rounded mb-3 focus:ring-2 focus:ring-green-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full rounded mb-4 focus:ring-2 focus:ring-green-400"
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Sign Up
          </button>
        </form>

        {message && <p className="mt-4 text-gray-600">{message}</p>}

        <p className="mt-4 text-sm text-gray-500">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
