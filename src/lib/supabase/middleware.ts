import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Perfil } from "@/lib/supabase/types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Use getSession() instead of getUser() — reads cookie locally (~0ms)
  // instead of calling Supabase Auth API (~250ms). Still refreshes expired
  // tokens. JWT signing protects against tampering.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // Not logged in → redirect to login (unless already on auth page)
  if (!session && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logged in on auth page → check house to decide redirect
  if (session && isAuthPage) {
    const { data: perfil } = await supabase
      .from("perfis")
      .select("house_id")
      .eq("id", session.user.id)
      .single<Pick<Perfil, "house_id">>();

    const url = request.nextUrl.clone();
    url.pathname = perfil?.house_id ? "/" : "/onboarding";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
