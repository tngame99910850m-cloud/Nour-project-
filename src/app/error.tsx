"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <h1 className="font-serif text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted">An unexpected error occurred. Please try again.</p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="btn-primary btn-md">Try again</button>
        <Link href="/" className="btn-outline btn-md">Go Home</Link>
      </div>
    </div>
  );
}
