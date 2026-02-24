export type UserRole = 'mom' | 'admin';
export type ChatRole = 'user' | 'assistant';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string; // "10-12", "AMRAP", etc.
  rest_sec?: number;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  program_id: string;
  week_number: number;
  day_number: number;
  title: string;
  exercises: Exercise[];
  notes: string | null;
  created_at: string;
}

export interface SessionCompletion {
  id: string;
  user_id: string;
  session_id: string;
  completed_at: string;
}

export interface ProgramAssignment {
  id: string;
  user_id: string;
  program_id: string;
  start_date: string;
  assigned_by: string;
  assigned_at: string;
  is_active: boolean;
}

export interface Measurement {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  chest_cm: number | null;
  notes: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: ChatRole;
  content: string;
  created_at: string;
}

// Joined type used in the workouts UI
export interface SessionWithCompletion extends WorkoutSession {
  completed: boolean;
}

export interface ActiveProgram extends WorkoutProgram {
  assignment: ProgramAssignment;
  sessions: SessionWithCompletion[];
}
