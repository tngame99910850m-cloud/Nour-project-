"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-6 text-center text-slate-100">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <button onClick={reset} className="mt-6 rounded-lg bg-indigo-500 px-5 py-2.5 font-medium hover:bg-indigo-400">
        Try again
      </button>
    </div>
  );
}
