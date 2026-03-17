"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDueDate, getTaskBadgeVariant } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Tarefa } from "@/lib/supabase/types";

export function TaskPreview({ task }: { task: Tarefa }) {
  const router = useRouter();
  const variant = getTaskBadgeVariant(task.status, task.due_date);

  async function toggleComplete() {
    if (task.status !== "pending") return;
    const supabase = createClient();
    await supabase
      .from("tarefas")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", task.id);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 py-2.5">
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
        {task.due_date && (
          <p className="text-text-secondary text-[12px] mt-0.5">
            {formatDueDate(task.due_date)}
          </p>
        )}
      </div>
      <Badge variant={variant} />
    </div>
  );
}
