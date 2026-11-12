export type Role = "mom" | "admin";
export type Energy = "low" | "normal" | "high";
export type ActivityKind = "min_dose" | "walk" | "bike" | "strength" | "dance" | "mobility" | "other";
export type Lithium = "yes" | "no" | "unknown";
export type Theme = "system" | "light" | "dark";

export interface Profile {
  id: string;
  email: string | null;
  role: Role;
  display_name: string | null;
  height_cm: number | null;
  start_weight_kg: number | null;
  takes_lithium: Lithium;
  why_text: string | null;
  anchor_text: string | null;
  heavy_day_text: string | null;
  protein_goal_g: number;
  water_goal_glasses: number;
  theme: Theme;
  paused_until: string | null;
  onboarded_at: string | null;
  created_at: string;
}

export interface DailyCheckin {
  user_id: string;
  date: string;
  energy: Energy | null;
  mood: number | null;
  sleep_hours: number | null;
  meds_taken: boolean | null;
  note: string | null;
}

export interface WorkoutExerciseLog {
  key: string;
  level: number;
  sets: number[]; // reps (or seconds) per completed set
}

export interface Activity {
  id: string;
  user_id: string;
  date: string;
  kind: ActivityKind;
  title: string | null;
  minutes: number;
  songs: number;
  outdoor: boolean;
  feel_before: number | null;
  feel_after: number | null;
  effort: number | null;
  workout: WorkoutExerciseLog[] | null;
  created_at: string;
}

export interface ProgramState {
  user_id: string;
  phase: number;
  phase_started_on: string;
  last_increase_on: string | null;
  last_deload_on: string | null;
}

export interface ProgramProposal {
  id: string;
  user_id: string;
  created_by: string | null;
  kind: "phase_up" | "level_up" | "level_down" | "phase_down";
  exercise_key: string | null;
  to_value: number;
  message: string | null;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  decided_at: string | null;
}

export interface IntakeLog {
  id: string;
  user_id: string;
  date: string;
  kind: "protein" | "water";
  amount: number;
  label: string | null;
  created_at: string;
}

export type InjectionSite = "mage_v" | "mage_h" | "lar_v" | "lar_h" | "arm_v" | "arm_h";

export interface Injection {
  id: string;
  user_id: string;
  date: string;
  dose_mg: number;
  site: InjectionSite | null;
  note: string | null;
  created_at: string;
}

export interface Symptoms {
  user_id: string;
  date: string;
  nausea: number;
  vomiting: number;
  diarrhea: number;
  constipation: number;
  red_flags: string[];
  note: string | null;
}

export interface BodyMetrics {
  user_id: string;
  date: string;
  weight_kg: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  chest_cm: number | null;
  upper_arm_cm: number | null;
  thigh_cm: number | null;
  calf_cm: number | null;
}

export type FunctionTestKey = "chair_stand_30s" | "walk_minutes" | "bike_minutes" | "wall_pushups";

export interface FunctionTest {
  id: string;
  user_id: string;
  date: string;
  test_key: FunctionTestKey;
  value: number;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  url: string;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  user_id: string;
  key: string | null;
  text: string;
  done_at: string | null;
  created_at: string;
}

export type MessageTrigger = "now" | "any" | "comeback" | "milestone" | "heavy_day";

export interface Message {
  id: string;
  to_user: string;
  from_user: string | null;
  body: string;
  trigger: MessageTrigger;
  released_at: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Reminder {
  user_id: string;
  kind: "move" | "nutrition";
  time_local: string;
  enabled: boolean;
  last_sent_on: string | null;
}
