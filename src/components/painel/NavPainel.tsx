"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  { href: "/painel", rotulo: "Hoje" },
  { href: "/painel/semana", rotulo: "Semana" },
  { href: "/painel/lancar", rotulo: "Lançar reserva" },
  { href: "/painel/bloqueios", rotulo: "Bloqueios" },
  { href: "/painel/mensalistas", rotulo: "Mensalistas" },
  { href: "/painel/contatos", rotulo: "Contatos" },
  { href: "/painel/resumo", rotulo: "Resumo" },
];

export function NavPainel() {
  const pathname = usePathname();
  return (
    <nav aria-label="Painel" className="border-b border-linha">
      <ul className="recipiente flex gap-1 overflow-x-auto">
        {ABAS.map((a) => {
          const ativa = a.href === "/painel" ? pathname === "/painel" : pathname.startsWith(a.href);
          return (
            <li key={a.href} className="shrink-0">
              <Link
                href={a.href}
                aria-current={ativa ? "page" : undefined}
                className={`inline-flex min-h-12 items-center border-b-2 px-3 text-[0.9375rem] font-semibold ${
                  ativa ? "border-branco text-branco" : "border-transparent text-giz hover:text-branco"
                }`}
              >
                {a.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
