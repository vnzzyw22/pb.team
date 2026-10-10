import type { Metadata } from "next";
import { agoraEmMaringa, RECURSOS, somarDias, validarData, type RecursoId } from "@/lib";
import { agendaDoDia, pendentesDeSinal } from "@/server/acoes/painel";
import { protegerPagina } from "@/server/painel/acesso";
import { dataPorExtenso } from "@/components/arena/formatos";
import { CartaoReserva } from "@/components/painel/CartaoReserva";
import { LinhaDoTempoDia } from "@/components/painel/LinhaDoTempoDia";
import { NavegacaoPeriodo } from "@/components/painel/NavegacaoPeriodo";
import { textoDoErro } from "@/components/painel/formatos";

export const metadata: Metadata = { title: "Hoje" };

export default async function PaginaHoje({ searchParams }: { searchParams: Promise<{ data?: string }> }) {
  await protegerPagina();
  const { data: pedida } = await searchParams;
  const hoje = agoraEmMaringa().data;
  const data = pedida && validarData(pedida) ? pedida : hoje;

  const [agenda, pendentes] = await Promise.all([agendaDoDia(data), pendentesDeSinal()]);
  const recursos = Object.keys(RECURSOS) as RecursoId[];
  const inicio = (itens: { intervalo: { inicio: number } }[]) => Math.min(...itens.map((i) => i.intervalo.inicio));

  return (
    <div className="grid gap-12">
      {pendentes.ok && pendentes.dados.length > 0 && (
        <section aria-labelledby="titulo-pendentes">
          <h2 id="titulo-pendentes" className="titulo t-3">
            Aguardando sinal <span className="dado align-middle text-[0.65em] text-neon">{pendentes.dados.length}</span>
          </h2>
          <p className="mt-2 text-sm text-giz">Confira o Pix e confirme. Sem sinal no prazo, o horário volta a ficar livre sozinho.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {pendentes.dados.map((r) => (
              <CartaoReserva key={r.id} reserva={r} comData />
            ))}
          </div>
        </section>
      )}
      {!pendentes.ok && (
        <p role="alert" className="aviso aviso-erro">
          {textoDoErro(pendentes.erro, pendentes.mensagem)}
        </p>
      )}

      <section aria-labelledby="titulo-dia" className="grid gap-6">
        <span id="titulo-dia" className="sr-only">
          Agenda do dia
        </span>
        <NavegacaoPeriodo
          rotulo={data === hoje ? `Hoje, ${dataPorExtenso(data).split(", ")[1]}` : dataPorExtenso(data)}
          anterior={`/painel?data=${somarDias(data, -1)}`}
          proximo={`/painel?data=${somarDias(data, 1)}`}
          atual="/painel"
          rotuloAtual="Hoje"
          textoAnterior="Dia anterior"
          textoProximo="Próximo dia"
          acao="/painel"
          parametro="data"
          valorData={data}
        />

        {!agenda.ok ? (
          <p role="alert" className="aviso aviso-erro">
            {textoDoErro(agenda.erro, agenda.mensagem)}
          </p>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-12">
            <div className="grid content-start gap-8">
              {recursos.map((id) => (
                <LinhaDoTempoDia key={id} titulo={RECURSOS[id].nome} segmentos={agenda.dados.grade[id]} />
              ))}
            </div>
            <section aria-labelledby="titulo-reservas-dia">
              <h3 id="titulo-reservas-dia" className="rotulo">
                Reservas do dia
              </h3>
              {agenda.dados.reservas.length === 0 ? (
                <p className="mt-3 text-giz">Nenhuma reserva neste dia.</p>
              ) : (
                <div className="mt-3 grid gap-3">
                  {[...agenda.dados.reservas]
                    .sort((a, b) => inicio(a.itens) - inicio(b.itens))
                    .map((r) => (
                      <CartaoReserva key={r.id} reserva={r} />
                    ))}
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
