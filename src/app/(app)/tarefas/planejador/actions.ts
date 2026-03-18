"use server";

import { createClient } from "@/lib/supabase/server";
import { getWeekBounds } from "@/lib/utils";
import type { Tarefa, CicloExclusao } from "@/lib/supabase/types";

export async function spawnRecurringTasks(houseId: string, allMemberIds: string[]) {
  const supabase = await createClient();
  const { monday, sunday } = getWeekBounds(new Date());
  const mondayStr = monday.toISOString().split("T")[0];
  const sundayStr = sunday.toISOString().split("T")[0];

  // Get recurring tasks for this week
  const { data: recurring } = await supabase
    .from("tarefas")
    .select("*")
    .eq("house_id", houseId)
    .eq("is_recurring", true)
    .gte("due_date", mondayStr)
    .lte("due_date", sundayStr)
    .returns<Tarefa[]>();

  if (!recurring || recurring.length === 0) return;

  // Get exclusions for all recurring groups
  const groupIds = recurring
    .map((t) => t.recurrence_group_id)
    .filter(Boolean) as string[];

  let excls: CicloExclusao[] = [];
  if (groupIds.length > 0) {
    const { data } = await supabase
      .from("ciclo_exclusoes")
      .select("*")
      .eq("house_id", houseId)
      .in("recurrence_group_id", groupIds)
      .returns<CicloExclusao[]>();
    excls = data ?? [];
  }

  // Collect all inserts to batch them
  const inserts: Record<string, unknown>[] = [];

  // Check which next-week instances already exist in a single query
  const nextDueDates: Record<string, string> = {};
  for (const task of recurring) {
    if (!task.due_date || !task.recurrence_group_id) continue;
    const nextDueDate = new Date(task.due_date + "T00:00:00");
    nextDueDate.setDate(nextDueDate.getDate() + 7);
    nextDueDates[task.recurrence_group_id] = nextDueDate.toISOString().split("T")[0];
  }

  const nextDueDateValues = [...new Set(Object.values(nextDueDates))];
  const nextGroupIds = Object.keys(nextDueDates);

  if (nextGroupIds.length === 0) return;

  // Single query to check all existing next-week instances
  const { data: existingNext } = await supabase
    .from("tarefas")
    .select("recurrence_group_id, due_date")
    .in("recurrence_group_id", nextGroupIds)
    .in("due_date", nextDueDateValues);

  const existingSet = new Set(
    (existingNext ?? []).map((e) => `${e.recurrence_group_id}:${e.due_date}`)
  );

  for (const task of recurring) {
    if (!task.due_date || !task.recurrence_group_id) continue;

    const nextDueStr = nextDueDates[task.recurrence_group_id];
    if (existingSet.has(`${task.recurrence_group_id}:${nextDueStr}`)) continue;

    // Determine assignee
    let nextAssignee = task.assigned_to;
    if (task.cycle_members && task.assigned_to) {
      const taskExclusions = excls
        .filter((e) => e.recurrence_group_id === task.recurrence_group_id)
        .map((e) => e.user_id);

      const pool =
        task.assigned_pool && task.assigned_pool.length > 0
          ? task.assigned_pool
          : allMemberIds;

      const eligible = pool.filter((id) => !taskExclusions.includes(id));

      if (eligible.length > 0) {
        const currentIdx = eligible.indexOf(task.assigned_to);
        const nextIdx = (currentIdx + 1) % eligible.length;
        nextAssignee = eligible[nextIdx];
      }
    }

    inserts.push({
      house_id: houseId,
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

  if (inserts.length > 0) {
    await supabase.from("tarefas").insert(inserts as any);
  }
}
