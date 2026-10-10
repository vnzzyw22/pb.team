import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { CATEGORIAS, CLUBE } from "@/lib";
import { URL_DO_SITE } from "@/components/site/urlDoSite";
import "./globals.css";

// Uma família só, com eixo de largura: condensada e pesada nos títulos (como o
// "PB" e o "2019" do escudo), normal no texto, expandida nos nomes de marcas.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const descricao =
  `Escolinha de futsal em ${CLUBE.cidade}/${CLUBE.estado} desde ${CLUBE.fundacao}, ` +
  `do ${CATEGORIAS[0].nome} ao ${CATEGORIAS[CATEGORIAS.length - 1].nome}, ` +
  `com o técnico ${CLUBE.tecnico.nome}. Agende uma aula experimental ou reserve a ${CLUBE.arena.nome}.`;

export const metadata: Metadata = {
  metadataBase: new URL(URL_DO_SITE),
  title: {
    default: `${CLUBE.nomeCompleto} | Escolinha de futsal em ${CLUBE.cidade}`,
    template: `%s | ${CLUBE.nomeCompleto}`,
  },
  description: descricao,
  applicationName: CLUBE.nomeCompleto,
  openGraph: {
    title: `${CLUBE.nomeCompleto} | Escolinha de futsal em ${CLUBE.cidade}`,
    description: descricao,
    siteName: CLUBE.nomeCompleto,
    locale: "pt_BR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
