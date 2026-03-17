import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Perfil } from "@/lib/supabase/types";

export function MemberRow({
  perfil,
  marcaCount,
}: {
  perfil: Perfil;
  marcaCount: number;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Avatar name={perfil.name} userId={perfil.id} size={44} />
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold truncate">{perfil.name}</p>
        <p className="text-text-secondary text-[13px]">
          {marcaCount} {marcaCount === 1 ? "marca" : "marcas"} este mês
        </p>
      </div>
      <Badge variant={perfil.role} />
    </div>
  );
}
