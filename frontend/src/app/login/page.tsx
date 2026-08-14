"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

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
      // Debug: check the API URL being used by the deployed frontend
      console.log("API_URL:", API_URL);
      console.log(
        "LOGIN URL:",
        `${API_URL}/api/auth/login`,
      );

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      console.log(
        "Login response status:",
        response.status,
      );

      const data = await response.json();

      console.log(
        "Login response data:",
        data,
      );

      if (!response.ok) {
        setMessage(
          data.error || "Login failed",
        );
        return;
      }

      localStorage.setItem(
        "token",
        data.token,
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user),
      );

      setMessage(
        "Login successful!",
      );

      router.push("/dashboard");
    } catch (error) {
      console.error(
        "Login Error:",
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
          Login
        </h1>

        <input
          className="w-full border p-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />

        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full border p-2 rounded"
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>

        {message && (
          <p className="text-center">
            {message}
          </p>
        )}

        {/* Register navigation */}
        <p className="text-center text-sm">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() =>
              router.push("/register")
            }
            className="underline font-medium"
          >
            Register
          </button>
        </p>

        {/* Home navigation */}
        <button
          type="button"
          onClick={() =>
            router.push("/")
          }
          className="w-full border p-2 rounded"
        >
          Back to Home
        </button>
      </form>
    </main>
  );
}