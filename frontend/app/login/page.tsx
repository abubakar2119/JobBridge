"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: f.get("email"),
        password: f.get("password"),
      }),
    });
    if (!r.ok) {
      setError("Login failed.");
      return;
    }
    router.push("/dashboard/jobs");
    router.refresh();
  }
  return (
    <main>
      <h1>Login to JobPortal</h1>
      <form onSubmit={submit}>
        <input name="email" type="email" placeholder="Email" required />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <button>Sign in</button>
        {error && <p>{error}</p>}
      </form>
    </main>
  );
}
