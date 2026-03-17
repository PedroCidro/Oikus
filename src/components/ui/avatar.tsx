"use client";

import { getAvatarColor } from "@/lib/utils";

export function Avatar({
  name,
  userId,
  size = 40,
}: {
  name: string;
  userId: string;
  size?: number;
}) {
  const color = getAvatarColor(userId);
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.4,
      }}
    >
      <span className="font-semibold text-white leading-none">{initial}</span>
    </div>
  );
}
