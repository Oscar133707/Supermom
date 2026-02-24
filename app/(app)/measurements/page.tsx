import { getMeasurements, addMeasurement } from '@/actions/measurements';
import { ProgressChart } from '@/components/measurements/ProgressChart';
import { formatDate } from '@/lib/utils';

export default async function MeasurementsPage() {
  const measurements = await getMeasurements();
  const latest = measurements.at(-1);

  // Default date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h1 className="text-2xl font-bold text-white mb-6">My Progress</h1>

      {/* Latest stats */}
      {latest && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(
            [
              ['⚖️', 'Weight', latest.weight_kg, 'kg'],
              ['📏', 'Waist', latest.waist_cm, 'cm'],
              ['🍑', 'Hips', latest.hips_cm, 'cm'],
              ['👚', 'Chest', latest.chest_cm, 'cm'],
            ] as [string, string, number | null, string][]
          ).map(([icon, label, value, unit]) =>
            value !== null ? (
              <div key={label} className="card">
                <p className="text-xs text-gray-400">
                  {icon} {label}
                </p>
                <p className="text-2xl font-bold text-white mt-0.5">
                  {value}
                  <span className="text-sm font-normal text-gray-400">
                    {' '}
                    {unit}
                  </span>
                </p>
              </div>
            ) : null,
          )}
        </div>
      )}

      {/* Chart */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-gray-400 mb-4">
          Progress chart
        </h2>
        <ProgressChart data={measurements} />
      </div>

      {/* Log form */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-400 mb-4">
          Log measurements
        </h2>
        <form action={addMeasurement} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Date
            </label>
            <input name="date" type="date" defaultValue={today} required className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Weight (kg)
              </label>
              <input
                name="weight_kg"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g. 65.5"
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Waist (cm)
              </label>
              <input
                name="waist_cm"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g. 82"
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Hips (cm)
              </label>
              <input
                name="hips_cm"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g. 95"
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Chest (cm)
              </label>
              <input
                name="chest_cm"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g. 88"
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              className="input"
              placeholder="How are you feeling today?"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Save measurements
          </button>
        </form>
      </div>

      {/* History */}
      {measurements.length > 0 && (
        <div className="card mt-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">History</h2>
          <div className="space-y-2">
            {[...measurements].reverse().map((m) => (
              <div
                key={m.id}
                className="flex items-start justify-between py-2 border-b border-[#2A2A2A] last:border-0"
              >
                <p className="text-sm font-medium text-white">
                  {formatDate(m.date)}
                </p>
                <div className="text-right text-xs text-gray-500 space-y-0.5">
                  {m.weight_kg !== null && <p>{m.weight_kg} kg</p>}
                  {m.waist_cm !== null && <p>Waist {m.waist_cm} cm</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
