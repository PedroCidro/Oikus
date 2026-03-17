"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar } from "@/components/ui/avatar";
import { formatDueDate, getTaskBadgeVariant } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Tarefa, Perfil } from "@/lib/supabase/types";

export function TaskRow({
  task,
  assignee,
  onUpdate,
}: {
  task: Tarefa;
  assignee?: Perfil | null;
  onUpdate: () => void;
}) {
  const variant = getTaskBadgeVariant(task.status, task.due_date);

  async function toggleComplete() {
    if (task.status !== "pending") return;
    const supabase = createClient();
    await supabase
      .from("tarefas")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", task.id);
    onUpdate();
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <Checkbox
        checked={task.status === "completed"}
        missed={task.status === "missed"}
        onChange={toggleComplete}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-[15px] font-medium truncate ${
            task.status === "completed" ? "line-through text-text-secondary" : ""
          }`}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {assignee && (
            <div className="flex items-center gap-1">
              <Avatar name={assignee.name} userId={assignee.id} size={16} />
              <span className="text-text-secondary text-[12px]">
                {assignee.name.split(" ")[0]}
              </span>
            </div>
          )}
          {task.due_date && (
            <span className="text-text-secondary text-[12px]">
              {formatDueDate(task.due_date)}
            </span>
          )}
        </div>
      </div>
      <Badge variant={variant} />
    </div>
  );
}
