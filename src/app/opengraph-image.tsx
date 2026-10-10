import { ImageResponse } from "next/og";
import { CLUBE } from "@/lib";
import { EscudoImagem } from "@/components/site/EscudoImagem";

export const alt = `${CLUBE.nomeCompleto}: escolinha de futsal em ${CLUBE.cidade} desde ${CLUBE.fundacao}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ImagemOpenGraph() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          gap: 64,
          padding: "0 88px",
          background: "#000",
          color: "#fff",
        }}
      >
        {/* Quadra vista de cima, em traço fino */}
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          style={{ position: "absolute", left: 0, top: 0 }}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.1"
          strokeWidth="2"
        >
          <rect x="140" y="65" width="1000" height="500" />
          <path d="M640 65V565" />
          <circle cx="640" cy="315" r="75" />
          <path d="M140 127.5A150 150 0 0 1 290 277.5V352.5A150 150 0 0 1 140 502.5" />
          <path d="M1140 127.5A150 150 0 0 0 990 277.5V352.5A150 150 0 0 0 1140 502.5" />
        </svg>
        <EscudoImagem tamanho={340} />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 0.9, letterSpacing: -2 }}>{CLUBE.nomeCompleto.toUpperCase()}</div>
          <div style={{ fontSize: 36, color: "#c8c8c8", lineHeight: 1.25, maxWidth: 620 }}>
            {`Formando atletas em ${CLUBE.cidade} desde ${CLUBE.fundacao}`}
          </div>
          <div style={{ display: "flex", width: 120, height: 8, background: "#bcd00e", marginTop: 8 }} />
        </div>
      </div>
    ),
    size,
  );
}
