import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <p className="font-serif text-7xl font-semibold text-brand">404</p>
      <h1 className="mt-4 font-serif text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary btn-md">Back to Home</Link>
        <Link href="/products" className="btn-outline btn-md">Browse Products</Link>
      </div>
    </div>
  );
}
