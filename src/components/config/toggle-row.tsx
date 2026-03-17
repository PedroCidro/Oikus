"use client";

import { Toggle } from "@/components/ui/toggle";

export function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <span className="text-[15px] font-medium">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}
