"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      console.log(
        "API URL:",
        `${API_URL}/api/auth/register`,
      );

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        },
      );

      console.log(
        "Response Status:",
        response.status,
      );

      const data = await response.json();

      console.log(
        "Response Data:",
        data,
      );

      if (!response.ok) {
        setMessage(
          data.error ||
            "Registration failed",
        );
        return;
      }

      setMessage(
        "Registration successful!",
      );

      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(
        "Registration Error:",
        error,
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 border rounded-lg p-6"
      >
        <h1 className="text-3xl font-bold">
          Register
        </h1>

        <input
          className="w-full border p-2 rounded"
          placeholder="Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          disabled={loading}
          className="w-full border p-2 rounded"
        >
          {loading
            ? "Creating..."
            : "Create Account"}
        </button>

        {message && (
          <p className="text-sm">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}