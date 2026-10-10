import type { Metadata } from "next";
import Link from "next/link";
import { agoraEmMaringa, formatarData, formatarHora, formatarMoeda, somarDias, validarData, type Reserva } from "@/lib";
import { reservasDoPeriodo } from "@/server/acoes/painel";
import { protegerPagina } from "@/server/painel/acesso";
import { dataPorExtenso, ROTULOS_STATUS } from "@/components/arena/formatos";
import { NavegacaoPeriodo } from "@/components/painel/NavegacaoPeriodo";
import { segundaDaSemana, textoDoErro } from "@/components/painel/formatos";

export const metadata: Metadata = { title: "Semana" };

const ATIVAS = new Set<Reserva["status"]>(["aguardando_sinal", "confirmada", "concluida", "nao_compareceu"]);

export default async function PaginaSemana({ searchParams }: { searchParams: Promise<{ inicio?: string }> }) {
  await protegerPagina();
  const { inicio: pedido } = await searchParams;
  const hoje = agoraEmMaringa().data;
  const inicio = segundaDaSemana(pedido && validarData(pedido) ? pedido : hoje);
  const fim = somarDias(inicio, 6);
  const resposta = await reservasDoPeriodo(inicio, fim);
  const dias = Array.from({ length: 7 }, (_, i) => somarDias(inicio, i));
  const comeco = (r: Reserva) => Math.min(...r.itens.map((i) => i.intervalo.inicio));

  return (
    <div className="grid gap-8">
      <h1 className="sr-only">Reservas da semana</h1>
      <NavegacaoPeriodo
        rotulo={`${formatarData(inicio).slice(0, 5)} a ${formatarData(fim)}`}
        anterior={`/painel/semana?inicio=${somarDias(inicio, -7)}`}
        proximo={`/painel/semana?inicio=${somarDias(inicio, 7)}`}
        atual="/painel/semana"
        rotuloAtual="Esta semana"
        textoAnterior="Semana anterior"
        textoProximo="Próxima semana"
        acao="/painel/semana"
        parametro="inicio"
        valorData={inicio}
      />

      {!resposta.ok ? (
        <p role="alert" className="aviso aviso-erro">
          {textoDoErro(resposta.erro, resposta.mensagem)}
        </p>
      ) : (
        <ol className="grid gap-px border border-linha bg-linha md:grid-cols-2 xl:grid-cols-4">
          {dias.map((d) => {
            const doDia = resposta.dados.filter((r) => r.data === d).sort((a, b) => comeco(a) - comeco(b));
            const ativas = doDia.filter((r) => ATIVAS.has(r.status));
            return (
              <li key={d} className={`bg-preto p-4 ${d === hoje ? "outline outline-1 -outline-offset-1 outline-branco" : ""}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <Link href={`/painel?data=${d}`} className="font-semibold hover:underline">
                    {dataPorExtenso(d)}
                  </Link>
                  <span className="text-sm text-giz">
                    {ativas.length} {ativas.length === 1 ? "reserva" : "reservas"}
                  </span>
                </div>
                {doDia.length === 0 ? (
                  <p className="mt-3 text-sm text-giz">Sem reservas.</p>
                ) : (
                  <ul className="mt-3 grid gap-2">
                    {doDia.map((r) => (
                      <li key={r.id}>
                        <Link
                          href={`/painel?data=${d}#reserva-${r.id}`}
                          className={`block border border-linha p-2.5 text-sm hover:border-linha-forte ${ATIVAS.has(r.status) ? "" : "opacity-60"}`}
                        >
                          <span className="flex justify-between gap-3">
                            <span className="dado">
                              {formatarHora(comeco(r))}
                              {r.itens.length > 1 && " + churrasqueira"}
                            </span>
                            <span className="dado">{formatarMoeda(r.orcamento.total)}</span>
                          </span>
                          <span className="mt-0.5 block truncate font-semibold">{r.cliente.nome}</span>
                          <span className="block text-giz">{ROTULOS_STATUS[r.status]}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
