import Link from "next/link";
import { CATEGORIAS, CLUBE, patrocinadoresPublicos, RECURSOS } from "@/lib";
import { FaixaConquistas } from "@/components/conquistas/FaixaConquistas";
import { faixaDeAnos, faixaDeCategorias } from "@/components/escolinha/formatos";
import { FotoClube } from "@/components/FotoClube";
import { MarcaX } from "@/components/grafismos";
import { HeroHome } from "@/components/home/HeroHome";
import { Quadra } from "@/components/Quadra";
import { ChamadaFinal } from "@/components/site/ChamadaFinal";
import { ANCORA_AULA, ANCORA_RESERVA } from "@/components/site/navegacao";

// As faixas de ano das categorias mudam com a temporada.
export const revalidate = 86400;

export default function Home() {
  const { primeira, ultima } = faixaDeCategorias();
  const patrocinadores = patrocinadoresPublicos();

  return (
    <>
      <HeroHome />

      {/* Placar de conquistas */}
      <section aria-labelledby="titulo-conquistas" className="border-b border-linha">
        <div className="recipiente py-16 lg:py-24">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 lg:mb-12">
            <h2 id="titulo-conquistas" className="titulo t-2">
              Conquistas
            </h2>
            <Link href="/conquistas" className="link-jogada inline-flex min-h-11 items-center">
              Ver a linha do tempo
            </Link>
          </div>
          <FaixaConquistas />
        </div>
      </section>

      {/* Escolinha */}
      <section aria-labelledby="titulo-escolinha" className="lg:py-30">
        <div className="lg:mx-auto lg:grid lg:max-w-[78rem] lg:grid-cols-12 lg:gap-x-12 lg:px-10">
          <div className="relative aspect-[4/5] overflow-hidden lg:col-span-5 lg:aspect-auto">
            <FotoClube id="atleta-uniforme-branco" sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>

          <div className="px-4 pb-20 pt-10 sm:px-6 lg:col-span-7 lg:px-0 lg:py-4">
            <h2 id="titulo-escolinha" className="titulo t-2">
              Do {primeira} ao <span className="whitespace-nowrap">{ultima}</span>
            </h2>
            {CLUBE.matriculas.abertas && <p className="lead medida mt-5 text-giz">{CLUBE.matriculas.chamada}</p>}

            <form action="/escolinha" method="get" className="mt-9 max-w-md">
              <label htmlFor="ano-home" className="rotulo block">
                Em que ano seu filho nasceu?
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="ano-home"
                  name="ano"
                  inputMode="numeric"
                  autoComplete="off"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  required
                  placeholder="Ex.: 2016"
                  aria-describedby="ajuda-ano-home"
                  className="entrada dado max-w-[9rem] text-lg"
                />
                <button type="submit" className="btn btn-claro">
                  Ver a turma
                </button>
              </div>
              <p id="ajuda-ano-home" className="ajuda">
                Mostramos a categoria e os horários de treino.
              </p>
            </form>

            <ul className="mt-10 border-t border-linha sm:columns-2 sm:gap-x-10">
              {CATEGORIAS.map((c) => (
                <li key={c.id} className="flex break-inside-avoid items-baseline justify-between gap-4 border-b border-linha py-3">
                  <p className="titulo t-4">{c.nome}</p>
                  <p className="dado text-sm text-giz">{faixaDeAnos(c)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
              <Link href={ANCORA_AULA} className="btn btn-neon">
                Agende uma aula experimental
              </Link>
              <Link href="/escolinha" className="link-jogada inline-flex min-h-11 items-center self-start sm:self-auto">
                Ver horários das turmas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* O projeto e o técnico */}
      <section aria-labelledby="titulo-tecnico" className="border-t border-linha lg:py-30">
        <div className="lg:mx-auto lg:grid lg:max-w-[78rem] lg:grid-cols-12 lg:items-center lg:gap-x-12 lg:px-10">
          <div className="relative aspect-[4/5] overflow-hidden lg:order-2 lg:col-span-5">
            <FotoClube id={CLUBE.tecnico.fotos[0]} sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
          <div className="px-4 pb-20 pt-10 sm:px-6 lg:order-1 lg:col-span-7 lg:px-0 lg:py-0">
            <h2 id="titulo-tecnico" className="titulo t-2">
              {CLUBE.tecnico.nome}
            </h2>
            <p className="lead mt-4 text-giz">{CLUBE.tecnico.papel}</p>
            <ul className="mt-8 grid gap-4 border-t border-linha pt-7">
              {CLUBE.tecnico.formacao.map((item) => (
                <li key={item} className="flex items-baseline gap-3.5">
                  <MarcaX className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-lg font-semibold leading-snug sm:text-xl">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/o-projeto" className="link-jogada mt-9 inline-flex min-h-11 items-center">
              Conheça o projeto
            </Link>
          </div>
        </div>
      </section>

      {/* Arena */}
      <section aria-labelledby="titulo-arena" className="relative overflow-hidden border-t border-linha">
        <Quadra className="pointer-events-none absolute left-1/2 top-10 h-[calc(100%-5rem)] -translate-x-1/2 text-white/[0.12] lg:hidden" />
        <Quadra
          orientacao="horizontal"
          className="pointer-events-none absolute right-[-8%] top-1/2 hidden w-[68%] -translate-y-1/2 text-white/[0.14] lg:block"
        />
        <div className="recipiente secao relative">
          <h2 id="titulo-arena" className="titulo t-1 max-w-[9ch]">
            {CLUBE.arena.nome}
          </h2>
          <p className="lead medida mt-6 max-w-[30ch]">{CLUBE.arena.descricao}.</p>
          <ul className="mt-8 grid max-w-sm gap-3">
            {Object.values(RECURSOS)
              .filter((r) => r.ativo)
              .map((r) => (
                <li key={r.id} className="flex items-baseline gap-3 border-b border-linha pb-3">
                  <MarcaX className="h-3 w-3 shrink-0" />
                  <span className="font-semibold">{r.nome}</span>
                </li>
              ))}
          </ul>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
            <Link href={ANCORA_RESERVA} className="btn btn-neon">
              Reserve a Arena
            </Link>
            <Link href="/arena" className="link-jogada inline-flex min-h-11 items-center self-start sm:self-auto">
              Ver preços e horários livres
            </Link>
          </div>
        </div>
      </section>

      {/* Patrocinadores */}
      {patrocinadores.length > 0 && (
        <section aria-labelledby="titulo-patrocinadores" className="border-t border-linha">
          <div className="recipiente secao">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
              <h2 id="titulo-patrocinadores" className="titulo t-2">
                Patrocinadores
              </h2>
              <Link href="/patrocinadores#anuncie" className="link-jogada inline-flex min-h-11 items-center">
                {CLUBE.anuncie.titulo}
              </Link>
            </div>
            <ul className="mt-10 grid border-t border-linha sm:grid-cols-2 sm:gap-x-12 lg:mt-14">
              {patrocinadores.map((p) => (
                <li key={p.nome} className="border-b border-linha py-5 lg:py-7">
                  <p className="marca text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem]">{p.nome}</p>
                  {p.onde && <p className="mt-1.5 text-sm text-giz">{p.onde}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ChamadaFinal />
    </>
  );
}
