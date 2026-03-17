"use client";

export function Checkbox({
  checked,
  missed,
  pending,
  onChange,
}: {
  checked: boolean;
  missed?: boolean;
  pending?: boolean;
  onChange?: () => void;
}) {
  if (missed) {
    return (
      <div className="w-5 h-5 rounded border-2 border-danger flex items-center justify-center shrink-0">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1 1L9 9M9 1L1 9" stroke="#D4453A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (pending) {
    return (
      <div className="w-5 h-5 rounded border-2 border-warning bg-warning-light flex items-center justify-center shrink-0">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <circle cx="5" cy="5" r="3" fill="#B8860B" />
        </svg>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked
          ? "bg-accent border-accent"
          : "border-surface-dim hover:border-accent/50"
      }`}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
