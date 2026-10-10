import Link from "next/link";
import { CLUBE, VIDEOS } from "@/lib";
import { Quadra } from "@/components/Quadra";
import { SetaJogada } from "@/components/grafismos";
import { VideoFundo } from "@/components/VideoFundo";
import { faixaDeCategorias } from "@/components/escolinha/formatos";
import { ANCORA_AULA, ANCORA_RESERVA } from "@/components/site/navegacao";

/**
 * Primeira tela.
 * Celular: o vídeo vertical ocupa a tela inteira atrás de um véu escuro (a
 * camada na frente do vídeo); título no alto, jogo visível pelo véu e a
 * jogada desenhada descendo até os botões.
 * Desktop: o vídeo vira uma coluna vertical que sangra até a borda direita e
 * se dissolve no preto pela esquerda, sem moldura; título à esquerda sobre a
 * quadra desenhada.
 */
export function HeroHome() {
  const video = VIDEOS.find((v) => v.id === "hero-jogo");
  const { primeira, ultima } = faixaDeCategorias();
  const linhas = ["Formando atletas", `em ${CLUBE.cidade}`, `desde ${CLUBE.fundacao}`];
  const apoio = (
    <>
      Escolinha de futsal do <span className="whitespace-nowrap">{primeira}</span> ao{" "}
      <span className="whitespace-nowrap">{ultima}</span>, com o técnico {CLUBE.tecnico.nome}.
    </>
  );

  return (
    <section aria-labelledby="titulo-home" className="relative isolate overflow-hidden">
      <Quadra
        orientacao="horizontal"
        className="pointer-events-none absolute left-[8%] top-1/2 hidden w-[84%] -translate-y-1/2 text-white/[0.1] lg:block"
      />

      {/* Sem z-index aqui: assim o botão de pausar (z-20) fica acima do texto (z-10) no celular. */}
      <div className="hero-video absolute inset-0 lg:left-auto lg:w-[min(50vw,46rem)]">
        {video && (
          <VideoFundo
            video={video}
            sizes="(min-width: 1024px) 50vw, 100vw"
            classeBotao="right-4 top-[4.75rem] lg:right-6 lg:top-24"
          />
        )}
        {/* A camada na frente do vídeo: véu uniforme no celular, leve no desktop */}
        <div className="absolute inset-0 bg-black/55 lg:bg-black/10" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 to-transparent lg:h-1/4 lg:from-black" />
      </div>

      <div className="recipiente relative z-10 flex min-h-[92svh] flex-col pb-8 pt-[8.25rem] lg:min-h-[100svh] lg:justify-center lg:pb-16 lg:pt-28">
        <div className="lg:max-w-[50%]">
          <h1 id="titulo-home" className="titulo titulo-leve t-hero">
            {linhas.map((linha, i) => (
              <span key={linha} className="surgir block" style={{ "--atraso": `${0.08 + i * 0.08}s` } as React.CSSProperties}>
                {linha}
              </span>
            ))}
          </h1>
          <p className="lead mt-6 hidden max-w-[34ch] text-giz lg:block">{apoio}</p>
        </div>

        <div className="mt-auto lg:mt-10">
          {/* A jogada: desce sobre o vídeo até o botão */}
          <div className="flex justify-end lg:justify-start">
            <SetaJogada animar atraso="0.5s" className="w-[72%] max-w-[20rem] text-branco lg:ml-[14%] lg:w-[15rem]" />
          </div>

          <div className="surgir mt-1 grid gap-3 sm:flex sm:flex-wrap lg:mt-3" style={{ "--atraso": "0.85s" } as React.CSSProperties}>
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
              className="mt-4 inline-flex min-h-9 items-center gap-2.5 border border-white/40 bg-black/50 px-3 text-sm font-semibold lg:mt-6"
            >
              <span className="h-2 w-2 rounded-full bg-neon" aria-hidden />
              Matrículas abertas
            </Link>
          )}

          <p className="mt-3 max-w-[36ch] text-[0.9375rem] text-white/85 lg:hidden">{apoio}</p>
        </div>
      </div>
    </section>
  );
}
