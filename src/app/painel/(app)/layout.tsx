import Link from "next/link";
import { infoDoSistema } from "@/server/acoes/painel";
import { protegerPagina } from "@/server/painel/acesso";
import { Escudo } from "@/components/Escudo";
import { AvisosPainel } from "@/components/painel/AvisosPainel";
import { BotaoSair, ResetarDemo } from "@/components/painel/ControlesSessao";
import { NavPainel } from "@/components/painel/NavPainel";

export default async function LayoutPrivado({ children }: Readonly<{ children: React.ReactNode }>) {
  await protegerPagina();
  const info = await infoDoSistema();
  const demo = info.ok && info.dados.demo;

  return (
    <div className="min-h-[100svh]">
      <a href="#conteudo-painel" className="pular">
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-40 bg-preto">
        <div className="border-b border-linha">
          <div className="recipiente flex min-h-16 flex-wrap items-center justify-between gap-3 py-2">
            <Link href="/painel" className="flex items-center gap-3">
              <Escudo decorativo contorno className="h-9 w-9" />
              <span className="titulo text-[1.375rem]">Painel</span>
              {info.ok && (
                <span className="hidden text-sm text-giz sm:inline">
                  {info.dados.modo === "postgres" ? "Banco de dados" : "Dados de exemplo em memória"}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/" className="btn btn-sobrio btn-pequeno hidden sm:inline-flex">
                Ver site
              </Link>
              <BotaoSair />
            </div>
          </div>
        </div>
        <NavPainel />
      </header>
      {demo && (
        <aside aria-label="Modo demonstração" className="border-b border-linha bg-feltro">
          <div className="recipiente flex flex-wrap items-center justify-between gap-3 py-2.5">
            <p className="text-sm text-giz">Modo demonstração: os dados são de exemplo.</p>
            <ResetarDemo />
          </div>
        </aside>
      )}
      <main id="conteudo-painel" tabIndex={-1} className="recipiente pb-24 pt-8 outline-none lg:pt-10">
        {children}
      </main>
      <AvisosPainel />
    </div>
  );
}
