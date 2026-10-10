"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CLUBE } from "@/lib";
import { Escudo } from "@/components/Escudo";
import { Quadra } from "@/components/Quadra";
import { IconeInstagram, IconeWhatsApp } from "@/components/grafismos";
import { ANCORA_AULA, ANCORA_RESERVA, ITENS_MENU, urlInstagram, whatsappDoClube } from "./navegacao";

export function Cabecalho() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const [rolou, setRolou] = useState(false);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const naHome = pathname === "/";

  // Fecha o menu ao trocar de página.
  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 24);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  // Menu aberto: trava a rolagem, leva o foco para dentro e prende o Tab.
  useEffect(() => {
    if (!aberto) return;
    const html = document.documentElement;
    const antes = html.style.overflow;
    html.style.overflow = "hidden";
    painelRef.current?.querySelector<HTMLElement>("a")?.focus();

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(false);
        botaoRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !painelRef.current) return;
      const focaveis = [botaoRef.current, ...painelRef.current.querySelectorAll<HTMLElement>("a, button")].filter(
        (el): el is HTMLElement => Boolean(el),
      );
      const i = focaveis.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        focaveis[focaveis.length - 1].focus();
      } else if (!e.shiftKey && i === focaveis.length - 1) {
        e.preventDefault();
        focaveis[0].focus();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => {
      html.style.overflow = antes;
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  const solido = !naHome || rolou || aberto;
  const ativo = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        solido ? "border-linha bg-preto" : "border-transparent bg-gradient-to-b from-black/75 via-black/30 to-transparent"
      }`}
    >
      <div className="recipiente flex h-16 items-center justify-between gap-6 lg:h-20">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Escudo decorativo contorno className="h-10 w-10 lg:h-12 lg:w-12" />
          <span className="titulo titulo-leve text-[1.5rem] lg:text-[1.75rem]">
            {CLUBE.nome}
            <span className="sr-only"> (página inicial)</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {ITENS_MENU.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={ativo(item.href) ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center px-3 text-[0.9375rem] font-semibold transition-colors ${
                    ativo(item.href)
                      ? "text-branco underline decoration-2 underline-offset-[0.6em]"
                      : "text-giz hover:text-branco"
                  }`}
                >
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href={ANCORA_AULA} className="btn btn-neon btn-pequeno hidden lg:inline-flex">
            Agendar aula
          </Link>
          <button
            ref={botaoRef}
            type="button"
            className="inline-flex min-h-11 items-center gap-2.5 px-2 text-[0.9375rem] font-semibold lg:hidden"
            aria-expanded={aberto}
            aria-controls="menu-celular"
            onClick={() => setAberto((a) => !a)}
          >
            {aberto ? "Fechar" : "Menu"}
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
              <path d={aberto ? "M5.5 5.5 18.5 18.5M18.5 5.5 5.5 18.5" : "M4 9h16M4 15h16"} />
            </svg>
          </button>
        </div>
      </div>

      <div
        id="menu-celular"
        ref={painelRef}
        hidden={!aberto}
        className="abrir-menu fixed inset-x-0 bottom-0 top-16 overflow-y-auto overscroll-contain bg-preto lg:hidden"
      >
        <Quadra className="pointer-events-none absolute inset-y-6 right-[-30%] h-[calc(100%-3rem)] text-white/[0.07]" />
        <div className="recipiente relative flex min-h-full flex-col pb-10 pt-6">
          <nav aria-label="Principal no celular">
            <ul className="border-t border-linha">
              {ITENS_MENU.map((item) => (
                <li key={item.href} className="border-b border-linha">
                  <Link
                    href={item.href}
                    aria-current={ativo(item.href) ? "page" : undefined}
                    className={`titulo flex min-h-16 items-center justify-between text-[2.75rem] ${
                      ativo(item.href) ? "text-branco" : "text-branco/85"
                    }`}
                  >
                    {item.rotulo}
                    {ativo(item.href) && <span className="sr-only"> (página atual)</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 grid gap-3">
            <Link href={ANCORA_AULA} className="btn btn-neon">
              Agende uma aula experimental
            </Link>
            <Link href={ANCORA_RESERVA} className="btn btn-contorno">
              Reserve a Arena
            </Link>
          </div>

          <div className="mt-auto flex flex-wrap gap-x-6 gap-y-3 pt-10 text-[0.9375rem] text-giz">
            <a href={whatsappDoClube()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 hover:text-branco">
              <IconeWhatsApp className="h-5 w-5" />
              WhatsApp
            </a>
            <a
              href={urlInstagram(CLUBE.contato.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 hover:text-branco"
            >
              <IconeInstagram />@{CLUBE.contato.instagram}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
