import { getPrograms } from '@/actions/admin';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Workout Programs</h1>
        <Link href="/admin/programs/new" className="btn-primary">
          + New program
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-400">No programs yet.</p>
          <Link
            href="/admin/programs/new"
            className="text-brand-400 text-sm font-medium mt-2 inline-block"
          >
            Create your first program →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map((p) => (
            <Link
              key={p.id}
              href={`/admin/programs/${p.id}`}
              className="card flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-semibold text-white">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {p.duration_weeks} weeks · Created {formatDate(p.created_at)}
                </p>
                {p.description && (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                    {p.description}
                  </p>
                )}
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
