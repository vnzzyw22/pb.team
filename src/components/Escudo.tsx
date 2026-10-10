import { CLUBE } from "@/lib";

interface EscudoProps {
  className?: string;
  /** Anel claro em volta do círculo, para o escudo não sumir sobre o fundo preto. */
  contorno?: boolean;
  /** Quando o nome do clube já está escrito ao lado, o escudo é só imagem. */
  decorativo?: boolean;
}

/**
 * Escudo do PB Team: círculo preto, "P" e "B" separados por um X branco,
 * bola no topo e o ano de fundação embaixo. Letras desenhadas em caminho para
 * não depender de fonte carregada.
 */
export function Escudo({ className, contorno = false, decorativo = false }: EscudoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={decorativo ? undefined : "img"}
      aria-hidden={decorativo || undefined}
      aria-label={decorativo ? undefined : `Escudo do ${CLUBE.nomeCompleto}`}
    >
      <circle
        cx="50"
        cy="50"
        r={contorno ? 48.8 : 50}
        fill="#000"
        stroke={contorno ? "rgba(255,255,255,0.32)" : "none"}
        strokeWidth="1.2"
      />

      {/* O X que separa as iniciais */}
      <path d="M20.3 20.3 79.7 79.7M79.7 20.3 20.3 79.7" stroke="#fff" strokeWidth="2.6" />

      {/* Bola */}
      <g transform="translate(50 17)">
        <circle r="6.4" fill="#fff" />
        <path d="M0-2.6 2.47-.8 1.53 2.1-1.53 2.1-2.47-.8Z" fill="#000" />
        <path
          d="M0-2.6V-6.4M2.47-.8 6.09-1.98M1.53 2.1 3.76 5.18M-1.53 2.1-3.76 5.18M-2.47-.8-6.09-1.98"
          stroke="#000"
          strokeWidth="0.75"
        />
      </g>

      {/* P */}
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M19 39H27C30.3 39 32.5 41.2 32.5 44.5V46.5C32.5 49.8 30.3 52 27 52H23.5V61H19ZM23.5 43H26.5C27.6 43 28.2 43.6 28.2 44.7V46.3C28.2 47.4 27.6 48 26.5 48H23.5Z"
      />
      {/* B */}
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M67.5 39H76C79 39 80.7 40.8 80.7 43.6V45.4C80.7 47.3 79.9 48.7 78.5 49.6 80.3 50.4 81.3 52 81.3 54.2V56.2C81.3 59.2 79.4 61 76.3 61H67.5ZM72 42.8H75.3C76.1 42.8 76.5 43.3 76.5 44.1V45.9C76.5 46.8 76 47.4 75.1 47.4H72ZM72 51.2H75.5C76.5 51.2 77 51.8 77 52.8V55.6C77 56.6 76.5 57.2 75.5 57.2H72Z"
      />

      <text
        x="50"
        y="90"
        textAnchor="middle"
        fill="#fff"
        fontSize="10"
        fontWeight="800"
        letterSpacing="0.4"
        style={{ fontFamily: "var(--font-archivo), 'Arial Narrow', sans-serif", fontVariationSettings: "'wdth' 75" }}
      >
        {CLUBE.fundacao}
      </text>
    </svg>
  );
}
