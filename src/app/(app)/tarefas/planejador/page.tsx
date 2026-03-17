"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getWeekBounds, getMemberColor } from "@/lib/utils";
import { WeekNav } from "@/components/planejador/week-nav";
import { DayColumn } from "@/components/planejador/day-column";
import { AutomationSection } from "@/components/planejador/automation-section";
import type { Perfil, Tarefa, CicloExclusao } from "@/lib/supabase/types";

export default function PlanejadorPage() {
  const router = useRouter();
  const [weekStart, setWeekStart] = useState(() => getWeekBounds(new Date()).monday);
  const [tasks, setTasks] = useState<Tarefa[]>([]);
  const [members, setMembers] = useState<Perfil[]>([]);
  const [houseId, setHouseId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [recurringTasks, setRecurringTasks] = useState<Tarefa[]>([]);
  const [exclusions, setExclusions] = useState<CicloExclusao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: perfil } = await supabase
      .from("perfis")
      .select("house_id, role")
      .eq("id", user.id)
      .single<Pick<Perfil, "house_id" | "role">>();

    if (!perfil?.house_id) return;
    setHouseId(perfil.house_id);
    setIsAdmin(perfil.role === "admin");

    const { monday, sunday } = getWeekBounds(weekStart);
    const mondayStr = monday.toISOString().split("T")[0];
    const sundayStr = sunday.toISOString().split("T")[0];

    const { data: weekTasks } = await supabase
      .from("tarefas")
      .select("*")
      .eq("house_id", perfil.house_id)
      .gte("due_date", mondayStr)
      .lte("due_date", sundayStr)
      .order("due_date", { ascending: true })
      .returns<Tarefa[]>();

    const { data: allMembers } = await supabase
      .from("perfis")
      .select("*")
      .eq("house_id", perfil.house_id)
      .returns<Perfil[]>();

    // Get recurring tasks for automation section
    const { data: recurring } = await supabase
      .from("tarefas")
      .select("*")
      .eq("house_id", perfil.house_id)
      .eq("is_recurring", true)
      .gte("due_date", mondayStr)
      .lte("due_date", sundayStr)
      .returns<Tarefa[]>();

    // Get exclusions
    const groupIds = (recurring ?? [])
      .map((t) => t.recurrence_group_id)
      .filter(Boolean) as string[];

    let excls: CicloExclusao[] = [];
    if (groupIds.length > 0) {
      const { data } = await supabase
        .from("ciclo_exclusoes")
        .select("*")
        .eq("house_id", perfil.house_id)
        .in("recurrence_group_id", groupIds)
        .returns<CicloExclusao[]>();
      excls = data ?? [];
    }

    // Only spawn next-week instances when viewing the current real week
    const allMembersList = allMembers ?? [];
    const realWeek = getWeekBounds(new Date());
    const isCurrentWeek =
      monday.toISOString().split("T")[0] ===
      realWeek.monday.toISOString().split("T")[0];

    for (const task of isCurrentWeek ? (recurring ?? []) : []) {
      if (!task.due_date || !task.recurrence_group_id) continue;

      const nextDueDate = new Date(task.due_date + "T00:00:00");
      nextDueDate.setDate(nextDueDate.getDate() + 7);
      const nextDueStr = nextDueDate.toISOString().split("T")[0];

      // Check if next week's instance already exists
      const { data: existing } = await supabase
        .from("tarefas")
        .select("id")
        .eq("recurrence_group_id", task.recurrence_group_id)
        .eq("due_date", nextDueStr)
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Determine assignee
      let nextAssignee = task.assigned_to;
      if (task.cycle_members && task.assigned_to) {
        const taskExclusions = excls
          .filter((e) => e.recurrence_group_id === task.recurrence_group_id)
          .map((e) => e.user_id);

        // Use assigned_pool if set, otherwise fall back to all members
        const pool = task.assigned_pool && task.assigned_pool.length > 0
          ? task.assigned_pool
          : allMembersList.map((m) => m.id);

        const eligible = pool.filter((id) => !taskExclusions.includes(id));

        if (eligible.length > 0) {
          const currentIdx = eligible.indexOf(task.assigned_to);
          const nextIdx = (currentIdx + 1) % eligible.length;
          nextAssignee = eligible[nextIdx];
        }
      }

      await supabase.from("tarefas").insert({
        house_id: perfil.house_id,
        title: task.title,
        description: task.description,
        assigned_to: nextAssignee,
        assigned_pool: task.assigned_pool ?? [],
        due_date: nextDueStr,
        created_by: task.created_by,
        is_recurring: true,
        recurrence_group_id: task.recurrence_group_id,
        cycle_members: task.cycle_members,
      });
    }

    setTasks(weekTasks ?? []);
    setMembers(allMembersList);
    setRecurringTasks(recurring ?? []);
    setExclusions(excls);
    setLoading(false);
  }, [weekStart]);

  useEffect(() => {
    load();
  }, [load]);

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

  if (loading) {
    return (
      <main className="px-5 pt-14">
        <p className="text-text-secondary">Carregando...</p>
      </main>
    );
  }

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

      <WeekNav
        weekStart={weekStart}
        onPrev={() => {
          const d = new Date(weekStart);
          d.setDate(d.getDate() - 7);
          setWeekStart(d);
        }}
        onNext={() => {
          const d = new Date(weekStart);
          d.setDate(d.getDate() + 7);
          setWeekStart(d);
        }}
      />

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
              onUpdate={load}
            />
          )}
        </>
      )}
    </main>
  );
}
