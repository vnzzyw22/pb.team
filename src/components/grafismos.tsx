/**
 * Marcações da prancheta: o X do escudo, a linha do meio da quadra e a seta
 * de jogada. Todas decorativas (aria-hidden) e na cor do texto ao redor.
 */

export function MarcaX({ className = "h-3 w-3", espessura = 1.6 }: { className?: string; espessura?: number }) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth={espessura}>
      <path d="M1.5 1.5 10.5 10.5M10.5 1.5 1.5 10.5" />
    </svg>
  );
}

/** Linha do meio com o círculo central: o divisor da quadra. */
export function LinhaDoMeio({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center text-linha-forte ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-current" />
      <svg viewBox="0 0 44 44" className="h-11 w-11 shrink-0" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M0 22H44" />
        <circle cx="22" cy="22" r="17" />
        <circle cx="22" cy="22" r="2" fill="currentColor" stroke="none" />
      </svg>
      <span className="h-px flex-1 bg-current" />
    </div>
  );
}

interface SetaJogadaProps {
  className?: string;
  animar?: boolean;
  /** Atraso da animação, ex.: "0.6s". */
  atraso?: string;
}

/**
 * Seta de jogada desenhada à mão: a linha cheia que desce da direita e
 * aponta para a ação embaixo, à esquerda. Proporção 10:3.
 */
export function SetaJogada({ className = "", animar = false, atraso = "0s" }: SetaJogadaProps) {
  return (
    <svg
      viewBox="0 0 320 96"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M296 6C300 44 262 62 196 66S64 70 34 88"
        pathLength={1}
        className={animar ? "desenhar" : undefined}
        style={{ "--atraso": atraso } as React.CSSProperties}
      />
      <path
        d="M-12 -8 0 0 -12 8"
        transform="translate(34 88) rotate(149)"
        pathLength={1}
        className={animar ? "desenhar" : undefined}
        style={{ "--atraso": `calc(${atraso} + 0.7s)` } as React.CSSProperties}
      />
    </svg>
  );
}

/** Ícone de carregamento (gira só sem "reduzir movimento"). */
export function Carregando({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`girando ${className}`} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
    </svg>
  );
}

/** Ícone do WhatsApp desenhado no traço da casa (balão + fone). */
export function IconeWhatsApp({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 3.2a8.8 8.8 0 0 0-7.6 13.3L3.2 20.8l4.4-1.2A8.8 8.8 0 1 0 12 3.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.1 7.9c.2-.4.5-.4.8-.4h.6c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .5-.1.7l-.5.6c-.1.2-.1.4 0 .6.6 1 1.4 1.8 2.4 2.4.2.1.4.1.6 0l.6-.5c.2-.2.5-.2.7-.1l1.7.7c.3.1.4.3.4.5v.6c0 .3-.1.6-.4.8-.6.4-1.4.6-2.2.4-2.6-.6-5.1-3.1-5.7-5.7-.2-.8 0-1.6.4-2.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconeInstagram({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
