"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getMemberColor } from "@/lib/utils";
import { WeekNav } from "@/components/planejador/week-nav";
import { DayColumn } from "@/components/planejador/day-column";
import { AutomationSection } from "@/components/planejador/automation-section";
import type { Perfil, Tarefa, CicloExclusao } from "@/lib/supabase/types";

export function PlanejadorClient({
  weekStart,
  prevWeek,
  nextWeek,
  tasks,
  members,
  recurringTasks,
  exclusions,
  houseId,
  isAdmin,
}: {
  weekStart: Date;
  prevWeek: string;
  nextWeek: string;
  tasks: Tarefa[];
  members: Perfil[];
  recurringTasks: Tarefa[];
  exclusions: CicloExclusao[];
  houseId: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));

  // Build 7 days starting from weekStart
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(d);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function tasksForDay(date: Date) {
    const dateStr = date.toISOString().split("T")[0];
    return tasks.filter((t) => t.due_date === dateStr);
  }

  // Unique recurring tasks (deduplicate by recurrence_group_id)
  const uniqueRecurring = recurringTasks.filter(
    (t, i, arr) =>
      arr.findIndex(
        (x) => x.recurrence_group_id === t.recurrence_group_id
      ) === i
  );

  const selectedRecurring = selectedTaskId
    ? uniqueRecurring.find((t) => t.id === selectedTaskId) ?? null
    : uniqueRecurring[0] ?? null;

  return (
    <main className="pt-14 pb-6">
      <div className="flex items-center gap-2.5 px-5 mb-4">
        <button onClick={() => router.back()} className="text-text-secondary">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 4L6 10L12 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="font-heading text-[28px] font-bold">Planejador</h1>
      </div>

      <WeekNav weekStart={weekStart} prevWeek={prevWeek} nextWeek={nextWeek} />

      <div className="flex gap-0.5 px-3" style={{ minHeight: 260 }}>
        {days.map((d) => (
          <DayColumn
            key={d.toISOString()}
            date={d}
            tasks={tasksForDay(d)}
            memberMap={memberMap}
            isToday={d.getTime() === today.getTime()}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-5 py-3">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: getMemberColor(m.id) }}
            />
            <span className="text-[12px] font-medium text-text-secondary">
              {m.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Admin automation for recurring tasks */}
      {isAdmin && uniqueRecurring.length > 0 && (
        <>
          {uniqueRecurring.length > 1 && (
            <div className="flex gap-2 px-5 pb-2 overflow-x-auto">
              {uniqueRecurring.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTaskId(t.id)}
                  className={`shrink-0 text-[13px] font-medium px-3 py-1.5 rounded-full transition-colors ${
                    selectedRecurring?.id === t.id
                      ? "bg-accent text-white"
                      : "bg-surface text-text-secondary"
                  }`}
                >
                  {t.title}
                </button>
              ))}
            </div>
          )}
          {selectedRecurring && (
            <AutomationSection
              task={selectedRecurring}
              members={members}
              exclusions={exclusions.filter(
                (e) =>
                  e.recurrence_group_id ===
                  selectedRecurring.recurrence_group_id
              )}
              houseId={houseId}
              onUpdate={() => router.refresh()}
            />
          )}
        </>
      )}
    </main>
  );
}
