export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="h-14 w-14 rounded-2xl bg-lime" />
      <h1 className="text-xl font-semibold">Ingen uppkoppling just nu</h1>
      <p className="text-ink-2">
        Det gör inget. Rör dig gärna ändå – du kan logga det när nätet är tillbaka.
      </p>
    </main>
  );
}
