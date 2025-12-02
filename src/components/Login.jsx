import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Use backend URL from .env file
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("⚠️ Please fill in all fields.");
      return;
    }

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      // Save login data to sessionStorage
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("userId", data.user.id);
      sessionStorage.setItem("userName", data.user.name);

      setMessage("✅ Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setMessage(
        err.response?.data?.message || "❌ Login failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-6">QuickPay Login</h2>

        <form onSubmit={handleLogin}>
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
            Login
          </button>
        </form>

        {message && <p className="mt-4 text-gray-600">{message}</p>}

        <p
          className="mt-3 text-sm text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </p>

        <p className="mt-3 text-sm text-gray-500">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-green-600 cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
