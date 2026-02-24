import { getProgramWithSessions, deleteSession } from '@/actions/admin';
import { notFound } from 'next/navigation';
import { SessionForm } from '@/components/admin/SessionForm';
import { createSession } from '@/actions/admin';
import { DAY_NAMES, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

interface Props {
  params: Promise<{ programId: string }>;
}

export default async function ProgramDetailPage({ params }: Props) {
  const { programId } = await params;
  const program = await getProgramWithSessions(programId);

  if (!program) notFound();

  const sessionsByWeek: Record<number, typeof program.sessions> = {};
  for (const s of program.sessions) {
    if (!sessionsByWeek[s.week_number]) sessionsByWeek[s.week_number] = [];
    sessionsByWeek[s.week_number].push(s);
  }
  for (const w of Object.values(sessionsByWeek)) {
    w.sort((a, b) => a.day_number - b.day_number);
  }

  async function deleteSessionAction(sessionId: string) {
    'use server';
    await deleteSession(sessionId, programId);
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/programs"
        className="text-sm text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 mb-6"
      >
        ← Back to programs
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{program.name}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {program.duration_weeks} weeks · {program.sessions.length} sessions ·{' '}
            Created {formatDate(program.created_at)}
          </p>
          {program.description && (
            <p className="text-sm text-gray-400 mt-2">{program.description}</p>
          )}
        </div>
        <Link href="/admin/assign" className="btn-secondary text-xs">
          Assign to mom
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Sessions list */}
        <div className="col-span-3">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Sessions</h2>

          {program.sessions.length === 0 ? (
            <div className="card text-center py-8 text-gray-400 text-sm">
              No sessions yet. Add one using the form →
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(sessionsByWeek)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([week, sessions]) => (
                  <div key={week}>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
                      Week {week}
                    </p>
                    <div className="space-y-2">
                      {sessions.map((s) => (
                        <div
                          key={s.id}
                          className="card flex items-start gap-3"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-400/20 text-brand-400 text-xs font-bold flex items-center justify-center">
                            {DAY_NAMES[s.day_number - 1]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-white">
                              {s.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {s.exercises.length} exercises
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {s.exercises.map((ex, i) => (
                                <Badge key={i} variant="default">
                                  {ex.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <form action={deleteSessionAction.bind(null, s.id)}>
                            <button
                              type="submit"
                              className="text-xs text-red-400 hover:text-red-600 font-medium"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Add session form */}
        <div className="col-span-2">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">
            Add session
          </h2>
          <div className="card">
            <SessionForm
              programId={programId}
              action={createSession}
              maxWeek={program.duration_weeks}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
