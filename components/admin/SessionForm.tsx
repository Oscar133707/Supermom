'use client';

import { useState } from 'react';
import type { Exercise } from '@/lib/types';
import { DAY_NAMES } from '@/lib/utils';

const emptyExercise = (): Exercise => ({
  name: '',
  sets: 3,
  reps: '10',
  rest_sec: 60,
  notes: '',
});

interface Props {
  programId: string;
  action: (programId: string, formData: FormData) => Promise<void>;
  maxWeek: number;
}

export function SessionForm({ programId, action, maxWeek }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([emptyExercise()]);

  const addRow = () => setExercises((prev) => [...prev, emptyExercise()]);
  const removeRow = (i: number) =>
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof Exercise, value: string | number) =>
    setExercises((prev) =>
      prev.map((ex, idx) => (idx === i ? { ...ex, [field]: value } : ex)),
    );

  const boundAction = action.bind(null, programId);

  return (
    <form action={boundAction} className="space-y-5">
      <input type="hidden" name="exercises" value={JSON.stringify(exercises)} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Week number
          </label>
          <input
            name="week_number"
            type="number"
            min={1}
            max={maxWeek}
            defaultValue={1}
            required
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Day
          </label>
          <select name="day_number" required className="input">
            {DAY_NAMES.map((d, i) => (
              <option key={i} value={i + 1}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Session title
        </label>
        <input
          name="title"
          type="text"
          required
          placeholder="e.g. Day 1 — Upper Body"
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <textarea name="notes" rows={2} className="input" placeholder="Any warm-up tips, focus areas…" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Exercises
          </label>
          <button
            type="button"
            onClick={addRow}
            className="text-sm text-brand-400 font-medium hover:text-brand-300"
          >
            + Add exercise
          </button>
        </div>

        <div className="space-y-2">
          {exercises.map((ex, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 items-center p-3 bg-[#1E1E1E] rounded-xl"
            >
              <input
                className="input col-span-4"
                placeholder="Exercise name"
                value={ex.name}
                onChange={(e) => update(i, 'name', e.target.value)}
                required
              />
              <input
                className="input col-span-2"
                type="number"
                placeholder="Sets"
                min={1}
                value={ex.sets}
                onChange={(e) => update(i, 'sets', parseInt(e.target.value))}
              />
              <input
                className="input col-span-2"
                placeholder="Reps"
                value={ex.reps}
                onChange={(e) => update(i, 'reps', e.target.value)}
              />
              <input
                className="input col-span-2"
                type="number"
                placeholder="Rest (s)"
                min={0}
                value={ex.rest_sec ?? ''}
                onChange={(e) => update(i, 'rest_sec', parseInt(e.target.value))}
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                disabled={exercises.length === 1}
                className="col-span-2 text-red-400 hover:text-red-600 text-sm font-medium disabled:opacity-30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="btn-primary w-full">
        Save session
      </button>
    </form>
  );
}
