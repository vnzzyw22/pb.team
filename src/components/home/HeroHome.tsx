import Link from "next/link";
import { CLUBE, VIDEOS } from "@/lib";
import { Quadra } from "@/components/Quadra";
import { SetaJogada } from "@/components/grafismos";
import { VideoFundo } from "@/components/VideoFundo";
import { faixaDeCategorias } from "@/components/escolinha/formatos";
import { ANCORA_AULA, ANCORA_RESERVA } from "@/components/site/navegacao";

/**
 * Primeira tela. No celular, o vídeo vertical ocupa a tela inteira: título no
 * alto (sobre a arquibancada), jogador livre no meio e a jogada desenhada
 * descendo até os botões, sobre a quadra. No desktop, o vídeo fica no formato
 * nativo 9:16 à direita e o título à esquerda, sobre a quadra desenhada.
 */
export function HeroHome() {
  const video = VIDEOS.find((v) => v.id === "hero-jogo");
  const { primeira, ultima } = faixaDeCategorias();
  const linhas = ["Formando", "atletas em", CLUBE.cidade, `desde ${CLUBE.fundacao}`];

  return (
    <section aria-labelledby="titulo-home" className="relative isolate overflow-hidden">
      <Quadra
        orientacao="horizontal"
        className="pointer-events-none absolute left-[5%] top-1/2 hidden w-[92%] -translate-y-1/2 text-white/[0.12] lg:block"
      />

      <div className="recipiente relative flex min-h-[100svh] flex-col pb-6 pt-[5.5rem] lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-10 lg:pb-12 lg:pt-28">
        {/* Vídeo: fundo inteiro no celular, moldura 9:16 no desktop */}
        {/* Sem z-index aqui: assim o botão de pausar (z-20) fica acima do texto (z-10). */}
        <div className="absolute inset-0 lg:relative lg:inset-auto lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:aspect-[9/16] lg:h-[min(calc(100svh-10rem),52rem)] lg:w-auto lg:justify-self-end">
          {video && (
            <VideoFundo
              video={video}
              sizes="(min-width: 1024px) 30rem, 100vw"
              classeBotao="right-4 top-[4.75rem] lg:right-3 lg:top-3"
            />
          )}
          <div
            className="absolute inset-0 lg:hidden"
            style={{
              background:
                "linear-gradient(to bottom, rgb(0 0 0 / 0.55) 0%, rgb(0 0 0 / 0) 22%, rgb(0 0 0 / 0) 58%, rgb(0 0 0 / 0.7) 76%, rgb(0 0 0 / 0.94) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-1 flex-col lg:col-span-7 lg:row-start-1 lg:flex-none">
          {/* No celular, o escurecimento acompanha o bloco do título em qualquer altura de tela */}
          <div className="relative before:pointer-events-none before:absolute before:-inset-x-4 before:-bottom-14 before:-top-28 before:-z-10 before:bg-[linear-gradient(to_bottom,rgb(0_0_0/0.85),rgb(0_0_0/0.6)_62%,rgb(0_0_0/0))] sm:before:-inset-x-6 lg:before:hidden">
            <h1 id="titulo-home" className="titulo t-hero mt-3 [text-shadow:0_2px_18px_rgb(0_0_0/0.45)] lg:mt-0 lg:[text-shadow:none]">
              {linhas.map((linha, i) => (
                <span key={linha} className="surgir block" style={{ "--atraso": `${0.08 + i * 0.07}s` } as React.CSSProperties}>
                  {linha}
                </span>
              ))}
            </h1>
          </div>

          <p className="lead mt-5 hidden max-w-[34ch] text-giz lg:block">
            Escolinha de futsal do <span className="whitespace-nowrap">{primeira}</span> ao <span className="whitespace-nowrap">{ultima}</span>, com o técnico {CLUBE.tecnico.nome}.
          </p>

          {/* A jogada: desce sobre o vídeo até o botão */}
          <div className="mt-auto flex justify-end pt-6 lg:mt-6 lg:justify-start lg:pt-0">
            <SetaJogada animar atraso="0.55s" className="w-[78%] max-w-[22rem] text-branco lg:ml-[18%] lg:w-[17rem]" />
          </div>

          <div className="surgir mt-1 grid gap-3 sm:flex sm:flex-wrap lg:mt-3" style={{ "--atraso": "0.9s" } as React.CSSProperties}>
            <Link href={ANCORA_AULA} className="btn btn-neon">
              Agende uma aula experimental
            </Link>
            <Link href={ANCORA_RESERVA} className="btn btn-contorno">
              Reserve a Arena
            </Link>
          </div>

          {CLUBE.matriculas.abertas && (
            <Link
              href={ANCORA_AULA}
              className="mt-4 inline-flex min-h-9 items-center gap-2.5 self-start border border-white/40 bg-black/50 px-3 text-sm font-semibold lg:mt-6"
            >
              <span className="h-2 w-2 rounded-full bg-neon" aria-hidden />
              Matrículas abertas
            </Link>
          )}

          <p className="mt-3 max-w-[36ch] text-[0.9375rem] text-white/85 lg:hidden">
            Escolinha de futsal do <span className="whitespace-nowrap">{primeira}</span> ao <span className="whitespace-nowrap">{ultima}</span>, com o técnico {CLUBE.tecnico.nome}.
          </p>
        </div>
      </div>
    </section>
  );
}
