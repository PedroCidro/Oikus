"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Casa } from "@/lib/supabase/types";

export function useHouse(houseId: string | null | undefined) {
  const [house, setHouse] = useState<Casa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!houseId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchHouse() {
      const { data } = await supabase
        .from("casas")
        .select("*")
        .eq("id", houseId!)
        .single<Casa>();

      setHouse(data);
      setLoading(false);
    }

    fetchHouse();
  }, [houseId]);

  return { house, loading };
}
