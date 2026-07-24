export function LoadingBlock({ lines = 4 }) {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Loading">
      <div className="skeleton__line skeleton__line--lg" />
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`skeleton__line ${index % 2 ? "skeleton__line--sm" : "skeleton__line--md"}`}
        />
      ))}
    </div>
  );
}
