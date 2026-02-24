import { createClient } from '@/lib/supabase/server';
import { getActiveProgram } from '@/actions/workouts';
import { getMeasurements } from '@/actions/measurements';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profile, activeProgram, measurements] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user!.id)
      .single()
      .then((r) => r.data),
    getActiveProgram(),
    getMeasurements(),
  ]);

  const completedCount = activeProgram?.sessions.filter((s) => s.completed).length ?? 0;
  const totalCount = activeProgram?.sessions.length ?? 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const latestWeight = measurements.at(-1)?.weight_kg;
  const firstWeight = measurements.find((m) => m.weight_kg !== null)?.weight_kg;
  const weightChange =
    latestWeight && firstWeight ? latestWeight - firstWeight : null;

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SM';

  return (
    <div className="max-w-lg mx-auto px-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between pt-10 pb-6">
        <div>
          <p className="text-sm text-gray-500 font-medium">Good job,</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {profile?.full_name ?? 'Supermom'} 💪
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-brand-400 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-black">{initials}</span>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card flex flex-col gap-1">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Sessions</p>
          <div className="flex items-end gap-1 mt-1">
            <span className="text-4xl font-bold text-brand-400 leading-none">
              {completedCount}
            </span>
            <span className="text-lg text-gray-600 leading-none mb-0.5">
              /{totalCount}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">completed</p>
        </div>

        <div className="card flex flex-col gap-1">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Weight</p>
          <div className="flex items-end gap-1 mt-1">
            <span className="text-4xl font-bold text-white leading-none">
              {latestWeight ?? '—'}
            </span>
            {latestWeight && (
              <span className="text-sm text-gray-600 leading-none mb-1">kg</span>
            )}
          </div>
          {weightChange !== null ? (
            <span
              className={`text-xs font-semibold mt-1 ${
                weightChange <= 0 ? 'text-brand-400' : 'text-red-400'
              }`}
            >
              {weightChange > 0 ? '+' : ''}
              {weightChange.toFixed(1)} kg total
            </span>
          ) : (
            <p className="text-xs text-gray-600 mt-1">not logged yet</p>
          )}
        </div>
      </div>

      {/* ── Active program ── */}
      {activeProgram ? (
        <div className="card mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                Active Program
              </p>
              <p className="font-semibold text-white text-base leading-snug">
                {activeProgram.name}
              </p>
            </div>
            <Link
              href="/workouts"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors whitespace-nowrap ml-4 mt-1"
            >
              View all →
            </Link>
          </div>
          <div className="w-full bg-surface-raised rounded-full h-2 mb-2">
            <div
              className="bg-brand-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">
              {completedCount} of {totalCount} sessions done
            </p>
            <p className="text-xs font-semibold text-brand-400">{progressPct}%</p>
          </div>
        </div>
      ) : (
        <div className="card mb-4 text-center py-10">
          <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </div>
          <p className="text-white font-semibold text-sm">No program assigned yet</p>
          <p className="text-gray-600 text-xs mt-1">Oscar will set one up for you soon!</p>
        </div>
      )}

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/measurements"
          className="card flex items-center gap-3 hover:border-brand-400/30 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-400/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-400/20 transition-colors">
            <svg
              className="w-4 h-4 text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Log weight</p>
            <p className="text-xs text-gray-600">Track progress</p>
          </div>
        </Link>

        <Link
          href="/chat"
          className="card flex items-center gap-3 hover:border-brand-400/30 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-400/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-400/20 transition-colors">
            <svg
              className="w-4 h-4 text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Ask coach</p>
            <p className="text-xs text-gray-600">Get advice</p>
          </div>
        </Link>
      </div>

      {/* ── Admin shortcut (only visible to admin) ── */}
      {profile?.role === 'admin' && (
        <Link
          href="/admin"
          className="card flex items-center gap-3 mt-3 hover:border-brand-400/30 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-400/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-400/20 transition-colors">
            <svg
              className="w-4 h-4 text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Admin panel</p>
            <p className="text-xs text-gray-600">Manage programs</p>
          </div>
        </Link>
      )}
    </div>
  );
}
