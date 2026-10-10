import type { Metadata } from "next";
import { CLUBE } from "@/lib";
import { EscolinhaInterativa } from "@/components/escolinha/EscolinhaInterativa";
import { faixaDeCategorias } from "@/components/escolinha/formatos";

const { primeira, ultima } = faixaDeCategorias();

export const metadata: Metadata = {
  title: "Escolinha",
  description:
    `Escolinha de futsal em ${CLUBE.cidade} do ${primeira} ao ${ultima}: descubra a categoria pelo ano de ` +
    `nascimento, veja os horários das turmas e agende uma aula experimental.`,
};

// As faixas de ano das categorias mudam com a temporada.
export const revalidate = 86400;

export default function PaginaEscolinha() {
  return (
    <>
      <section className="recipiente pb-12 pt-28 lg:pb-16 lg:pt-40">
        <h1 className="titulo t-1">Escolinha</h1>
        <p className="lead medida mt-6 text-giz">
          Futsal para crianças e jovens do <span className="whitespace-nowrap">{primeira}</span> ao{" "}
          <span className="whitespace-nowrap">{ultima}</span>, em turmas separadas por idade, com o técnico {CLUBE.tecnico.nome}.
        </p>
        {CLUBE.matriculas.abertas && (
          <p className="mt-6 inline-flex items-center gap-2.5 border border-white/40 px-3 py-1.5 text-sm font-semibold">
            <span className="h-2 w-2 rounded-full bg-neon" aria-hidden />
            Matrículas abertas
          </p>
        )}
      </section>

      <EscolinhaInterativa />
    </>
  );
}
