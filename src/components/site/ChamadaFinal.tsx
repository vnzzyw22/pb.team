import Link from "next/link";
import { LinhaDoMeio } from "@/components/grafismos";
import { ANCORA_AULA } from "./navegacao";

interface ChamadaFinalProps {
  titulo?: string;
  texto?: string;
}

/** Fechamento das páginas: a linha do meio da quadra e o convite para a aula. */
export function ChamadaFinal({
  titulo = "Traga seu filho para treinar",
  texto = "Você informa o ano de nascimento, a gente indica a turma e combina o dia da aula experimental pelo WhatsApp.",
}: ChamadaFinalProps) {
  return (
    <section aria-labelledby="titulo-fechamento" className="pb-24 lg:pb-32">
      <div className="recipiente">
        <LinhaDoMeio />
        <div className="mt-16 max-w-3xl lg:mt-20">
          <h2 id="titulo-fechamento" className="titulo t-1">
            {titulo}
          </h2>
          <p className="lead medida mt-6 text-giz">{texto}</p>
          <Link href={ANCORA_AULA} className="btn btn-neon mt-9">
            Agende uma aula experimental
          </Link>
        </div>
      </div>
    </section>
  );
}
