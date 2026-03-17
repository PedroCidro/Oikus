import { Avatar } from "@/components/ui/avatar";
import type { Perfil } from "@/lib/supabase/types";

type LeaderboardEntry = {
  perfil: Perfil;
  marcaCount: number;
};

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="space-y-2">
      {entries.map((entry, i) => (
        <div key={entry.perfil.id} className="flex items-center gap-3 py-2">
          <span className="text-text-secondary text-[13px] font-semibold w-5 text-center">
            {i + 1}
          </span>
          <Avatar name={entry.perfil.name} userId={entry.perfil.id} size={36} />
          <span className="flex-1 text-[15px] font-medium truncate">
            {entry.perfil.name}
          </span>
          <span className="text-text-secondary text-[13px] font-semibold">
            {entry.marcaCount} {entry.marcaCount === 1 ? "marca" : "marcas"}
          </span>
        </div>
      ))}
    </div>
  );
}
