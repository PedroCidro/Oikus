import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./server";
import type { Perfil } from "./types";

/**
 * Cached supabase client for the current request.
 */
export const getSupabase = cache(async () => {
  return createClient();
});

/**
 * Cached user + perfil for the current request.
 * Uses getSession() (local cookie read) instead of getUser() (network call)
 * because middleware already validated the token with getUser().
 * Redirects to /onboarding if the user has no house.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("*")
    .eq("id", session.user.id)
    .single<Perfil>();

  if (!perfil?.house_id) redirect("/onboarding");

  return { user: session.user, perfil: perfil! };
});
