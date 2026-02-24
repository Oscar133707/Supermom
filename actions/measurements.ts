'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Measurement } from '@/lib/types';

export async function addMeasurement(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const date = formData.get('date') as string;
  const weight_kg = formData.get('weight_kg')
    ? parseFloat(formData.get('weight_kg') as string)
    : null;
  const waist_cm = formData.get('waist_cm')
    ? parseFloat(formData.get('waist_cm') as string)
    : null;
  const hips_cm = formData.get('hips_cm')
    ? parseFloat(formData.get('hips_cm') as string)
    : null;
  const chest_cm = formData.get('chest_cm')
    ? parseFloat(formData.get('chest_cm') as string)
    : null;
  const notes = (formData.get('notes') as string) || null;

  const { error } = await supabase.from('measurements').upsert(
    {
      user_id: user.id,
      date,
      weight_kg,
      waist_cm,
      hips_cm,
      chest_cm,
      notes,
    },
    { onConflict: 'user_id,date' },
  );

  if (error) throw error;
  revalidatePath('/measurements');
}

export async function getMeasurements(): Promise<Measurement[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('measurements')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true });

  return (data ?? []) as Measurement[];
}
