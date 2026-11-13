/** Shown instantly when a workout is started, until the player is ready. */
export default function Loading() {
  return (
    <main
      className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-lg animate-pulse flex-col gap-4 px-5 pb-6 pt-16 [animation-duration:2.4s] motion-reduce:animate-none"
      aria-busy="true"
      aria-label="Laddar passet"
    >
      <div className="h-4 w-24 rounded-full bg-surface-2" />
      <div className="h-10 w-3/4 rounded-full bg-surface-2" />
      <div className="h-4 w-1/2 rounded-full bg-surface-2" />
      <div className="mt-6 h-64 rounded-[1.5rem] bg-surface shadow-card" />
      <div className="mt-auto h-16 rounded-full bg-surface-2" />
    </main>
  );
}
