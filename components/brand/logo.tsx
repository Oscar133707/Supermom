export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <rect width="512" height="512" rx="116" fill="#131411" />
      <circle cx="256" cy="256" r="128" fill="none" stroke="#2c2e27" strokeWidth="44" />
      <path d="M256 128 A128 128 0 1 1 135.7 299.8" fill="none" stroke="#c8f53c" strokeWidth="44" strokeLinecap="round" />
      <circle cx="256" cy="256" r="30" fill="#c8f53c" />
    </svg>
  );
}
