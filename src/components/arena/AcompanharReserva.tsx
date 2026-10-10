"use client";

import { useEffect, useState } from "react";
import { formatarHora, formatarMoeda } from "@/lib";
import { consultarReserva, type ReservaPublica } from "@/server/acoes/publico";
import { Carregando } from "@/components/grafismos";
import { dataPorExtenso, ROTULOS_STATUS } from "./formatos";
import { formatarContagem, useContagem } from "./useContagem";

type Estado =
  | { tipo: "inicio" }
  | { tipo: "carregando" }
  | { tipo: "nao_encontrada"; codigo: string }
  | { tipo: "falha" }
  | { tipo: "ok"; reserva: ReservaPublica };

/** "pb7k3q", "7K3Q" ou "PB-7K3Q" → "PB-7K3Q" */
function normalizarCodigo(texto: string): string {
  const limpo = texto.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const sufixo = limpo.startsWith("PB") && limpo.length === 6 ? limpo.slice(2) : limpo;
  return sufixo.length === 4 ? `PB-${sufixo}` : texto.trim().toUpperCase();
}

export function AcompanharReserva({ codigoInicial }: { codigoInicial?: string }) {
  const [codigo, setCodigo] = useState("");
  const [estado, setEstado] = useState<Estado>({ tipo: "inicio" });

  useEffect(() => {
    if (codigoInicial) setCodigo(codigoInicial);
  }, [codigoInicial]);

  async function consultar(e: React.FormEvent) {
    e.preventDefault();
    const c = normalizarCodigo(codigo);
    setCodigo(c);
    setEstado({ tipo: "carregando" });
    try {
      const r = await consultarReserva(c);
      setEstado(r ? { tipo: "ok", reserva: r } : { tipo: "nao_encontrada", codigo: c });
    } catch {
      setEstado({ tipo: "falha" });
    }
  }

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
      <form onSubmit={consultar} className="lg:col-span-5">
        <label htmlFor="codigo-reserva" className="rotulo block">
          Código da reserva
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="codigo-reserva"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={8}
            placeholder="PB-7K3Q"
            required
            aria-describedby="codigo-reserva-ajuda"
            className="entrada dado max-w-[11rem] text-lg uppercase"
          />
          <button type="submit" className="btn btn-claro" disabled={estado.tipo === "carregando"} aria-busy={estado.tipo === "carregando" || undefined}>
            {estado.tipo === "carregando" && <Carregando />}
            Consultar
          </button>
        </div>
        <p id="codigo-reserva-ajuda" className="ajuda">
          Está na mensagem do WhatsApp e na tela de confirmação.
        </p>
      </form>

      <div role="status" aria-live="polite" className="mt-8 lg:col-span-7 lg:mt-0">
        {estado.tipo === "nao_encontrada" && (
          <div className="aviso aviso-erro">
            <p className="font-semibold">Não encontramos a reserva {estado.codigo}.</p>
            <p className="mt-1 text-giz">Confira as letras e os números do código.</p>
          </div>
        )}
        {estado.tipo === "falha" && (
          <div className="aviso aviso-erro">
            <p>Não foi possível consultar agora. Tente de novo em instantes.</p>
          </div>
        )}
        {estado.tipo === "ok" && <SituacaoReserva reserva={estado.reserva} />}
      </div>
    </div>
  );
}

function SituacaoReserva({ reserva: r }: { reserva: ReservaPublica }) {
  const aguardando = r.status === "aguardando_sinal";
  const resta = useContagem(aguardando ? r.expiraEm : undefined);
  const restante = Math.max(0, r.total - r.valorPago);
  const positivo = r.status === "confirmada" || r.status === "concluida";

  return (
    <div className="quadro p-5 sm:p-7">
      <p className="text-giz">
        Reserva {r.codigo}, de {r.primeiroNome}
      </p>
      <p className={`titulo t-3 mt-2 ${positivo || aguardando ? "text-branco" : "text-alerta"}`}>
        {ROTULOS_STATUS[r.status]}
      </p>
      {aguardando && resta !== null && (
        <p className="mt-2">
          {resta > 0 ? (
            <>
              Prazo para o sinal: <span className="numero text-2xl text-neon">{formatarContagem(resta)}</span>
            </>
          ) : (
            <span className="text-alerta">O prazo do sinal acabou e o horário foi liberado.</span>
          )}
        </p>
      )}
      <dl className="mt-6 grid gap-2.5 border-t border-linha pt-5">
        <div className="flex flex-wrap justify-between gap-x-6">
          <dt className="text-giz">Data</dt>
          <dd className="font-semibold">{dataPorExtenso(r.data)}</dd>
        </div>
        {r.itens.map((i) => (
          <div key={i.recurso} className="flex flex-wrap justify-between gap-x-6">
            <dt className="text-giz">{i.recurso}</dt>
            <dd className="dado">
              {formatarHora(i.inicio)} às {formatarHora(i.fim)}
            </dd>
          </div>
        ))}
        <div className="flex flex-wrap justify-between gap-x-6">
          <dt className="text-giz">Total</dt>
          <dd className="dado">{formatarMoeda(r.total)}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-6">
          <dt className="text-giz">Sinal</dt>
          <dd className="dado">{formatarMoeda(r.sinal)}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-6">
          <dt className="text-giz">Pago</dt>
          <dd className="dado">{formatarMoeda(r.valorPago)}</dd>
        </div>
        {positivo && restante > 0 && (
          <div className="flex flex-wrap justify-between gap-x-6 font-semibold">
            <dt>Restante no dia</dt>
            <dd className="dado">{formatarMoeda(restante)}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
