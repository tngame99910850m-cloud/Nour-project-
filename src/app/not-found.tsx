import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-6 text-center text-slate-100">
      <p className="text-6xl">🎹</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <Link href="/" className="mt-6 rounded-lg bg-indigo-500 px-5 py-2.5 font-medium hover:bg-indigo-400">
        Back to the Piano
      </Link>
    </div>
  );
}
