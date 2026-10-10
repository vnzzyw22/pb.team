"use client";

import { useState } from "react";
import { formatarHora, formatarMoeda, formatarTelefone, linkWhatsApp, POLITICA, RECURSOS, type Reserva } from "@/lib";
import {
  cancelarReserva,
  confirmarSinal,
  linkDeLembrete,
  marcarComparecimento,
  registrarPagamento,
} from "@/server/acoes/painel";
import { dataPorExtenso, ROTULOS_STATUS } from "@/components/arena/formatos";
import { formatarContagem, useContagem } from "@/components/arena/useContagem";
import { Carregando, IconeWhatsApp } from "@/components/grafismos";
import { prepararAbaWhatsApp } from "@/components/ui/abaWhatsApp";
import { avisarNoPainel } from "./AvisosPainel";
import { centavosParaCampo, paraCentavos, ROTULOS_ORIGEM } from "./formatos";
import { useAcao } from "./useAcao";

const TOM_STATUS: Record<Reserva["status"], string> = {
  aguardando_sinal: "border-neon text-neon",
  confirmada: "border-branco text-branco",
  concluida: "border-linha-forte text-giz",
  cancelada: "border-alerta/60 text-alerta",
  expirada: "border-alerta/60 text-alerta",
  nao_compareceu: "border-alerta/60 text-alerta",
};

interface CartaoReservaProps {
  reserva: Reserva;
  /** Mostra a data (listas de vários dias). */
  comData?: boolean;
}

