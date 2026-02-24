export default function Loading() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-8 animate-pulse">
      <div className="h-8 w-56 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-40 bg-gray-200 rounded mb-6" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-2xl mb-3" />
      ))}
    </div>
  );
}
