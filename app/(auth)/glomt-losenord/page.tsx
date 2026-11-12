import Link from "next/link";
import { AuthForm } from "../auth-form";
import { requestReset } from "../actions";

export const metadata = { title: "Glömt lösenord · Supermom" };

export default function ForgotPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Nytt lösenord</h1>
      <p className="mb-8 mt-2 text-ink-2">Skriv din e-post så skickar vi en länk.</p>
      <AuthForm action={requestReset} fields={["email"]} submitLabel="Skicka länk" />
      <Link href="/login" className="mx-auto mt-6 flex h-11 items-center px-3 text-sm font-medium text-accent">
        Tillbaka till inloggning
      </Link>
    </>
  );
}
