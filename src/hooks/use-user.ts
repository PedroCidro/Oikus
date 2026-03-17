"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Perfil } from "@/lib/supabase/types";

export function useUser() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchPerfil() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("perfis")
        .select("*")
        .eq("id", user.id)
        .single<Perfil>();

      setPerfil(data);
      setLoading(false);
    }

    fetchPerfil();
  }, []);

  return { perfil, loading };
}