export function CartaoReserva({ reserva: r, comData = false }: CartaoReservaProps) {
  const { executar, pendente, erro, setErro } = useAcao();
  const [modo, setModo] = useState<"normal" | "pagamento" | "cancelar">("normal");
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const aguardando = r.status === "aguardando_sinal";
  const resta = useContagem(aguardando ? r.expiraEm : undefined);
  const restante = Math.max(0, r.orcamento.total - r.valorPago);
  const ocupado = pendente !== null;

  async function confirmar() {
    const aba = prepararAbaWhatsApp();
    const res = await executar("sinal", () => confirmarSinal(r.id));
    if (res) {
      aba.abrir(res.dados.whatsapp);
      avisarNoPainel(`Sinal da reserva ${r.codigo} confirmado. A mensagem para ${r.cliente.nome} abriu no WhatsApp.`);
    } else aba.cancelar();
  }

  async function lembrete() {
    const aba = prepararAbaWhatsApp();
    const res = await executar("lembrete", () => linkDeLembrete(r.id));
    if (res) aba.abrir(res.dados);
    else aba.cancelar();
  }

  async function pagar(e: React.FormEvent) {
    e.preventDefault();
    const centavos = paraCentavos(valor);
    if (!centavos) {
      setErro("Informe um valor maior que zero, por exemplo 80,00.");
      return;
    }
    const res = await executar("pagamento", () => registrarPagamento(r.id, centavos));
    if (res) {
      setModo("normal");
      setAviso(`Pagamento de ${formatarMoeda(centavos)} registrado.`);
    }
  }

  async function cancelar(e: React.FormEvent) {
    e.preventDefault();
    const res = await executar("cancelar", () => cancelarReserva(r.id, motivo));
    if (res) {
      setModo("normal");
      avisarNoPainel(
        res.dados.devolverSinal
          ? `Reserva cancelada. Devolva ${formatarMoeda(res.dados.reserva.valorPago)} ao cliente: o cancelamento foi feito com mais de ${POLITICA.cancelamentoGratuitoHoras}h de antecedência.`
          : r.valorPago > 0
            ? `Reserva cancelada. Pela política, o sinal não é devolvido (menos de ${POLITICA.cancelamentoGratuitoHoras}h de antecedência).`
            : "Reserva cancelada. Não havia pagamento a devolver.",
      );
    }
  }

  return (
    <article id={`reserva-${r.id}`} className="quadro scroll-mt-40 p-4 sm:p-5" aria-labelledby={`reserva-${r.id}-titulo`}>
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <h3 id={`reserva-${r.id}-titulo`} className="text-lg font-semibold leading-tight">
            {r.cliente.nome}
          </h3>
          <p className="mt-1 text-sm text-giz">
            <span className="dado">{r.codigo}</span> · {ROTULOS_ORIGEM[r.origem]}
            {comData && <> · {dataPorExtenso(r.data)}</>}
          </p>
        </div>
        <span className={`border px-2 py-0.5 text-sm font-semibold ${TOM_STATUS[r.status]}`}>{ROTULOS_STATUS[r.status]}</span>
      </header>

      <ul className="mt-3 grid gap-1 text-[0.9375rem]">
        {r.itens.map((i) => (
          <li key={i.recursoId} className="flex justify-between gap-4">
            <span className="text-giz">{RECURSOS[i.recursoId].nome}</span>
            <span className="dado">
              {formatarHora(i.intervalo.inicio)} às {formatarHora(i.intervalo.fim)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-linha pt-3 text-sm">
        <div>
          <dt className="text-giz">Total</dt>
          <dd className="dado text-base">{formatarMoeda(r.orcamento.total)}</dd>
        </div>
        <div>
          <dt className="text-giz">Pago</dt>
          <dd className="dado text-base">{formatarMoeda(r.valorPago)}</dd>
        </div>
        <div>
          <dt className="text-giz">{aguardando ? "Sinal" : "Restante"}</dt>
          <dd className="dado text-base">{formatarMoeda(aguardando ? r.orcamento.sinal : restante)}</dd>
        </div>
      </dl>

      {aguardando && resta !== null && (
        <p className="mt-3 text-sm">
          {resta > 0 ? (
            <>
              Horário segurado por mais <span className="dado text-neon">{formatarContagem(resta)}</span>
            </>
          ) : (
            <span className="text-alerta">O prazo do sinal venceu. Ainda dá para confirmar se o horário continuar livre.</span>
          )}
        </p>
      )}
      {r.observacoes && <p className="mt-3 text-sm text-giz">Obs.: {r.observacoes}</p>}
      {r.motivoCancelamento && <p className="mt-3 text-sm text-giz">Motivo: {r.motivoCancelamento}</p>}

      <a
        href={linkWhatsApp("", r.cliente.telefone)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-giz hover:text-branco"
      >
        <IconeWhatsApp className="h-4 w-4" />
        <span className="dado">{formatarTelefone(r.cliente.telefone)}</span>
      </a>

      {aviso && (
        <p role="status" className="aviso aviso-ok mt-3 text-sm">
          {aviso}
        </p>
      )}
      {erro && (
        <p role="alert" className="aviso aviso-erro mt-3 text-sm">
          {erro}
        </p>
      )}

      {modo === "pagamento" && (
        <form onSubmit={pagar} className="mt-4 flex flex-wrap items-end gap-2 border-t border-linha pt-4">
          <div>
            <label htmlFor={`valor-${r.id}`} className="block text-sm font-semibold">
              Valor recebido (R$)
            </label>
            <input
              id={`valor-${r.id}`}
              inputMode="decimal"
              className="entrada dado mt-1.5 w-36 min-h-11"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-neon btn-pequeno" disabled={ocupado} aria-busy={pendente === "pagamento" || undefined}>
            {pendente === "pagamento" && <Carregando />}
            Registrar
          </button>
          <button type="button" className="btn btn-sobrio btn-pequeno" onClick={() => setModo("normal")}>
            Voltar
          </button>
        </form>
      )}

      {modo === "cancelar" && (
        <form onSubmit={cancelar} className="mt-4 grid gap-3 border-t border-linha pt-4">
          <p className="text-sm">
            {r.valorPago > 0
              ? `Cancelamentos até ${POLITICA.cancelamentoGratuitoHoras}h antes devolvem o sinal. O sistema avisa se precisa devolver.`
              : "Não há pagamento registrado nesta reserva."}
          </p>
          <div>
            <label htmlFor={`motivo-${r.id}`} className="block text-sm font-semibold">
              Motivo <span className="font-normal text-giz">(opcional)</span>
            </label>
            <input id={`motivo-${r.id}`} className="entrada mt-1.5 min-h-11" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-perigo btn-pequeno" disabled={ocupado} aria-busy={pendente === "cancelar" || undefined}>
              {pendente === "cancelar" && <Carregando />}
              Confirmar cancelamento
            </button>
            <button type="button" className="btn btn-sobrio btn-pequeno" onClick={() => setModo("normal")}>
              Voltar
            </button>
          </div>
        </form>
      )}

      {modo === "normal" && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-linha pt-4">
          {(r.status === "aguardando_sinal" || r.status === "expirada") && (
            <button type="button" className="btn btn-neon btn-pequeno" onClick={confirmar} disabled={ocupado} aria-busy={pendente === "sinal" || undefined}>
              {pendente === "sinal" && <Carregando />}
              Confirmar sinal de {formatarMoeda(r.orcamento.sinal)}
            </button>
          )}
          {(r.status === "confirmada" || (r.status === "concluida" && restante > 0)) && (
            <button
              type="button"
              className="btn btn-sobrio btn-pequeno"
              disabled={ocupado}
              onClick={() => {
                setValor(restante > 0 ? centavosParaCampo(restante) : "");
                setAviso(null);
                setModo("pagamento");
              }}
            >
              Registrar pagamento
            </button>
          )}
          {r.status === "confirmada" && (
            <>
              <button
                type="button"
                className="btn btn-sobrio btn-pequeno"
                disabled={ocupado}
                aria-busy={pendente === "compareceu" || undefined}
                onClick={() => executar("compareceu", () => marcarComparecimento(r.id, true))}
              >
                Compareceu
              </button>
              <button
                type="button"
                className="btn btn-sobrio btn-pequeno"
                disabled={ocupado}
                aria-busy={pendente === "faltou" || undefined}
                onClick={() => executar("faltou", () => marcarComparecimento(r.id, false))}
              >
                Faltou
              </button>
              <button type="button" className="btn btn-sobrio btn-pequeno" disabled={ocupado} onClick={lembrete}>
                <IconeWhatsApp className="h-4 w-4" />
                Lembrete
              </button>
            </>
          )}
          {(r.status === "aguardando_sinal" || r.status === "confirmada") && (
            <button
              type="button"
              className="btn btn-perigo btn-pequeno"
              disabled={ocupado}
              onClick={() => {
                setAviso(null);
                setModo("cancelar");
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      )}
    </article>
  );
}
