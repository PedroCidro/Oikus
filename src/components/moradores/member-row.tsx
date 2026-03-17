"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Perfil } from "@/lib/supabase/types";

export function MemberRow({
  perfil,
  marcaCount,
  isAdmin,
  isSelf,
  onToggleRole,
  onAddMarca,
}: {
  perfil: Perfil;
  marcaCount: number;
  isAdmin?: boolean;
  isSelf?: boolean;
  onToggleRole?: () => void;
  onAddMarca?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Avatar name={perfil.name} userId={perfil.id} size={44} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[15px] font-semibold truncate">{perfil.name}</p>
          <Badge variant={perfil.role} />
        </div>
        <p className="text-text-secondary text-[13px]">
          {marcaCount} {marcaCount === 1 ? "marca" : "marcas"} este mês
        </p>
      </div>
      {isAdmin && !isSelf && (
        <div className="flex items-center gap-2">
          <button
            onClick={onAddMarca}
            className="text-[12px] font-semibold text-danger bg-danger-light px-2.5 py-1 rounded-full hover:bg-danger/20 transition-colors"
          >
            +Marca
          </button>
          <button
            onClick={onToggleRole}
            className="text-[12px] font-semibold text-accent bg-accent-light px-2.5 py-1 rounded-full hover:bg-accent/20 transition-colors"
          >
            {perfil.role === "membro" ? "Promover" : "Rebaixar"}
          </button>
        </div>
      )}
    </div>
  );
}
