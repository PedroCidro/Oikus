export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-surface rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
}
