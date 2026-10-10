import Link from "next/link";

interface NavegacaoPeriodoProps {
  rotulo: string;
  anterior: string;
  proximo: string;
  atual: string;
  rotuloAtual: string;
  /** Rótulos acessíveis: "Dia anterior", "Semana anterior"… */
  textoAnterior: string;
  textoProximo: string;
  /** Formulário de data (GET): rota e nome do parâmetro. */
  acao: string;
  parametro: string;
  valorData: string;
}

function Seta({ direcao }: { direcao: "esquerda" | "direita" }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={direcao === "esquerda" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} />
    </svg>
  );
}

/** Navegação entre dias ou semanas, com atalho para hoje e campo de data. */
export function NavegacaoPeriodo(p: NavegacaoPeriodoProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <div className="flex items-center gap-1">
        <Link href={p.anterior} className="btn btn-sobrio btn-pequeno px-3" aria-label={p.textoAnterior}>
          <Seta direcao="esquerda" />
        </Link>
        <Link href={p.atual} className="btn btn-sobrio btn-pequeno">
          {p.rotuloAtual}
        </Link>
        <Link href={p.proximo} className="btn btn-sobrio btn-pequeno px-3" aria-label={p.textoProximo}>
          <Seta direcao="direita" />
        </Link>
      </div>
      <h2 className="titulo t-3">{p.rotulo}</h2>
      <form action={p.acao} method="get" className="flex items-center gap-2 sm:ml-auto">
        <label htmlFor="ir-para-data" className="sr-only">
          Ir para a data
        </label>
        <input id="ir-para-data" type="date" name={p.parametro} defaultValue={p.valorData} className="entrada dado min-h-11 w-auto py-2" />
        <button type="submit" className="btn btn-sobrio btn-pequeno">
          Ir
        </button>
      </form>
    </div>
  );
}
