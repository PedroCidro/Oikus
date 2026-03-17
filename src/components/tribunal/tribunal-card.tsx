import { Avatar } from "@/components/ui/avatar";
import type { Perfil } from "@/lib/supabase/types";

export function TribunalCard({
  rank,
  perfil,
  marcaCount,
  threshold,
}: {
  rank: number;
  perfil: Perfil;
  marcaCount: number;
  threshold: number;
}) {
  const isPunido = marcaCount >= threshold;

  return (
    <div className="bg-[#2A2520] rounded-2xl p-4 flex items-center gap-4">
      <span className="text-[#8B7D6B] text-[18px] font-bold w-6 text-center shrink-0">
        {rank}
      </span>
      <Avatar name={perfil.name} userId={perfil.id} size={52} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-[15px] font-semibold truncate">
          {perfil.name}
        </p>
        <p className="text-[#8B7D6B] text-[13px] mt-0.5">
          {marcaCount} {marcaCount === 1 ? "marca" : "marcas"}
        </p>
      </div>
      <span
        className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
          isPunido
            ? "bg-danger-light text-danger"
            : "bg-success-light text-success"
        }`}
      >
        {isPunido ? "Punido" : "Safe"}
      </span>
    </div>
  );
}
