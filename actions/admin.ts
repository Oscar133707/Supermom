'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { WorkoutProgram, WorkoutSession, Profile } from '@/lib/types';

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') throw new Error('Forbidden');

  return { supabase, userId: user.id };
}

// ─── Programs ──────────────────────────────────────────────────────────────────

export async function getPrograms(): Promise<WorkoutProgram[]> {
  const { supabase } = await assertAdmin();
  const { data } = await supabase
    .from('workout_programs')
    .select('*')
    .order('created_at', { ascending: false });
  return (data ?? []) as WorkoutProgram[];
}

export async function getProgramWithSessions(
  programId: string,
): Promise<(WorkoutProgram & { sessions: WorkoutSession[] }) | null> {
  const { supabase } = await assertAdmin();
  const { data } = await supabase
    .from('workout_programs')
    .select('*, sessions:workout_sessions(*)')
    .eq('id', programId)
    .single();
  return data as (WorkoutProgram & { sessions: WorkoutSession[] }) | null;
}

export async function createProgram(formData: FormData) {
  const { supabase, userId } = await assertAdmin();

  const { data, error } = await supabase
    .from('workout_programs')
    .insert({
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      duration_weeks: parseInt(formData.get('duration_weeks') as string),
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/admin/programs');
  redirect(`/admin/programs/${data.id}`);
}

export async function deleteProgram(programId: string) {
  const { supabase } = await assertAdmin();
  const { error } = await supabase
    .from('workout_programs')
    .delete()
    .eq('id', programId);
  if (error) throw error;
  revalidatePath('/admin/programs');
}

// ─── Sessions ──────────────────────────────────────────────────────────────────

export async function createSession(programId: string, formData: FormData) {
  const { supabase } = await assertAdmin();

  const exercisesRaw = formData.get('exercises') as string;
  const exercises = JSON.parse(exercisesRaw);

  const { error } = await supabase.from('workout_sessions').insert({
    program_id: programId,
    week_number: parseInt(formData.get('week_number') as string),
    day_number: parseInt(formData.get('day_number') as string),
    title: formData.get('title') as string,
    exercises,
    notes: (formData.get('notes') as string) || null,
  });

  if (error) throw error;
  revalidatePath(`/admin/programs/${programId}`);
  redirect(`/admin/programs/${programId}`);
}

export async function deleteSession(sessionId: string, programId: string) {
  const { supabase } = await assertAdmin();
  const { error } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('id', sessionId);
  if (error) throw error;
  revalidatePath(`/admin/programs/${programId}`);
}

// ─── Assignments ───────────────────────────────────────────────────────────────

export async function getMomUsers(): Promise<Profile[]> {
  const { supabase } = await assertAdmin();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'mom');
  return (data ?? []) as Profile[];
}

export async function assignProgram(formData: FormData) {
  const { supabase, userId } = await assertAdmin();

  const targetUserId = formData.get('user_id') as string;
  const programId = formData.get('program_id') as string;
  const startDate = formData.get('start_date') as string;

  // Deactivate any existing active assignment for this user
  await supabase
    .from('program_assignments')
    .update({ is_active: false })
    .eq('user_id', targetUserId)
    .eq('is_active', true);

  // Upsert the new assignment
  const { error } = await supabase.from('program_assignments').upsert(
    {
      user_id: targetUserId,
      program_id: programId,
      start_date: startDate,
      assigned_by: userId,
      is_active: true,
    },
    { onConflict: 'user_id,program_id' },
  );

  if (error) throw error;
  revalidatePath('/admin');
  redirect('/admin?assigned=1');
}
