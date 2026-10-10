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
        className="pointer-events-none absolute left-[-6%] top-1/2 hidden w-[92%] -translate-y-1/2 text-white/[0.08] lg:block"
      />

      <div className="recipiente relative flex min-h-[100svh] flex-col pb-6 pt-[5.5rem] lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-10 lg:pb-12 lg:pt-28">
        {/* Vídeo: fundo inteiro no celular, moldura 9:16 no desktop */}
        <div className="absolute inset-0 -z-10 lg:relative lg:inset-auto lg:z-0 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:aspect-[9/16] lg:h-[min(calc(100svh-10rem),52rem)] lg:w-auto lg:justify-self-end">
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
                "linear-gradient(to bottom, rgb(0 0 0 / 0.82) 0%, rgb(0 0 0 / 0.55) 30%, rgb(0 0 0 / 0) 46%, rgb(0 0 0 / 0) 58%, rgb(0 0 0 / 0.7) 76%, rgb(0 0 0 / 0.94) 100%)",
            }}
          />
        </div>

        <div className="relative flex flex-1 flex-col lg:col-span-7 lg:row-start-1 lg:flex-none">
          {CLUBE.matriculas.abertas && (
            <Link
              href={ANCORA_AULA}
              className="surgir inline-flex min-h-9 items-center gap-2.5 self-start border border-white/40 bg-black/50 px-3 text-sm font-semibold"
            >
              <span className="h-2 w-2 rounded-full bg-neon" aria-hidden />
              Matrículas abertas
            </Link>
          )}

          <h1 id="titulo-home" className="titulo t-hero mt-5 lg:mt-7">
            {linhas.map((linha, i) => (
              <span key={linha} className="surgir block" style={{ "--atraso": `${0.08 + i * 0.07}s` } as React.CSSProperties}>
                {linha}
              </span>
            ))}
          </h1>

          <p className="surgir lead mt-5 hidden max-w-[34ch] text-giz lg:block" style={{ "--atraso": "0.4s" } as React.CSSProperties}>
            Escolinha de futsal do {primeira} ao {ultima}, com o técnico {CLUBE.tecnico.nome}.
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

          <p className="surgir mt-4 max-w-[36ch] text-[0.9375rem] text-white/85 lg:hidden" style={{ "--atraso": "0.4s" } as React.CSSProperties}>
            Escolinha de futsal do {primeira} ao {ultima}, com o técnico {CLUBE.tecnico.nome}.
          </p>
        </div>
      </div>
    </section>
  );
}
