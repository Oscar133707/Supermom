import type { Zone } from "@/lib/program/exercises";

/** Enkel kroppskarta fram/bak som markerar vilka zoner övningen tränar. */
export function BodyMap({ zones, size = 120 }: { zones: Zone[]; size?: number }) {
  const on = (z: Zone) => (zones.includes(z) ? "var(--lime)" : "var(--surface-3)");
  const base = "var(--surface-3)";
  const h = size * 2;
  const Figure = ({ back }: { back?: boolean }) => (
    <svg viewBox="0 0 100 200" width={size} height={h} aria-hidden="true">
      <circle cx="50" cy="17" r="12" fill={base} />
      <rect x="45" y="28" width="10" height="8" rx="3" fill={base} />
      {/* axlar */}
      <circle cx="29" cy="44" r="8.5" fill={on("axlar")} />
      <circle cx="71" cy="44" r="8.5" fill={on("axlar")} />
      {/* bröst / övre rygg */}
      <rect x="34" y="36" width="32" height="23" rx="8" fill={back ? on("rygg") : on("brost")} />
      {/* mage / nedre rygg */}
      <rect x="35" y="60" width="30" height="25" rx="8" fill={back ? on("rygg") : on("bal")} />
      {/* höft / säte */}
      {back ? (
        <>
          <circle cx="42" cy="94" r="9.5" fill={on("sate")} />
          <circle cx="58" cy="94" r="9.5" fill={on("sate")} />
        </>
      ) : (
        <rect x="34" y="86" width="32" height="14" rx="6" fill={base} />
      )}
      {/* överarmar (fram: biceps, bak: triceps) */}
      <rect x="18.5" y="51" width="10" height="30" rx="5" fill={on("armar")} />
      <rect x="71.5" y="51" width="10" height="30" rx="5" fill={on("armar")} />
      {/* underarmar */}
      <rect x="17" y="83" width="9" height="27" rx="4.5" fill={base} />
      <rect x="74" y="83" width="9" height="27" rx="4.5" fill={base} />
      {/* lår */}
      <rect x="35" y="102" width="14" height="44" rx="7" fill={on("ben")} />
      <rect x="51" y="102" width="14" height="44" rx="7" fill={on("ben")} />
      {/* innerlår (fram) */}
      {!back && zones.includes("innerlar") && (
        <>
          <rect x="43" y="104" width="6" height="36" rx="3" fill="var(--lime)" />
          <rect x="51" y="104" width="6" height="36" rx="3" fill="var(--lime)" />
        </>
      )}
      {/* vader */}
      <rect x="36" y="149" width="11" height="40" rx="5.5" fill={back ? on("vader") : base} />
      <rect x="53" y="149" width="11" height="40" rx="5.5" fill={back ? on("vader") : base} />
    </svg>
  );
  return (
    <div className="flex items-end justify-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <Figure />
        <span className="text-xs text-ink-3">Fram</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Figure back />
        <span className="text-xs text-ink-3">Bak</span>
      </div>
    </div>
  );
}
