'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ActiveProgram } from '@/lib/types';

export async function getActiveProgram(): Promise<ActiveProgram | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch active assignment with program + sessions
  const { data: assignment } = await supabase
    .from('program_assignments')
    .select(
      `
      *,
      program:workout_programs(
        *,
        sessions:workout_sessions(*)
      )
    `,
    )
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('assigned_at', { ascending: false })
    .limit(1)
    .single();

  if (!assignment || !assignment.program) return null;

  // Fetch which sessions this user has completed
  const { data: completions } = await supabase
    .from('session_completions')
    .select('session_id')
    .eq('user_id', user.id);

  const completedIds = new Set(
    (completions ?? []).map((c: { session_id: string }) => c.session_id),
  );

  const sessions = (assignment.program.sessions ?? []).map(
    (s: Record<string, unknown>) => ({
      ...s,
      completed: completedIds.has(s.id as string),
    }),
  );

  return {
    ...assignment.program,
    assignment,
    sessions,
  } as ActiveProgram;
}

export async function completeSession(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const { error } = await supabase.from('session_completions').upsert(
    {
      user_id: user.id,
      session_id: sessionId,
    },
    { onConflict: 'user_id,session_id' },
  );

  if (error) throw error;
  revalidatePath('/workouts');
}

export async function uncompleteSession(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const { error } = await supabase
    .from('session_completions')
    .delete()
    .eq('user_id', user.id)
    .eq('session_id', sessionId);

  if (error) throw error;
  revalidatePath('/workouts');
}
