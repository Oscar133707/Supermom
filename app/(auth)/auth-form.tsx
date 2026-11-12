"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthState } from "./actions";

const input =
  "h-14 w-full rounded-2xl bg-surface px-4 text-base text-ink shadow-card outline-none ring-accent placeholder:text-ink-3 focus:ring-2";

export function AuthForm({
  action,
  fields,
  submitLabel,
}: {
  action: (s: AuthState, f: FormData) => Promise<AuthState>;
  fields: ("email" | "password" | "new-password")[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {fields.includes("email") && (
        <label className="flex flex-col gap-1.5">
          <span className="px-1 text-sm font-medium text-ink-2">E-post</span>
          <input name="email" type="email" autoComplete="email" inputMode="email" required className={input} />
        </label>
      )}
      {(fields.includes("password") || fields.includes("new-password")) && (
        <label className="flex flex-col gap-1.5">
          <span className="px-1 text-sm font-medium text-ink-2">
            {fields.includes("new-password") ? "Nytt lösenord" : "Lösenord"}
          </span>
          <div className="relative">
            <input
              name="password"
              type={show ? "text" : "password"}
              autoComplete={fields.includes("new-password") ? "new-password" : "current-password"}
              required
              minLength={fields.includes("new-password") ? 8 : undefined}
              className={input + " pr-14"}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Dölj lösenord" : "Visa lösenord"}
              className="absolute right-1.5 top-1.5 flex h-11 w-11 items-center justify-center rounded-xl text-ink-2"
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </label>
      )}
      {state.error && (
        <p className="rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
      {state.ok && <p className="rounded-2xl bg-lime-soft px-4 py-3 text-sm text-ink">{state.ok}</p>}
      <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
        {pending ? "Ett ögonblick…" : submitLabel}
      </Button>
    </form>
  );
}
