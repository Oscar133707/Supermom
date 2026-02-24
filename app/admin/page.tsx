import { getPrograms } from '@/actions/admin';
import { getActiveProgram } from '@/actions/workouts';
import Link from 'next/link';

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ assigned?: string }>;
}) {
  const params = await searchParams;
  const [programs, activeProgram] = await Promise.all([
    getPrograms(),
    getActiveProgram(),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
      <p className="text-gray-400 text-sm mb-8">Manage your mom&apos;s fitness program.</p>

      {params.assigned && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-sm">
          ✅ Program assigned successfully!
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card">
          <p className="text-xs text-gray-400 mb-1">Programs</p>
          <p className="text-3xl font-bold text-white">{programs.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 mb-1">Active program</p>
          <p className="text-sm font-semibold text-white mt-1 truncate">
            {activeProgram?.name ?? 'None'}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 mb-1">Sessions done</p>
          <p className="text-3xl font-bold text-brand-400">
            {activeProgram?.sessions.filter((s) => s.completed).length ?? 0}
            <span className="text-base font-normal text-gray-400">
              /{activeProgram?.sessions.length ?? 0}
            </span>
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link href="/admin/programs/new" className="btn-primary">
          + New program
        </Link>
        <Link href="/admin/assign" className="btn-secondary">
          Assign program
        </Link>
      </div>
    </div>
  );
}
