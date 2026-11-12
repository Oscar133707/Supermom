import { AuthForm } from "../auth-form";
import { updatePassword } from "../actions";

export const metadata = { title: "Välj lösenord · Supermom" };

export default function NewPasswordPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Välj ett lösenord</h1>
      <p className="mb-8 mt-2 text-ink-2">Minst 8 tecken. Din telefon kan komma ihåg det åt dig.</p>
      <AuthForm action={updatePassword} fields={["new-password"]} submitLabel="Spara och fortsätt" />
    </>
  );
}
