import Link from "next/link";
import { CLUBE, formatarTelefone } from "@/lib";
import { whatsappDoClube } from "@/components/site/navegacao";

/** Data da última revisão das páginas legais. */
export const ATUALIZACAO_LEGAL = "10 de outubro de 2026";

export interface SecaoLegal {
  id: string;
  titulo: string;
  conteudo: React.ReactNode;
}

interface PaginaLegalProps {
  titulo: string;
  introducao: React.ReactNode;
  resumo: React.ReactNode[];
  secoes: SecaoLegal[];
}

const OUTRAS = [
  { href: "/termos", rotulo: "Termos de uso" },
  { href: "/privacidade", rotulo: "Política de privacidade" },
  { href: "/cookies", rotulo: "Política de cookies" },
];

/** Página de leitura longa: resumo, índice e cláusulas numeradas para citar. */
export function PaginaLegal({ titulo, introducao, resumo, secoes }: PaginaLegalProps) {
  return (
    <article className="recipiente pb-24 pt-28 lg:pb-32 lg:pt-40">
      <header className="max-w-3xl">
        <h1 className="titulo t-1">{titulo}</h1>
        <p className="mt-5 text-sm text-giz">Atualizada em {ATUALIZACAO_LEGAL}</p>
        <div className="texto-legal mt-6">{introducao}</div>
      </header>

      <section aria-labelledby="titulo-resumo" className="quadro-cheio mt-10 max-w-3xl p-5 sm:p-7">
        <h2 id="titulo-resumo" className="titulo t-4">
          Em resumo
        </h2>
        <ul className="texto-legal mt-2">
          {resumo.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <div className="mt-14 lg:grid lg:grid-cols-12 lg:gap-x-12">
        <nav aria-label="Nesta página" className="lg:col-span-4 xl:col-span-3">
          <details className="group border-y border-linha lg:hidden">
            <summary className="flex min-h-12 cursor-pointer items-center justify-between font-semibold">
              Nesta página
              <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3.5 6 8 10.5 12.5 6" />
              </svg>
            </summary>
            <Indice secoes={secoes} />
          </details>
          <div className="sticky top-28 hidden lg:block">
            <p className="rotulo text-giz">Nesta página</p>
            <Indice secoes={secoes} />
          </div>
        </nav>

        <div className="mt-10 max-w-[68ch] lg:col-span-8 lg:mt-0 xl:col-span-7">
          {secoes.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-titulo`} className="scroll-mt-24 border-t border-linha pb-10 pt-8 first:border-t-0 first:pt-0">
              <h2 id={`${s.id}-titulo`} className="flex items-baseline gap-3 text-[1.375rem] font-bold leading-tight">
                <span className="dado text-base text-giz">{i + 1}.</span>
                {s.titulo}
              </h2>
              <div className="texto-legal mt-4">{s.conteudo}</div>
            </section>
          ))}

          <footer className="border-t border-linha pt-8 text-giz">
            <p>
              Dúvidas sobre este documento? Fale com o {CLUBE.nomeCompleto} pelo{" "}
              <a href={whatsappDoClube()} target="_blank" rel="noopener noreferrer" className="link-jogada">
                WhatsApp {formatarTelefone(CLUBE.contato.whatsapp)}
              </a>
              .
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {OUTRAS.map((o) => (
                <li key={o.href}>
                  <Link href={o.href} className="inline-flex min-h-11 items-center hover:text-branco">
                    {o.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </footer>
        </div>
      </div>
    </article>
  );
}

function Indice({ secoes }: { secoes: SecaoLegal[] }) {
  return (
    <ol className="mt-3 grid gap-1 pb-4 text-[0.9375rem] lg:pb-0">
      {secoes.map((s, i) => (
        <li key={s.id}>
          <a href={`#${s.id}`} className="flex min-h-10 items-baseline gap-2 text-giz hover:text-branco">
            <span className="dado w-6 shrink-0 text-sm">{i + 1}.</span>
            {s.titulo}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Link interno para outra página legal, para usar dentro do texto. */
export function LinkLegal({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="link-jogada font-normal">
      {children}
    </Link>
  );
}
