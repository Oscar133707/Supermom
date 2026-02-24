import { getPrograms, getMomUsers, assignProgram } from '@/actions/admin';
import Link from 'next/link';

export default async function AssignPage() {
  const [programs, momUsers] = await Promise.all([
    getPrograms(),
    getMomUsers(),
  ]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-white mb-1">Assign Program</h1>
      <p className="text-sm text-gray-400 mb-6">
        Choose a program and assign it to your mom. Her current active program
        will be deactivated.
      </p>

      {programs.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-400 text-sm">
            No programs yet.{' '}
            <Link href="/admin/programs/new" className="text-brand-400 font-medium">
              Create one first.
            </Link>
          </p>
        </div>
      ) : momUsers.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-400 text-sm">
            No user accounts found with the &ldquo;mom&rdquo; role yet.
          </p>
        </div>
      ) : (
        <div className="card">
          <form action={assignProgram} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Assign to
              </label>
              <select name="user_id" required className="input">
                {momUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name ?? u.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Program
              </label>
              <select name="program_id" required className="input">
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.duration_weeks} weeks)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Start date
              </label>
              <input
                name="start_date"
                type="date"
                defaultValue={today}
                required
                className="input"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Assign program
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
