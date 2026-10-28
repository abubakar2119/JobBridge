
"use client";

import { useState } from "react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error?.message ||
            data.message ||
            "Verification failed. Check your email and code."
        );
        return;
      }

      setVerified(true);
      setMessage("Email verified successfully! You can now log in.");
    } catch {
      setError("Server se connection nahi ho saka. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setMessage("");
    setError("");
    setResending(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error?.message || data.message || "Could not resend code."
        );
        return;
      }

      setMessage(
        data.message || "Request processed. Check your email for a new code."
      );
    } catch {
      setError("Server se connection nahi ho saka. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="mx-auto mt-16 max-w-md rounded-lg border p-6">
      <h1 className="mb-2 text-2xl font-bold">Verify Your Email</h1>

      <p className="mb-6 text-gray-600">
        Apni email par receive hone wala 6-digit code enter karein.
      </p>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block font-medium">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label htmlFor="otp" className="mb-1 block font-medium">
            Verification code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]{6}"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="Enter 6-digit code"
            required
            className="w-full rounded border p-3"
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {message && <p className="text-green-700">{message}</p>}

        {!verified && (
          <>
            <button
              type="submit"
              disabled={loading || resending}
              className="w-full rounded bg-blue-600 p-3 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || loading || !email.trim()}
              className="w-full rounded border p-3 disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend Code"}
            </button>
          </>
        )}

        {verified && (
          <Link
            href="/login"
            className="block rounded bg-blue-600 p-3 text-center font-semibold text-white"
          >
            Go to Login
          </Link>
        )}
      </form>

      <p className="mt-5 text-sm text-gray-600">
        Already verified? <Link href="/login" className="underline">Login</Link>
      </p>
    </main>
  );
}
