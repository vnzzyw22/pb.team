"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Video } from "@/lib";

interface VideoFundoProps {
  video: Video;
  /** Recorte do vídeo e do pôster dentro da moldura. */
  className?: string;
  /** Posição do botão de pausar dentro do bloco que contém o vídeo. */
  classeBotao?: string;
  sizes: string;
}

/**
 * Vídeo em loop, sem som, como fundo. O pôster fica sempre montado por baixo
 * (é ele que aparece enquanto carrega, se o autoplay falhar ou com
 * "reduzir movimento" ligado; nesse caso o vídeo nem é baixado). O vídeo para
 * fora da tela e tem botão de pausar.
 */
export function VideoFundo({ video, className = "", classeBotao = "", sizes }: VideoFundoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [movimentoLiberado, setMovimentoLiberado] = useState(false);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    const atualizar = () => setMovimentoLiberado(!consulta.matches);
    atualizar();
    consulta.addEventListener("change", atualizar);
    return () => consulta.removeEventListener("change", atualizar);
  }, []);

  const tocando = movimentoLiberado && !pausado;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // React não grava `muted` como atributo; sem ele o navegador bloqueia o autoplay.
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    if (!tocando) {
      v.pause();
      return;
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.15 },
    );
    observador.observe(v);
    return () => observador.disconnect();
  }, [tocando, movimentoLiberado]);

  return (
    <>
      <Image
        src={video.poster}
        alt=""
        fill
        priority
        sizes={sizes}
        className={`object-cover ${className}`}
      />
      {movimentoLiberado && (
        <video
          ref={ref}
          className={`absolute inset-0 h-full w-full object-cover ${className}`}
          src={video.src}
          poster={video.poster}
          width={video.largura}
          height={video.altura}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          tabIndex={-1}
        />
      )}
      {movimentoLiberado && (
        <button
          type="button"
          onClick={() => setPausado((p) => !p)}
          aria-label={pausado ? "Continuar o vídeo de fundo" : "Pausar o vídeo de fundo"}
          className={`botao-midia ${classeBotao}`}
        >
          <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5">
            {pausado ? (
              <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
            ) : (
              <path d="M4 2.5h2.6v11H4zM9.4 2.5H12v11H9.4z" fill="currentColor" />
            )}
          </svg>
        </button>
      )}
    </>
  );
}
