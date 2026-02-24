import { createProgram } from '@/actions/admin';
import Link from 'next/link';

export default function NewProgramPage() {
  return (
    <div className="max-w-xl">
      <Link
        href="/admin/programs"
        className="text-sm text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 mb-6"
      >
        ← Back to programs
      </Link>

      <h1 className="text-2xl font-bold text-white mb-6">New Program</h1>

      <div className="card">
        <form action={createProgram} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Program name
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. 4-Week Beginner Program"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              name="description"
              rows={3}
              className="input"
              placeholder="What is this program about? Goals, intensity level, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Duration (weeks)
            </label>
            <input
              name="duration_weeks"
              type="number"
              min={1}
              max={52}
              defaultValue={4}
              required
              className="input"
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Create program
          </button>
        </form>
      </div>
    </div>
  );
}
