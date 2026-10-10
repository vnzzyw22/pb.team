import type { Metadata } from "next";
import Image from "next/image";
import { CLUBE, patrocinadoresPublicos } from "@/lib";
import { FotoClube } from "@/components/FotoClube";
import { MarcaX } from "@/components/grafismos";
import { FormAnuncie } from "@/components/patrocinadores/FormAnuncie";
import { Quadra } from "@/components/Quadra";

export const metadata: Metadata = {
  title: "Patrocinadores",
  description: `Marcas que apoiam o ${CLUBE.nomeCompleto} e como colocar a sua empresa dentro da ${CLUBE.arena.nome}.`,
};

export default function PaginaPatrocinadores() {
  const patrocinadores = patrocinadoresPublicos();

  return (
    <>
      <section className="recipiente pb-14 pt-28 lg:pb-20 lg:pt-40">
        <h1 className="titulo t-1">Patrocinadores</h1>
        <p className="lead medida mt-6 text-giz">Marcas que apoiam as equipes do {CLUBE.nome}, nos uniformes e na Arena.</p>
      </section>

      {patrocinadores.length > 0 && (
        <section aria-label="Marcas parceiras" className="recipiente pb-20 lg:pb-28">
          <ul className="border-t border-linha">
            {patrocinadores.map((p) => {
              const nome = p.logo ? (
                <Image
                  src={p.logo}
                  alt={p.nome}
                  width={240}
                  height={96}
                  unoptimized
                  className="h-14 w-auto object-contain sm:h-16"
                />
              ) : (
                <span className="marca block text-[2.25rem] sm:text-[3.5rem] lg:text-[4.75rem]">{p.nome}</span>
              );
              return (
                <li key={p.nome} className="grid gap-2 border-b border-linha py-7 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-8 lg:py-10">
                  {p.site ? (
                    <a href={p.site} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                      {nome}
                    </a>
                  ) : (
                    nome
                  )}
                  {p.onde && <p className="text-giz sm:pb-2 sm:text-right">{p.onde}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[21/9]">
        <FotoClube id="jogo-conducao-vs-viagens" sizes="100vw" />
      </div>

      <section id="anuncie" aria-labelledby="titulo-anuncie" className="relative scroll-mt-16 overflow-hidden lg:scroll-mt-20">
        <Quadra
          orientacao="horizontal"
          className="pointer-events-none absolute -left-40 top-24 hidden w-[56rem] text-white/[0.06] lg:block"
        />
        <div className="recipiente secao relative lg:grid lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-6">
            <h2 id="titulo-anuncie" className="titulo t-2 max-w-[12ch]">
              {CLUBE.anuncie.titulo}
            </h2>
            <p className="lead medida mt-6 text-giz">{CLUBE.anuncie.chamada}</p>
            <ul className="mt-9 grid gap-3 border-t border-linha pt-6">
              {CLUBE.anuncie.formatos.map((f) => (
                <li key={f} className="flex items-baseline gap-3.5">
                  <MarcaX className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-lg font-semibold">{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-12 lg:col-span-5 lg:col-start-8 lg:mt-2">
            <div className="quadro-cheio p-5 sm:p-8">
              <h3 className="titulo t-4">Fale sobre a sua marca</h3>
              <div className="mt-6">
                <FormAnuncie />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
