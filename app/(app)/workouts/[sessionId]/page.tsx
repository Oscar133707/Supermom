import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ExerciseList } from '@/components/workouts/ExerciseList';
import { CompleteSessionButton } from '@/components/workouts/CompleteSessionButton';
import { DAY_NAMES } from '@/lib/utils';
import Link from 'next/link';
import type { WorkoutSession, SessionCompletion } from '@/lib/types';

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionPage({ params }: Props) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: session }, { data: completion }] = await Promise.all([
    supabase
      .from('workout_sessions')
      .select('*')
      .eq('id', sessionId)
      .single(),
    supabase
      .from('session_completions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user!.id)
      .maybeSingle(),
  ]);

  if (!session) notFound();

  const s = session as WorkoutSession;
  const completed = !!(completion as SessionCompletion | null);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Back */}
      <Link
        href="/workouts"
        className="text-sm text-brand-400 font-medium hover:text-brand-300 flex items-center gap-1 mb-5 transition-colors"
      >
        ← Back to workouts
      </Link>

      {/* Header */}
      <div className="mb-5">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          Week {s.week_number} · {DAY_NAMES[s.day_number - 1]}
        </p>
        <h1 className="text-2xl font-bold text-white">{s.title}</h1>
        {s.notes && (
          <p className="text-sm text-gray-300 mt-2 p-3 bg-[#1E1E1E] rounded-xl border border-[#2A2A2A]">
            💡 {s.notes}
          </p>
        )}
      </div>

      {/* Exercises */}
      <div className="card mb-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">
          {s.exercises.length} exercise{s.exercises.length !== 1 ? 's' : ''}
        </h2>
        <ExerciseList exercises={s.exercises} />
      </div>

      {/* Complete button */}
      <CompleteSessionButton sessionId={s.id} completed={completed} />
    </div>
  );
}
