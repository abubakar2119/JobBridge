
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: form.get("full_name"),
            email: form.get("email"),
            password: form.get("password"),
            role: "applicant",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || "Registration failed.");
        return;
      }

      router.push("/verify-email");
    } catch {
      setError("Cannot connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Register for JobBridge
        </h1>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            name="full_name"
            type="text"
            placeholder="Full Name"
            autoComplete="name"
            minLength={2}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3
            text-gray-900 focus:border-blue-600 focus:outline-none"
          />

          <input
            name="password"
            type="password"
            placeholder="Password (minimum 8 characters)"
            autoComplete="new-password"
            minLength={8}
            required
            className="w-full rounded-lg border 
            border-gray-300 px-4 py-3 text-gray-900
            focus:border-blue-600 focus:outline-none"
          />

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-blue-600">
            Login
          </a>
        </p>
      </div>
    </main>
  );
}
