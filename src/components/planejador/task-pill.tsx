"use client";

import { getMemberColor } from "@/lib/utils";

export function TaskPill({
  title,
  assigneeName,
  assigneeId,
}: {
  title: string;
  assigneeName: string;
  assigneeId: string;
}) {
  const color = getMemberColor(assigneeId);

  return (
    <div
      style={{ backgroundColor: color }}
      className="rounded-md px-1.5 py-1.5"
    >
      <p className="text-[10px] font-semibold text-white leading-tight truncate">
        {title}
      </p>
      <p className="text-[9px] text-white/70 leading-tight mt-0.5 truncate">
        {assigneeName}
      </p>
    </div>
  );
}
