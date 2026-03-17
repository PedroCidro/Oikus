"use client";

import { TaskPill } from "./task-pill";
import type { Tarefa, Perfil } from "@/lib/supabase/types";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export function DayColumn({
  date,
  tasks,
  memberMap,
  isToday,
}: {
  date: Date;
  tasks: Tarefa[];
  memberMap: Record<string, Perfil>;
  isToday: boolean;
}) {
  const day = date.getDate();
  const weekday = WEEKDAYS[date.getDay()];

  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div className="flex flex-col items-center pb-2">
        <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">
          {weekday}
        </span>
        <span
          className={`text-[20px] font-bold font-heading mt-0.5 ${
            isToday ? "text-accent" : "text-text-primary"
          }`}
        >
          {day}
        </span>
      </div>
      <div
        className={`flex flex-col gap-1 flex-1 rounded-lg p-1 ${
          isToday ? "bg-accent/5" : ""
        }`}
      >
        {tasks.map((t) => {
          const assignee = t.assigned_to ? memberMap[t.assigned_to] : null;
          return (
            <TaskPill
              key={t.id}
              title={t.title}
              assigneeName={assignee?.name.split(" ")[0] ?? "—"}
              assigneeId={t.assigned_to ?? t.created_by}
            />
          );
        })}
      </div>
    </div>
  );
}
