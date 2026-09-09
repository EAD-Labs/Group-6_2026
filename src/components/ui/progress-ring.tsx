export function ProgressRing({
  label,
  value,
}: {
  label?: string;
  value: number;
}) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className="progress-ring"
      style={{ "--progress": `${safeValue * 3.6}deg` } as React.CSSProperties}
      role="img"
      aria-label={label ?? `${safeValue}% complete`}
    >
      <span>{safeValue}%</span>
    </div>
  );
}
