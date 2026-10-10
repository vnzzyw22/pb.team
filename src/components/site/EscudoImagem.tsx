import { CLUBE } from "@/lib";

/**
 * Escudo para imagens geradas (ícone da tela inicial e Open Graph). O gerador
 * de imagem não usa fontes da página, então o ano vai como texto à parte.
 */
export function EscudoImagem({ tamanho }: { tamanho: number }) {
  return (
    <div style={{ position: "relative", display: "flex", width: tamanho, height: tamanho }}>
      <svg width={tamanho} height={tamanho} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="49" fill="#000" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.2" />
        <path d="M20.3 20.3 79.7 79.7M79.7 20.3 20.3 79.7" stroke="#fff" strokeWidth="2.6" />
        <circle cx="50" cy="17" r="6.4" fill="#fff" />
        <path d="M50 14.4 52.47 16.2 51.53 19.1 48.47 19.1 47.53 16.2Z" fill="#000" />
        <path
          fill="#fff"
          fillRule="evenodd"
          d="M19 39H27C30.3 39 32.5 41.2 32.5 44.5V46.5C32.5 49.8 30.3 52 27 52H23.5V61H19ZM23.5 43H26.5C27.6 43 28.2 43.6 28.2 44.7V46.3C28.2 47.4 27.6 48 26.5 48H23.5Z"
        />
        <path
          fill="#fff"
          fillRule="evenodd"
          d="M67.5 39H76C79 39 80.7 40.8 80.7 43.6V45.4C80.7 47.3 79.9 48.7 78.5 49.6 80.3 50.4 81.3 52 81.3 54.2V56.2C81.3 59.2 79.4 61 76.3 61H67.5ZM72 42.8H75.3C76.1 42.8 76.5 43.3 76.5 44.1V45.9C76.5 46.8 76 47.4 75.1 47.4H72ZM72 51.2H75.5C76.5 51.2 77 51.8 77 52.8V55.6C77 56.6 76.5 57.2 75.5 57.2H72Z"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: tamanho * 0.79,
          display: "flex",
          justifyContent: "center",
          color: "#fff",
          fontSize: tamanho * 0.1,
          fontWeight: 700,
        }}
      >
        {String(CLUBE.fundacao)}
      </div>
    </div>
  );
}
