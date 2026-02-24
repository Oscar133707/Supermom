import type { Exercise } from '@/lib/types';

export function ExerciseList({ exercises }: { exercises: Exercise[] }) {
  if (!exercises || exercises.length === 0) {
    return <p className="text-sm text-gray-400 italic">No exercises listed.</p>;
  }

  return (
    <div className="space-y-3">
      {exercises.map((ex, i) => (
        <div
          key={i}
          className="flex items-start gap-4 p-3 bg-[#1E1E1E] rounded-xl"
        >
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-400/20 text-brand-400 text-xs font-bold flex items-center justify-center">
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm">{ex.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {ex.sets} sets × {ex.reps} reps
              {ex.rest_sec ? ` · ${ex.rest_sec}s rest` : ''}
            </p>
            {ex.notes && (
              <p className="text-xs text-gray-400 mt-1 italic">{ex.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
