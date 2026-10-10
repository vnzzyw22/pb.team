import type { Metadata } from "next";
import { CLUBE, fotoPorId } from "@/lib";
import { Escudo } from "@/components/Escudo";
import { FotoClube } from "@/components/FotoClube";
import { IconeInstagram, MarcaX } from "@/components/grafismos";
import { Quadra } from "@/components/Quadra";
import { ChamadaFinal } from "@/components/site/ChamadaFinal";
import { urlInstagram } from "@/components/site/navegacao";

export const metadata: Metadata = {
  title: "O projeto",
  description:
    `A história do ${CLUBE.nomeCompleto}, a filosofia de base e o técnico ${CLUBE.tecnico.nome}: ` +
    `${CLUBE.tecnico.formacao.join(", ").toLowerCase()}.`,
};

export default function PaginaOProjeto() {
  const { tecnico, citacao } = CLUBE;
  const [fotoPrincipal, fotoSecundaria] = tecnico.fotos;
  const familias = fotoPorId("equipe-e-familias");

  return (
    <>
      {/* História */}
      <section className="recipiente pb-16 pt-28 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:pb-24 lg:pt-40">
        <h1 className="titulo t-1 lg:col-span-5">O projeto</h1>
        <div className="mt-8 lg:col-span-7 lg:mt-3">
          <p className="lead medida">{CLUBE.historia}</p>
        </div>
      </section>

      {/* Missão */}
      <section aria-labelledby="titulo-missao" className="border-t border-linha">
        <div className="recipiente py-16 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:py-24">
          <h2 id="titulo-missao" className="titulo t-2 lg:col-span-5">
            Missão
          </h2>
          <p className="mt-6 max-w-[40ch] text-[1.375rem] font-semibold leading-snug sm:text-[1.75rem] lg:col-span-7 lg:mt-1">
            {CLUBE.missao}
          </p>
        </div>
      </section>

      {/* Citação */}
      <section aria-label={`Palavra de ${citacao.autor}`} className="relative overflow-hidden border-y border-linha">
        <Quadra
          orientacao="horizontal"
          className="pointer-events-none absolute left-1/2 top-1/2 hidden w-[110rem] -translate-x-1/2 -translate-y-1/2 text-white/[0.07] md:block"
        />
        <Quadra className="pointer-events-none absolute left-1/2 top-1/2 h-[64rem] -translate-x-1/2 -translate-y-1/2 text-white/[0.07] md:hidden" />
        <figure className="recipiente relative py-20 lg:py-32">
          <span aria-hidden className="titulo block text-[7rem] leading-[0.6] text-white/25 lg:text-[10rem]">
            “
          </span>
          <blockquote className="mt-2 max-w-[44ch] text-[1.5rem] font-medium leading-[1.3] sm:text-[1.875rem] lg:text-[2.375rem]">
            <p>{citacao.texto}</p>
          </blockquote>
          <figcaption className="mt-10 flex items-center gap-4">
            <Escudo decorativo contorno className="h-12 w-12 shrink-0" />
            <span>
              <span className="block font-semibold">{citacao.autor}</span>
              <span className="block text-sm text-giz">{tecnico.papel}</span>
            </span>
          </figcaption>
        </figure>
      </section>

      {/* Técnico */}
      <section aria-labelledby="titulo-tecnico" className="recipiente secao">
        <div className="quadro grid lg:grid-cols-12">
          <div className="grid grid-cols-2 gap-px bg-linha lg:col-span-5 lg:grid-cols-1">
            <div className="relative aspect-[3/4] overflow-hidden bg-preto lg:aspect-[4/5]">
              <FotoClube id={fotoPrincipal} sizes="(min-width: 1024px) 34vw, 50vw" />
            </div>
            {fotoSecundaria && (
              <div className="relative aspect-[3/4] overflow-hidden bg-preto lg:aspect-[4/3]">
                <FotoClube id={fotoSecundaria} sizes="(min-width: 1024px) 34vw, 50vw" />
              </div>
            )}
          </div>

          <div className="p-5 sm:p-8 lg:col-span-7 lg:self-center lg:p-12">
            <h2 id="titulo-tecnico" className="titulo t-2">
              {tecnico.nome}
            </h2>
            <p className="mt-3 text-lg text-giz">{tecnico.papel}</p>
            <p className="medida mt-6">{tecnico.sobre}</p>

            <h3 className="rotulo mt-10 text-giz">Formação</h3>
            <ul className="mt-4 border-t border-linha">
              {tecnico.formacao.map((item) => (
                <li key={item} className="flex items-baseline gap-4 border-b border-linha py-4">
                  <MarcaX className="h-4 w-4 shrink-0 translate-y-[-0.1em]" />
                  <span className="titulo t-3">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href={urlInstagram(tecnico.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="link-jogada mt-8 inline-flex min-h-11 items-center gap-2.5"
            >
              <IconeInstagram />@{tecnico.instagram}
            </a>
          </div>
        </div>
      </section>

      {/* Equipe e famílias */}
      {familias && (
        <figure className="border-t border-linha">
          <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[1440/754]">
            <FotoClube id={familias.id} sizes="100vw" />
          </div>
          {familias.legenda && (
            <figcaption className="recipiente pt-5 text-giz">{familias.legenda}</figcaption>
          )}
        </figure>
      )}

      <div className="pt-20 lg:pt-28">
        <ChamadaFinal titulo="Venha fazer parte" />
      </div>
    </>
  );
}
