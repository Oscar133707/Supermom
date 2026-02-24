export default function Loading() {
  return (
    <div className="max-w-lg mx-auto px-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between pt-10 pb-6">
        <div>
          <div className="h-4 w-20 bg-surface-raised rounded mb-2" />
          <div className="h-7 w-40 bg-surface-raised rounded" />
        </div>
        <div className="w-10 h-10 rounded-full bg-surface-raised" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-28 bg-surface-card rounded-2xl border border-surface-border" />
        <div className="h-28 bg-surface-card rounded-2xl border border-surface-border" />
      </div>
      {/* Program card */}
      <div className="h-36 bg-surface-card rounded-2xl border border-surface-border mb-4" />
      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 bg-surface-card rounded-2xl border border-surface-border" />
        <div className="h-20 bg-surface-card rounded-2xl border border-surface-border" />
      </div>
    </div>
  );
}
