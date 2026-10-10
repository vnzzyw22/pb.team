import { formatarHoraCurta, type OcupacaoSemana } from "@/lib";

// Validadas com o validador de paleta da skill de dataviz sobre o fundo #000:
// faixa de luminosidade, croma, separação para daltonismo e contraste.
const COR_TREINO = "#4a72b8";
const COR_LIVRE = "#8c9d00";

const horas = (minutos: number) => formatarHoraCurta(Math.round(minutos));

/** Semana típica da quadra: treino da escolinha × horas livres para locação, por dia. */
export function GraficoOcupacao({ ocupacao }: { ocupacao: OcupacaoSemana }) {
  const maior = Math.max(...ocupacao.dias.map((d) => d.minutosAbertos), 1);

  return (
    <figure>
      <figcaption className="sr-only">Horas de treino e horas livres da quadra em cada dia de uma semana típica</figcaption>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Legenda">
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 rounded-[2px]" style={{ background: COR_TREINO }} />
          Treino da escolinha
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 rounded-[2px]" style={{ background: COR_LIVRE }} />
          Livre para locação
        </li>
      </ul>

      <ol className="mt-5 grid gap-3">
        {ocupacao.dias.map((d) => {
          const descricao = `${d.nome}: ${horas(d.minutosTreino)} de treino, ${horas(d.minutosLivres)} livres (${horas(d.minutosLivresNobres)} no horário nobre)`;
          return (
            <li key={d.dia} className="grid grid-cols-[4.5rem_1fr] items-center gap-3 sm:grid-cols-[8rem_1fr]">
              <span className="text-sm text-giz">
                <span className="sm:hidden">{d.nome.slice(0, 3)}</span>
                <span className="hidden sm:inline">{d.nome}</span>
              </span>
              <div
                tabIndex={0}
                aria-label={descricao}
                className="group relative flex items-center gap-3 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neon"
              >
                {d.minutosAbertos === 0 ? (
                  <span className="text-sm text-giz">Fechado</span>
                ) : (
                  <>
                    <span
                      className="flex h-5 gap-[2px]"
                      style={{ width: `calc((100% - 6.5rem) * ${(d.minutosAbertos / maior).toFixed(4)})` }}
                      aria-hidden
                    >
                      {d.minutosTreino > 0 && (
                        <span
                          className={d.minutosLivres > 0 ? "" : "rounded-r"}
                          style={{ flexGrow: d.minutosTreino, flexBasis: 0, background: COR_TREINO }}
                        />
                      )}
                      {d.minutosLivres > 0 && (
                        <span className="rounded-r" style={{ flexGrow: d.minutosLivres, flexBasis: 0, background: COR_LIVRE }} />
                      )}
                    </span>
                    <span className="dado shrink-0 text-sm" aria-hidden>
                      {horas(d.minutosLivres)} livres
                    </span>
                  </>
                )}
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-max max-w-[18rem] border border-linha-forte bg-feltro px-3 py-2 text-sm opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {descricao}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      <details className="mt-6 text-sm">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-giz hover:text-branco">Ver em tabela</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[30rem] text-left">
            <thead className="text-giz">
              <tr className="border-b border-linha">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Dia
                </th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">
                  Aberto
                </th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">
                  Treino
                </th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">
                  Livre
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Livre nobre
                </th>
              </tr>
            </thead>
            <tbody>
              {ocupacao.dias.map((d) => (
                <tr key={d.dia} className="border-b border-linha">
                  <th scope="row" className="py-2 pr-4 font-normal">
                    {d.nome}
                  </th>
                  <td className="dado py-2 pr-4 text-right">{horas(d.minutosAbertos)}</td>
                  <td className="dado py-2 pr-4 text-right">{horas(d.minutosTreino)}</td>
                  <td className="dado py-2 pr-4 text-right">{horas(d.minutosLivres)}</td>
                  <td className="dado py-2 text-right">{horas(d.minutosLivresNobres)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
