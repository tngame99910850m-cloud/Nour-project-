import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getBusinessSettings } from "@/lib/settings";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  if (session) redirect(session.role === "DEVELOPER" ? "/developer" : "/admin");

  const business = await getBusinessSettings();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand/10 via-canvas to-canvas px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="font-serif text-3xl font-semibold text-ink">{business.name}</Link>
          <p className="mt-2 text-sm text-muted">Business Management Portal</p>
        </div>
        <div className="card p-8">
          <h1 className="font-serif text-2xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Access your dashboard.</p>
          {sp.error === "forbidden" ? (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">You don&apos;t have permission to access that area.</p>
          ) : null}
          <LoginForm next={sp.next} />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="hover:text-brand">← Back to store</Link>
        </p>
      </div>
    </div>
  );
}
