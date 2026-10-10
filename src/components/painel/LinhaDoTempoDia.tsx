import { formatarHora, formatarHoraCurta, type Segmento } from "@/lib";

const ESTILO: Record<Segmento["tipo"], { rotulo: string; bloco: string; marca: string }> = {
  treino: { rotulo: "Treino", bloco: "bg-[#4a72b8]/20", marca: "bg-[#4a72b8]" },
  reserva: { rotulo: "Reserva", bloco: "bg-white/10", marca: "bg-branco" },
  bloqueio: { rotulo: "Bloqueio", bloco: "bg-alerta/15", marca: "bg-alerta" },
  livre: { rotulo: "Livre", bloco: "border border-dashed border-linha-forte", marca: "border border-linha-forte" },
};

/** Grade do dia de um recurso: o que ocupa cada faixa, com o tipo sempre escrito. */
export function LinhaDoTempoDia({ titulo, segmentos }: { titulo: string; segmentos: Segmento[] }) {
  return (
    <section aria-label={`Linha do tempo: ${titulo}`}>
      <h3 className="rotulo">{titulo}</h3>
      {segmentos.length === 0 ? (
        <p className="mt-3 text-giz">Fechado neste dia.</p>
      ) : (
        <ol className="mt-3 grid gap-1">
          {segmentos.map((s) => {
            const e = ESTILO[s.tipo];
            const conteudo = (
              <>
                <span className="dado w-[6.5rem] shrink-0 text-sm text-giz">
                  {formatarHora(s.inicio)}–{formatarHora(s.fim)}
                </span>
                <span className={`flex min-h-11 flex-1 items-center gap-2.5 px-3 py-2 ${e.bloco}`}>
                  <span aria-hidden className={`h-2.5 w-2.5 shrink-0 ${e.marca}`} />
                  <span className="text-sm font-semibold">{e.rotulo}</span>
                  {s.tipo !== "livre" && <span className="truncate text-sm text-giz">{s.rotulo}</span>}
                  <span className="dado ml-auto shrink-0 text-xs text-giz">{formatarHoraCurta(s.fim - s.inicio)}</span>
                </span>
              </>
            );
            return (
              <li key={`${s.inicio}-${s.tipo}`}>
                {s.tipo === "reserva" && s.refId ? (
                  <a href={`#reserva-${s.refId}`} className="flex items-stretch gap-3 hover:opacity-85">
                    {conteudo}
                  </a>
                ) : (
                  <div className="flex items-stretch gap-3">{conteudo}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
