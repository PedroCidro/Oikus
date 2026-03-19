"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

export function LandingClient() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Hero text reveal
      gsap.fromTo("[data-hero-title] span span",
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: "power4.out", delay: 0.1 }
      );

      // Hero subtitle + buttons
      gsap.fromTo("[data-hero-sub]",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.4, ease: "power3.out" }
      );

      gsap.fromTo("[data-hero-buttons] a",
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, delay: 0.5, ease: "power3.out" }
      );

      // Phone mockup
      gsap.fromTo("[data-mockup]",
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1, delay: 0.3, ease: "power3.out" }
      );

      // Feature cards
      gsap.fromTo("[data-feature]",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: "[data-features]", start: "top 90%" } }
      );

      // Section headers
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(el,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 92%" } }
        );
      });

      // Feature mockup: task rows
      gsap.fromTo("[data-mockup-tarefas] [data-task-row]",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: "[data-mockup-tarefas]", start: "top 90%" } }
      );

      // Feature mockup: marca rows
      gsap.fromTo("[data-mockup-marcas] [data-marca-row]",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: "[data-mockup-marcas]", start: "top 90%" } }
      );

      // Feature mockup: tribunal vote buttons
      gsap.fromTo("[data-mockup-tribunal] [data-vote-btn]",
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, stagger: 0.12, ease: "back.out(1.7)",
          scrollTrigger: { trigger: "[data-mockup-tribunal]", start: "top 90%" } }
      );

      // How it works — numbers
      gsap.fromTo("[data-step-num]",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.15, ease: "back.out(1.7)",
          scrollTrigger: { trigger: "[data-steps]", start: "top 90%" } }
      );

      // Final CTA
      gsap.fromTo("[data-cta-final]",
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: "[data-cta-final]", start: "top 92%" } }
      );
    },
    { scope: containerRef }
  );

  const heroWords = "A república organizada que você sempre quis".split(" ");

  return (
    <div ref={containerRef} className="bg-background text-text-primary overflow-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-accent/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Image src="/logo.png" alt="Oikus" width={48} height={48} />
          <nav className="hidden md:flex items-center gap-10">
            <a
              className="text-sm font-medium text-text-secondary hover:text-accent transition-colors"
              href="#funcionalidades"
            >
              Funcionalidades
            </a>
            <a
              className="text-sm font-medium text-text-secondary hover:text-accent transition-colors"
              href="#como-funciona"
            >
              Como funciona
            </a>
            <Link
              href="/signup"
              className="bg-accent text-white px-6 py-2.5 rounded-full text-sm font-bold hover:brightness-110 transition-all"
            >
              Comece grátis
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-10 md:pt-16 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-8">
            <h1
              data-hero-title
              className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.08] tracking-[-0.03em]"
            >
              {heroWords.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden">
                  <span className="inline-block">
                    {word}
                    {i < heroWords.length - 1 ? "\u00A0" : ""}
                  </span>
                </span>
              ))}
            </h1>
            <p
              data-hero-sub
              className="text-base md:text-lg text-text-secondary leading-relaxed max-w-lg"
            >
              Organiza as tarefas da rep, registra quem não fez a parte
              e deixa os moradores resolverem por votação.
            </p>
            <div data-hero-buttons className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="bg-accent text-white px-10 py-4 rounded-xl text-lg font-bold hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5 transition-all text-center"
              >
                Comece grátis
              </Link>
              <Link
                href="/login"
                className="border-2 border-accent/20 px-10 py-4 rounded-xl text-lg font-bold hover:bg-accent/5 transition-all text-center"
              >
                Já tenho conta
              </Link>
            </div>
          </div>

          {/* Phone mockup — real app UI */}
          <div className="relative hidden lg:block" data-mockup>
            <div className="w-[300px] mx-auto rounded-[2.5rem] border-[14px] border-white shadow-2xl overflow-hidden relative bg-background">
              <div className="px-4 pt-7 pb-3 flex flex-col gap-3 text-[12px]">
                {/* Header */}
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.05em] text-text-secondary">Rep. Solar</p>
                  <p className="font-heading text-[20px] font-bold leading-tight">Bom dia, Pedro</p>
                </div>
                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-surface rounded-xl p-3">
                    <span className="text-[18px] font-bold text-success font-heading">3</span>
                    <p className="text-[9px] font-medium text-text-secondary">Tarefas ativas</p>
                  </div>
                  <div className="bg-surface rounded-xl p-3">
                    <span className="text-[18px] font-bold text-text-primary font-heading">1</span>
                    <p className="text-[9px] font-medium text-text-secondary">Marcas este mês</p>
                  </div>
                </div>
                {/* Tasks */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-heading font-bold text-[12px]">Suas tarefas</span>
                    <span className="text-[9px] text-accent font-semibold">Ver todas</span>
                  </div>
                  <div className="flex flex-col divide-y divide-surface-dim">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-surface-dim shrink-0" />
                        <div>
                          <p className="text-[11px] font-semibold">Limpar cozinha</p>
                          <p className="text-[8px] text-text-secondary">Vence amanhã</p>
                        </div>
                      </div>
                      <span className="text-[7px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">URGENTE</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-surface-dim shrink-0" />
                        <div>
                          <p className="text-[11px] font-semibold">Comprar papel higiênico</p>
                          <p className="text-[8px] text-text-secondary">Vence em 3 dias</p>
                        </div>
                      </div>
                      <span className="text-[7px] font-bold text-text-secondary bg-surface-dim px-2 py-0.5 rounded-full shrink-0">PENDENTE</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-success flex items-center justify-center shrink-0">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-text-secondary line-through">Lavar banheiro</p>
                          <p className="text-[8px] text-text-secondary">Concluída ontem</p>
                        </div>
                      </div>
                      <span className="text-[7px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full shrink-0">FEITA</span>
                    </div>
                  </div>
                </div>
                {/* Leaderboard */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-heading font-bold text-[12px]">Placar do mês</span>
                    <span className="text-[9px] text-accent font-semibold">Março 2026</span>
                  </div>
                  <div className="flex flex-col divide-y divide-surface-dim">
                    {[
                      { name: "Rafael", marks: "4", color: "#C4653A" },
                      { name: "Pedro", marks: "1", color: "#8B7D6B" },
                      { name: "Lucas", marks: "0", color: "#5B8A72" },
                      { name: "Marina", marks: "0", color: "#B8860B" },
                    ].map((m) => (
                      <div key={m.name} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0" style={{ backgroundColor: m.color }}>
                            {m.name[0]}
                          </div>
                          <span className="text-[11px] font-semibold">{m.name}</span>
                        </div>
                        <span className="text-[11px]"><strong className="text-accent">{m.marks}</strong> <span className="text-text-secondary">{m.marks === "1" ? "marca" : "marcas"}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Bottom nav */}
              <div className="flex justify-around items-center py-2.5 border-t border-surface-dim bg-background">
                {["Home", "Tarefas", "Moradores", "Config"].map((label, i) => (
                  <div key={label} className="flex flex-col items-center gap-0.5">
                    <div className={`w-4 h-4 rounded ${i === 0 ? "bg-accent" : "bg-surface-dim"}`} />
                    <span className={`text-[8px] font-medium ${i === 0 ? "text-accent" : "text-text-secondary"}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-accent/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-success/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 bg-surface" id="funcionalidades">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16" data-reveal>
            <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight">
              O que o Oikus faz
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-features>
            {/* Escala de tarefas */}
            <div
              data-feature
              className="bg-background p-8 rounded-2xl border border-accent/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-surface rounded-xl p-4 mb-6" data-mockup-tarefas>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Limpar cozinha", done: false },
                    { label: "Lavar banheiro", done: true },
                    { label: "Lixo reciclável", done: false },
                  ].map((t, i) => (
                    <div key={i} data-task-row className="flex items-center gap-2.5 py-1.5">
                      <div className={`w-5 h-5 rounded shrink-0 flex items-center justify-center ${t.done ? "bg-success" : "border-2 border-surface-dim"}`}>
                        {t.done && <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span className={`text-[13px] font-medium ${t.done ? "line-through text-text-secondary" : ""}`}>{t.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-surface-dim">
                  <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center text-[7px] font-bold text-white">P</div>
                  <span className="text-[11px] text-text-secondary">Pedro · esta semana</span>
                  <svg className="ml-auto text-accent" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              </div>
              <h3 className="font-heading text-2xl font-bold mb-2">
                Escala de tarefas
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Cria as tarefas da casa e o Oikus reveza entre os moradores
                toda semana. Ninguém precisa lembrar ninguém.
              </p>
            </div>

            {/* Marcas */}
            <div
              data-feature
              className="bg-background p-8 rounded-2xl border border-accent/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-surface rounded-xl p-4 mb-6" data-mockup-marcas>
                <div className="flex flex-col gap-2">
                  {[
                    { name: "Rafael", letter: "R", color: "#C4653A", marks: 4 },
                    { name: "Pedro", letter: "P", color: "#8B7D6B", marks: 1 },
                    { name: "Lucas", letter: "L", color: "#5B8A72", marks: 0 },
                  ].map((m, i) => (
                    <div key={i} data-marca-row className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: m.color }}>{m.letter}</div>
                        <span className="text-[13px] font-medium">{m.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[15px] font-bold text-accent" data-marca-count>{m.marks}</span>
                        <span className="text-[11px] text-text-secondary">marcas</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-surface-dim flex items-center justify-between">
                  <span className="text-[11px] text-text-secondary">Limite: 3 marcas</span>
                  <span className="text-[10px] font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full">⚠ Rafael passou</span>
                </div>
              </div>
              <h3 className="font-heading text-2xl font-bold mb-2">
                Marcas
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Não fez a tarefa? Leva marca. As marcas ficam registradas
                e todo mundo vê o placar do mês.
              </p>
            </div>

            {/* Tribunal */}
            <div
              data-feature
              className="bg-background p-8 rounded-2xl border border-accent/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-dark-bg rounded-xl p-4 mb-6" data-mockup-tribunal>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-[#C4653A] flex items-center justify-center text-[10px] font-bold text-white">R</div>
                  <div>
                    <p className="text-[13px] font-semibold text-background">Rafael</p>
                    <p className="text-[10px] text-text-secondary">4 marcas · Março 2026</p>
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  <div data-vote-btn className="flex-1 bg-success/20 rounded-lg py-2 flex flex-col items-center gap-0.5">
                    <span className="text-[15px]">👍</span>
                    <span className="text-[10px] font-semibold text-success">Inocente</span>
                  </div>
                  <div data-vote-btn className="flex-1 bg-danger/20 rounded-lg py-2 flex flex-col items-center gap-0.5">
                    <span className="text-[15px]">👎</span>
                    <span className="text-[10px] font-semibold text-danger">Culpado</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-secondary">3 de 4 votaram</span>
                  <div className="flex -space-x-1">
                    {["#8B7D6B", "#5B8A72", "#B8860B"].map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-dark-bg" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
              <h3 className="font-heading text-2xl font-bold mb-2">
                Tribunal
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Passou do limite de marcas? Os moradores votam se é culpado
                ou inocente. Perdeu? Paga o churrasco.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32" id="como-funciona">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className="font-heading text-4xl md:text-5xl font-bold text-center mb-20"
            data-reveal
          >
            Como funciona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16" data-steps>
            {[
              {
                num: "1",
                title: "Cadastra a república",
                desc: "Cadastra a casa e manda o código de convite pros moradores.",
              },
              {
                num: "2",
                title: "Monta a escala",
                desc: "Adiciona as tarefas e ativa o revezamento semanal.",
              },
              {
                num: "3",
                title: "Pronto",
                desc: "Todo mundo vê o que tem que fazer. Quem não fizer, leva marca.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="flex flex-col items-center text-center"
              >
                <div
                  data-step-num
                  className="w-20 h-20 rounded-full border-2 border-accent flex items-center justify-center mb-6"
                >
                  <span className="text-3xl font-bold text-accent font-heading">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-heading text-2xl font-bold mb-4">
                  {step.title}
                </h3>
                <p className="text-text-secondary max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-28 bg-surface" data-reveal>
        <div className="max-w-md mx-auto px-6">
          <div className="bg-background rounded-3xl border border-accent/10 p-10 text-center shadow-lg" data-cta-final>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-accent mb-4">Plano único</p>
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="font-heading text-6xl font-bold">R$70</span>
              <span className="text-text-secondary text-lg font-medium">/mês</span>
            </div>
            <p className="text-text-secondary text-sm mb-8">por república, moradores ilimitados</p>
            <ul className="text-left space-y-3 mb-10">
              {[
                "Tarefas com revezamento automático",
                "Sistema de marcas e placar mensal",
                "Tribunal com votação dos moradores",
                "Moradores ilimitados",
                "Planejador semanal",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[15px]">
                  <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#4A8B4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="block bg-accent text-white py-4 rounded-xl text-lg font-bold hover:brightness-110 shadow-lg shadow-accent/20 hover:-translate-y-0.5 transition-all"
            >
              Começar agora
            </Link>
            <p className="text-text-secondary text-xs mt-4">7 dias grátis pra testar</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-accent/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Oikus" width={24} height={24} />
            <span className="font-bold uppercase tracking-wider text-sm font-heading">
              Oikus
            </span>
            <span className="text-text-secondary ml-2">© 2026</span>
          </div>
          <nav className="flex gap-8 text-sm font-medium text-text-secondary">
            <a className="hover:text-accent transition-colors" href="#">
              Termos
            </a>
            <a className="hover:text-accent transition-colors" href="#">
              Privacidade
            </a>
            <a className="hover:text-accent transition-colors" href="#">
              Contato
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
