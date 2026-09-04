"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { loginAction, type LoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary btn-lg w-full">
      {pending ? <><Loader2 className="h-5 w-5 animate-spin" /> Signing in…</> : "Sign in"}
    </button>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div>
        <label className="label">Email</label>
        <input name="email" type="email" required autoComplete="email" className="input" placeholder="you@business.com" />
      </div>
      <div>
        <label className="label">Password</label>
        <input name="password" type="password" required autoComplete="current-password" className="input" placeholder="••••••••" />
      </div>
      {state.error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
