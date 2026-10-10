import Link from "next/link";
import { BotaoWhatsApp } from "@/components/site/BotaoWhatsApp";
import { Cabecalho } from "@/components/site/Cabecalho";
import { Rodape } from "@/components/site/Rodape";
import { ANCORA_AULA } from "@/components/site/navegacao";
import { Quadra } from "@/components/Quadra";

export default function NaoEncontrada() {
  return (
    <>
      <Cabecalho />
      <main id="conteudo" className="relative overflow-hidden pt-16 lg:pt-20">
        <Quadra
          orientacao="horizontal"
          className="pointer-events-none absolute left-1/2 top-1/2 hidden w-[72rem] -translate-x-1/2 -translate-y-1/2 text-white/[0.07] md:block"
        />
        <Quadra className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-[34rem] text-white/[0.07] md:hidden" />
        <div className="recipiente relative flex min-h-[70svh] flex-col justify-center py-20">
          <h1 className="titulo t-1">Bola fora</h1>
          <p className="lead mt-6 max-w-[34ch] text-giz">Essa página não existe ou mudou de lugar.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="btn btn-claro">
              Voltar para o início
            </Link>
            <Link href={ANCORA_AULA} className="btn btn-neon">
              Agende uma aula experimental
            </Link>
          </div>
        </div>
      </main>
      <Rodape />
      <BotaoWhatsApp />
    </>
  );
}
