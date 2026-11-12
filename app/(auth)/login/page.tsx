import Link from "next/link";
import { AuthForm } from "../auth-form";
import { signIn } from "../actions";

export const metadata = { title: "Logga in · Supermom" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Välkommen</h1>
      <p className="mb-8 mt-2 text-ink-2">Logga in en gång – sen är du inloggad.</p>
      <AuthForm action={signIn} fields={["email", "password"]} submitLabel="Logga in" />
      <Link href="/glomt-losenord" className="mx-auto mt-6 flex h-11 items-center px-3 text-sm font-medium text-accent">
        Glömt lösenordet?
      </Link>
    </>
  );
}
