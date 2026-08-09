"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("That email or password doesn't match our records.");
      return;
    }

    router.push(params.get("callbackUrl") || "/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm bg-surface border border-line rounded-card shadow-card p-8">
        <h1 className="font-display text-2xl text-ink mb-1">Sign in</h1>
        <p className="text-sm text-muted mb-6">Access your sessions and learners.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-ink mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-ink mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-accent"
            />
          </div>

          {error && <p className="text-sm text-signal-rose">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent text-white text-sm font-medium py-2.5 hover:bg-accent/90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
          <div className="w-full max-w-sm bg-surface border border-line rounded-card shadow-card p-8 text-center text-sm text-muted">
            Loading sign in form…
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}