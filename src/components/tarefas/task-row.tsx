"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar } from "@/components/ui/avatar";
import { formatDueDate, getTaskBadgeVariant } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Tarefa, Perfil } from "@/lib/supabase/types";

function getTimeProgress(task: Tarefa): number | null {
  if (!task.due_date) return null;
  const created = new Date(task.created_at).getTime();
  const due = new Date(task.due_date + "T23:59:59").getTime();
  const now = Date.now();
  const total = due - created;
  if (total <= 0) return 1;
  return (now - created) / total;
}

export function TaskRow({
  task,
  assignee,
  isAdmin,
  requireApproval,
  onUpdate,
}: {
  task: Tarefa;
  assignee?: Perfil | null;
  isAdmin: boolean;
  requireApproval: boolean;
  onUpdate: () => void;
}) {
  const variant = getTaskBadgeVariant(task.status, task.due_date);

  async function toggleComplete() {
    if (task.status === "completed" || task.status === "missed") return;

    const supabase = createClient();

    if (task.status === "pending_approval" && isAdmin) {
      await supabase
        .from("tarefas")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", task.id);
    } else if (task.status === "pending") {
      if (!isAdmin && requireApproval) {
        await supabase
          .from("tarefas")
          .update({ status: "pending_approval" })
          .eq("id", task.id);
      } else {
        await supabase
          .from("tarefas")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", task.id);
      }
    }

    onUpdate();
  }

  async function handleReject() {
    const supabase = createClient();
    await supabase
      .from("tarefas")
      .update({ status: "pending" })
      .eq("id", task.id);
    onUpdate();
  }

  const timeProgress = getTimeProgress(task);

  return (
    <div className="py-3">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={task.status === "completed"}
          missed={task.status === "missed"}
          pending={task.status === "pending_approval"}
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
        {task.status === "pending_approval" && isAdmin ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReject}
              className="text-[12px] font-semibold text-danger bg-danger-light px-2.5 py-1 rounded-full hover:bg-danger/20 transition-colors"
            >
              Rejeitar
            </button>
            <button
              onClick={toggleComplete}
              className="text-[12px] font-semibold text-success bg-success-light px-2.5 py-1 rounded-full hover:bg-success/20 transition-colors"
            >
              Aprovar
            </button>
          </div>
        ) : (
          <Badge variant={variant} />
        )}
      </div>
      {timeProgress !== null && task.status !== "completed" && task.status !== "missed" && (
        <div className="ml-8 mt-2">
          <div className="h-1.5 rounded-full bg-surface-dim overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                timeProgress >= 1
                  ? "bg-danger"
                  : timeProgress >= 0.75
                    ? "bg-warning"
                    : "bg-accent"
              }`}
              style={{ width: `${Math.min(timeProgress * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
