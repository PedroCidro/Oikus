"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-heading text-[28px] font-bold mb-1">Criar conta</h1>
      <p className="text-text-secondary text-[15px] mb-8">
        Comece a organizar sua república
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
            Nome
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-surface-dim bg-surface px-4 py-3 text-[15px] outline-none focus:border-accent transition-colors"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-surface-dim bg-surface px-4 py-3 text-[15px] outline-none focus:border-accent transition-colors"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
            Senha
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-surface-dim bg-surface px-4 py-3 text-[15px] outline-none focus:border-accent transition-colors"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {error && (
          <p className="text-danger text-[13px]">{error}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Criando..." : "Criar conta"}
        </Button>
      </form>

      <p className="text-center text-[13px] text-text-secondary mt-6">
        Já tem conta?{" "}
        <Link href="/login" className="text-accent font-semibold">
          Entrar
        </Link>
      </p>
    </div>
  );
}
