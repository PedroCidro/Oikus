"use client";

import { Toggle } from "@/components/ui/toggle";
import { getMemberColor } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Perfil, Tarefa, CicloExclusao } from "@/lib/supabase/types";

export function AutomationSection({
  task,
  members,
  exclusions,
  houseId,
  onUpdate,
}: {
  task: Tarefa;
  members: Perfil[];
  exclusions: CicloExclusao[];
  houseId: string;
  onUpdate: () => void;
}) {
  const excludedIds = new Set(exclusions.map((e) => e.user_id));

  async function toggleRecurring(val: boolean) {
    const supabase = createClient();
    await supabase
      .from("tarefas")
      .update({
        is_recurring: val,
        recurrence_group_id: val && !task.recurrence_group_id
          ? crypto.randomUUID()
          : task.recurrence_group_id,
      })
      .eq("id", task.id);
    onUpdate();
  }

  async function toggleCycle(val: boolean) {
    const supabase = createClient();
    await supabase
      .from("tarefas")
      .update({ cycle_members: val })
      .eq("id", task.id);
    onUpdate();
  }

  async function toggleExclusion(userId: string) {
    const supabase = createClient();
    if (!task.recurrence_group_id) return;

    if (excludedIds.has(userId)) {
      await supabase
        .from("ciclo_exclusoes")
        .delete()
        .eq("recurrence_group_id", task.recurrence_group_id)
        .eq("user_id", userId);
    } else {
      await supabase.from("ciclo_exclusoes").insert({
        house_id: houseId,
        recurrence_group_id: task.recurrence_group_id,
        user_id: userId,
      });
    }
    onUpdate();
  }

  return (
    <div className="px-5 pb-5">
      <div className="border-t border-surface-dim pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary mb-3">
          Automação — {task.title}
        </p>

        <div className="flex items-center justify-between py-3">
          <span className="text-[15px] font-medium">Repete semanalmente</span>
          <Toggle checked={task.is_recurring} onChange={toggleRecurring} />
        </div>

        {task.is_recurring && (
          <>
            <div className="flex items-center justify-between py-3 border-t border-surface-dim">
              <span className="text-[15px] font-medium">
                Revezar os membros
              </span>
              <Toggle checked={task.cycle_members} onChange={toggleCycle} />
            </div>

            {task.cycle_members && (
              <div className="pt-3 border-t border-surface-dim">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary mb-2">
                  No revezamento
                </p>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => {
                    const isExcluded = excludedIds.has(m.id);
                    const color = getMemberColor(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleExclusion(m.id)}
                        className={`flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3 bg-surface transition-opacity ${
                          isExcluded ? "opacity-40" : ""
                        }`}
                      >
                        <div
                          style={{ backgroundColor: color }}
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                        >
                          <span className="text-[11px] font-bold text-white">
                            {m.name[0]}
                          </span>
                        </div>
                        <span
                          className={`text-[13px] font-medium ${
                            isExcluded ? "line-through text-text-secondary" : ""
                          }`}
                        >
                          {m.name.split(" ")[0]}
                        </span>
                        {isExcluded ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                          >
                            <circle
                              cx="7"
                              cy="7"
                              r="6"
                              stroke="#D4453A"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M5 5L9 9M9 5L5 9"
                              stroke="#D4453A"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                          >
                            <circle
                              cx="7"
                              cy="7"
                              r="6"
                              stroke="#4A8B4A"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M4.5 7L6.2 8.7L9.5 5.3"
                              stroke="#4A8B4A"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
