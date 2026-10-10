"use client";

import { useEffect, useState } from "react";

const EVENTO = "painel:aviso";

/** Mostra um aviso no painel mesmo que o componente que o pediu saia da tela. */
export function avisarNoPainel(texto: string) {
  window.dispatchEvent(new CustomEvent<string>(EVENTO, { detail: texto }));
}

export function AvisosPainel() {
  const [texto, setTexto] = useState<string | null>(null);

  useEffect(() => {
    let tempo: number | undefined;
    const aoAvisar = (e: Event) => {
      setTexto((e as CustomEvent<string>).detail);
      window.clearTimeout(tempo);
      tempo = window.setTimeout(() => setTexto(null), 7000);
    };
    window.addEventListener(EVENTO, aoAvisar);
    return () => {
      window.removeEventListener(EVENTO, aoAvisar);
      window.clearTimeout(tempo);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6">
      {texto && (
        <p className="aviso aviso-ok pointer-events-auto flex max-w-md items-start gap-4 shadow-[0_8px_24px_rgb(0_0_0/0.6)]">
          <span>{texto}</span>
          <button type="button" className="shrink-0 text-sm text-giz underline hover:text-branco" onClick={() => setTexto(null)}>
            Fechar
          </button>
        </p>
      )}
    </div>
  );
}
