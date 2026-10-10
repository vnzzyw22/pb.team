"use client";

import { useEffect, useRef, useState } from "react";
import {
  anosDeNascimento,
  CATEGORIAS,
  categoriaPorAnoNascimento,
  resumoHorarios,
  type Categoria,
  type ResultadoCategoria,
} from "@/lib";
import { FotoClube } from "@/components/FotoClube";
import { whatsappDoClube } from "@/components/site/navegacao";
import { FormAulaExperimental, type PedidoDeAgendamento } from "./FormAulaExperimental";
import { textoNascidos } from "./formatos";

/** "Cada turma treina de 2 a 3 vezes por semana.", a partir das sessões cadastradas. */
function frequenciaDosTreinos(): string {
  const vezes = CATEGORIAS.flatMap((c) => c.turmas.map((t) => t.sessoes.length));
  const menor = Math.min(...vezes);
  const maior = Math.max(...vezes);
  return menor === maior
    ? `Cada turma treina ${menor} vezes por semana.`
    : `Cada turma treina de ${menor} a ${maior} vezes por semana.`;
}

function interpretarAno(texto: string): { ano: number; resultado: ResultadoCategoria } {
  const limpo = texto.trim();
  const ano = /^\d{4}$/.test(limpo) ? Number(limpo) : NaN;
  return { ano, resultado: categoriaPorAnoNascimento(ano) };
}

