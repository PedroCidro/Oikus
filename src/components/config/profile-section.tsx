import { Avatar } from "@/components/ui/avatar";
import type { Perfil } from "@/lib/supabase/types";

export function ProfileSection({ perfil }: { perfil: Perfil }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Avatar name={perfil.name} userId={perfil.id} size={56} />
      <div className="flex-1 min-w-0">
        <p className="text-[18px] font-semibold truncate">{perfil.name}</p>
        <p className="text-text-secondary text-[13px] truncate">
          {perfil.email}
        </p>
      </div>
    </div>
  );
}
