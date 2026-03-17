"use client";

export function FilterChips({
  options,
  active,
  onChange,
}: {
  options: string[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
            active === opt
              ? "bg-text-primary text-white"
              : "bg-surface text-text-secondary hover:bg-surface-dim"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
