"use client";

import Link from "next/link";

export function WeekNav({
  weekStart,
  prevWeek,
  nextWeek,
}: {
  weekStart: Date;
  prevWeek: string;
  nextWeek: string;
}) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const fmt = (d: Date) => d.getDate();
  const month = weekEnd.toLocaleDateString("pt-BR", { month: "short" });

  return (
    <div className="flex items-center justify-between px-5 pb-3">
      <Link href={`/tarefas/planejador?week=${prevWeek}`} className="p-1 text-text-secondary">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M11 4L5 9L11 14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
      <span className="text-[15px] font-semibold">
        {fmt(weekStart)} – {fmt(weekEnd)} {month}
      </span>
      <Link href={`/tarefas/planejador?week=${nextWeek}`} className="p-1 text-text-secondary">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M7 4L13 9L7 14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
}
