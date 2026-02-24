import { getActiveProgram } from '@/actions/workouts';
import { DAY_NAMES } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

export default async function WorkoutsPage() {
  const program = await getActiveProgram();

  if (!program) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold text-white mb-6">My Workouts</h1>
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">🏋️</div>
          <p className="text-gray-500">No program assigned yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Oscar will set one up for you soon!
          </p>
        </div>
      </div>
    );
  }

  // Group sessions by week
  const weeks: Record<number, typeof program.sessions> = {};
  for (const session of program.sessions) {
    if (!weeks[session.week_number]) weeks[session.week_number] = [];
    weeks[session.week_number].push(session);
  }
  for (const w of Object.values(weeks)) {
    w.sort((a, b) => a.day_number - b.day_number);
  }

  const completedCount = program.sessions.filter((s) => s.completed).length;
  const totalCount = program.sessions.length;

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{program.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {program.duration_weeks} weeks · {completedCount}/{totalCount} sessions done
        </p>
        {program.description && (
          <p className="text-sm text-gray-400 mt-2">{program.description}</p>
        )}
        <div className="w-full bg-[#1E1E1E] rounded-full h-2 mt-3">
          <div
            className="bg-brand-400 h-2 rounded-full transition-all"
            style={{
              width:
                totalCount > 0
                  ? `${Math.round((completedCount / totalCount) * 100)}%`
                  : '0%',
            }}
          />
        </div>
      </div>

      {/* Weeks */}
      <div className="space-y-6">
        {Object.entries(weeks)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([week, sessions]) => (
            <div key={week}>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Week {week}
              </h2>
              <div className="space-y-2">
                {sessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/workouts/${session.id}`}
                    className="card flex items-center gap-4 hover:border-brand-400/30 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        session.completed
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-brand-400/20 text-brand-400'
                      }`}
                    >
                      {session.completed ? '✓' : DAY_NAMES[session.day_number - 1]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">{session.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {session.exercises.length} exercises
                      </p>
                    </div>
                    <Badge variant={session.completed ? 'success' : 'default'}>
                      {session.completed ? 'Done' : 'Todo'}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