/** Busca por ano, quadro de categorias e formulário de aula experimental. */
export function EscolinhaInterativa() {
  const [valor, setValor] = useState("");
  const [busca, setBusca] = useState<{ ano: number; resultado: ResultadoCategoria } | null>(null);
  const [pedido, setPedido] = useState<PedidoDeAgendamento>({ n: 0 });
  const secaoBusca = useRef<HTMLElement>(null);

  // Vindo da Home com ?ano=2016: já mostra a resposta.
  useEffect(() => {
    const ano = new URLSearchParams(window.location.search).get("ano");
    if (!ano) return;
    setValor(ano);
    setBusca(interpretarAno(ano));
    secaoBusca.current?.scrollIntoView({ block: "start" });
  }, []);

  const marcada = busca?.resultado.ok ? busca.resultado.categoria.id : null;
  const agendar = (ano?: number) => setPedido((p) => ({ ano, n: p.n + 1 }));

  return (
    <>
      <section ref={secaoBusca} id="busca" aria-labelledby="titulo-busca" className="scroll-mt-20 border-y border-linha">
        <div className="recipiente py-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:py-20">
          <div className="lg:col-span-5">
            <h2 id="titulo-busca" className="titulo t-2">
              <label htmlFor="ano-busca">Em que ano seu filho nasceu?</label>
            </h2>
            <form
              className="mt-7 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setBusca(interpretarAno(valor));
              }}
            >
              <input
                id="ano-busca"
                value={valor}
                onChange={(e) => setValor(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                placeholder="Ex.: 2016"
                aria-invalid={busca?.resultado.ok === false && busca.resultado.motivo === "ano_invalido" ? true : undefined}
                aria-describedby="resposta-busca"
                className="entrada dado max-w-[10rem] text-2xl"
              />
              <button type="submit" className="btn btn-claro">
                Encontrar a turma
              </button>
            </form>
          </div>

          <div id="resposta-busca" role="status" aria-live="polite" className="mt-8 lg:col-span-7 lg:mt-0">
            {busca && <RespostaBusca busca={busca} onAgendar={agendar} />}
            {!busca && (
              <p className="ajuda max-w-[38ch] text-base lg:mt-3">
                A categoria vale pelo ano de nascimento, para a temporada inteira. Digite o ano e veja a turma e os horários.
              </p>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="titulo-categorias" className="recipiente secao">
        <h2 id="titulo-categorias" className="titulo t-2">
          Categorias e horários
        </h2>
        <p className="lead medida mt-4 text-giz">{frequenciaDosTreinos()}</p>
        <ul className="mt-10 border-t border-linha">
          {CATEGORIAS.map((c) => (
            <CartaoCategoria key={c.id} categoria={c} marcada={c.id === marcada} onAgendar={() => agendar()} />
          ))}
        </ul>
      </section>

      <div className="relative aspect-[3/2] overflow-hidden sm:aspect-[21/9]">
        <FotoClube id="jogo-conducao-vs-viagens" sizes="100vw" />
      </div>

      <FormAulaExperimental pedido={pedido} />
    </>
  );
}

function RespostaBusca({
  busca: { ano, resultado },
  onAgendar,
}: {
  busca: { ano: number; resultado: ResultadoCategoria };
  onAgendar: (ano?: number) => void;
}) {
  if (resultado.ok) {
    const { categoria, idadeNoAno, temporada } = resultado;
    return (
      <div className="quadro p-5 sm:p-7">
        <p className="text-giz">
          Em {temporada}, quem nasceu em {ano} completa {idadeNoAno} anos e joga no
        </p>
        <p className="titulo t-1 relative ml-[0.5em] mt-[0.5em] inline-block">
          <span className="relative block">{categoria.nome}</span>
          <CirculoMarcador key={`${ano}-${categoria.id}`} />
        </p>
        <ul className="mt-6 grid gap-4 border-t border-linha pt-5 sm:grid-cols-2">
          {categoria.turmas.map((t) => (
            <li key={t.id}>
              {categoria.turmas.length > 1 && <p className="rotulo text-giz">{t.nome}</p>}
              {resumoHorarios(t).map((h) => (
                <p key={h} className="dado mt-1 text-xl text-neon">
                  {h}
                </p>
              ))}
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <button type="button" className="btn btn-neon" onClick={() => onAgendar(ano)}>
            Agendar aula experimental no {categoria.nome}
          </button>
          <a href={`#categoria-${categoria.id}`} className="link-jogada inline-flex min-h-11 items-center self-start sm:self-auto">
            Ver no quadro
          </a>
        </div>
      </div>
    );
  }

  const primeira = CATEGORIAS[0];
  const ultima = CATEGORIAS[CATEGORIAS.length - 1];
  const textos: Record<typeof resultado.motivo, { titulo: string; detalhe: string }> = {
    muito_novo: {
      titulo: `Ainda não temos turma para quem nasceu em ${ano}.`,
      detalhe: `O ${primeira.nome} começa aos ${primeira.idadeMin} anos: ${textoNascidos(primeira).toLowerCase()}.`,
    },
    muito_velho: {
      titulo: `A escolinha vai até o ${ultima.nome}.`,
      detalhe: `Atendemos atletas nascidos a partir de ${Math.min(...anosDeNascimento(ultima))}.`,
    },
    ano_invalido: {
      titulo: "Digite o ano com quatro números.",
      detalhe: "Por exemplo: 2016.",
    },
  };
  const texto = textos[resultado.motivo];
  return (
    <div className={`aviso ${resultado.motivo === "ano_invalido" ? "aviso-erro" : ""}`}>
      <p className="font-semibold">{texto.titulo}</p>
      <p className="mt-1 text-giz">{texto.detalhe}</p>
      {resultado.motivo !== "ano_invalido" && (
        <a href={whatsappDoClube()} target="_blank" rel="noopener noreferrer" className="link-jogada mt-3 inline-flex min-h-11 items-center">
          Falar com o clube no WhatsApp
        </a>
      )}
    </div>
  );
}

function CartaoCategoria({ categoria, marcada, onAgendar }: { categoria: Categoria; marcada: boolean; onAgendar: () => void }) {
  return (
    <li
      id={`categoria-${categoria.id}`}
      className="relative grid scroll-mt-24 grid-cols-[7.25rem_1fr] gap-x-4 border-b border-linha py-5 sm:grid-cols-[10rem_1fr] sm:gap-x-8 lg:grid-cols-[11rem_12rem_1fr_auto] lg:items-baseline lg:py-7"
    >
      <div className="lg:contents">
        <div className="titulo t-3 relative inline-block w-fit self-start justify-self-start">
          <h3 className="relative">{categoria.nome}</h3>
          {marcada && <CirculoMarcador />}
        </div>
        <p className="mt-2 text-sm text-giz sm:text-base lg:col-start-2 lg:mt-0">{textoNascidos(categoria)}</p>
        {marcada && <span className="sr-only">(categoria do ano buscado)</span>}
      </div>
      <ul className="grid content-start gap-3 lg:col-start-3 lg:flex lg:flex-wrap lg:gap-x-10">
        {categoria.turmas.map((t) => (
          <li key={t.id}>
            {categoria.turmas.length > 1 && <p className="text-sm font-semibold text-giz">{t.nome}</p>}
            {resumoHorarios(t).map((h) => (
              <p key={h} className="dado text-[1.0625rem] text-neon sm:text-lg">
                {h}
              </p>
            ))}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onAgendar}
        className="link-jogada col-start-2 mt-3 inline-flex min-h-11 items-center justify-self-start text-[0.9375rem] lg:col-start-4 lg:mt-0 lg:self-center"
      >
        Agendar aula<span className="hidden sm:inline">&nbsp;experimental</span>
        <span className="sr-only"> experimental no {categoria.nome}</span>
      </button>
    </li>
  );
}

/**
 * O círculo de marcador que o técnico faz em volta da categoria encontrada.
 * Medido em em a partir do título que ele envolve: acompanha o tamanho fluido da letra.
 */
function CirculoMarcador() {
  return (
    <svg
      viewBox="0 0 200 80"
      preserveAspectRatio="none"
      aria-hidden
      className="pointer-events-none absolute left-[-0.55em] top-[-0.45em] h-[calc(100%+0.9em)] w-[calc(100%+1.1em)] text-branco"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path
        d="M44 72C14 70 6 56 8 38 10 18 40 8 100 7 160 6 194 14 194 38 194 62 160 74 100 74 66 74 30 70 18 56"
        pathLength={1}
        className="desenhar"
      />
    </svg>
  );
}
