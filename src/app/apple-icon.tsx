import { ImageResponse } from "next/og";
import { EscudoImagem } from "@/components/site/EscudoImagem";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function IconeApple() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "#000" }}>
        <EscudoImagem tamanho={164} />
      </div>
    ),
    size,
  );
}
