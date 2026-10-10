"use client";

import Link from "next/link";
import { useState } from "react";
import { formatarHora, normalizarTelefone, RECURSOS, type Ocupacao, type RecursoId, type Reserva } from "@/lib";
import { lancarReserva } from "@/server/acoes/painel";
import { formatarDuracao, MENSAGENS_ERRO_RESERVA } from "@/components/arena/formatos";
import { Carregando } from "@/components/grafismos";
import { Campo } from "@/components/ui/Campo";
import { paraCentavos } from "./formatos";
import { useAcao } from "./useAcao";

const DURACOES_PAINEL = [60, 90, 120, 150, 180, 240];
const ROTULO_OCUPACAO: Record<Ocupacao["tipo"], string> = { treino: "Treino", reserva: "Reserva", bloqueio: "Bloqueio" };

export function FormLancar({ hoje }: { hoje: string }) {
  const { executar, pendente, erro, setErro } = useAcao();
  const [recursoId, setRecursoId] = useState<RecursoId>("quadra");
  const [data, setData] = useState(hoje);
  const [inicio, setInicio] = useState("19:00");
  const [duracao, setDuracao] = useState(60);
  const [combo, setCombo] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [valorPago, setValorPago] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [problemas, setProblemas] = useState<{ textos: string[]; conflitos: Ocupacao[] } | null>(null);
  const [criada, setCriada] = useState<{ reserva: Reserva; whatsapp: string } | null>(null);

  const duracoes = recursoId === "quadra" ? DURACOES_PAINEL : RECURSOS[recursoId].duracoes;

  async function lancar(e: React.FormEvent) {
    e.preventDefault();
    setProblemas(null);
    if (!nome.trim() || !normalizarTelefone(telefone)) {
      setErro(!nome.trim() ? "Escreva o nome do cliente." : MENSAGENS_ERRO_RESERVA.telefone_invalido);
      return;
    }
    const pago = valorPago ? paraCentavos(valorPago) : 0;
    if (pago === null) {
      setErro("Valor pago inválido. Use, por exemplo, 80,00.");
      return;
    }
    const res = await executar("lancar", () =>
      lancarReserva({
        data,
        recursoId,
        inicio,
        duracao,
        comChurrasqueira: recursoId === "quadra" && combo,
        cliente: { nome, telefone },
        observacoes: observacoes || undefined,
        valorPago: pago || undefined,
      }),
    );
    if (!res) return;
    if (res.dados.ok) {
      setCriada({ reserva: res.dados.reserva, whatsapp: res.dados.whatsapp });
    } else {
      setProblemas({ textos: res.dados.erros.map((x) => MENSAGENS_ERRO_RESERVA[x]), conflitos: res.dados.conflitos });
    }
  }

  if (criada) {
    return (
      <div role="status" className="aviso aviso-ok p-5 sm:p-6">
        <p className="titulo t-3">Reserva lançada</p>
        <p className="mt-2">
          Código <span className="dado">{criada.reserva.codigo}</span>, {criada.reserva.cliente.nome}, já confirmada.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a href={criada.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-neon btn-pequeno">
            Enviar confirmação no WhatsApp
          </a>
          <Link href={`/painel?data=${criada.reserva.data}#reserva-${criada.reserva.id}`} className="btn btn-sobrio btn-pequeno">
            Ver no dia
          </Link>
          <button
            type="button"
            className="btn btn-sobrio btn-pequeno"
            onClick={() => {
              setCriada(null);
              setNome("");
              setTelefone("");
              setValorPago("");
              setObservacoes("");
            }}
          >
            Lançar outra
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={lancar} noValidate className="grid max-w-3xl gap-6">
      {(erro || problemas) && (
        <div role="alert" className="aviso aviso-erro">
          {erro && <p>{erro}</p>}
          {problemas?.textos.map((t) => (
            <p key={t}>{t}</p>
          ))}
          {problemas && problemas.conflitos.length > 0 && (
            <ul className="mt-2 grid gap-1 text-sm">
              {problemas.conflitos.map((o) => (
                <li key={`${o.refId}-${o.inicio}`}>
                  {ROTULO_OCUPACAO[o.tipo]}: {o.rotulo}, {formatarHora(o.inicio)} às {formatarHora(o.fim)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-3">
        <Campo id="lancar-data" rotulo="Data">
          <input id="lancar-data" type="date" className="entrada dado" value={data} onChange={(e) => setData(e.target.value)} required />
        </Campo>
        <Campo id="lancar-inicio" rotulo="Início">
          <input id="lancar-inicio" type="time" step={1800} className="entrada dado" value={inicio} onChange={(e) => setInicio(e.target.value)} required />
        </Campo>
        <Campo id="lancar-duracao" rotulo="Duração">
          <select id="lancar-duracao" className="entrada" value={duracao} onChange={(e) => setDuracao(Number(e.target.value))}>
            {duracoes.map((m) => (
              <option key={m} value={m}>
                {formatarDuracao(m)}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo id="lancar-recurso" rotulo="Espaço">
          <select
            id="lancar-recurso"
            className="entrada"
            value={recursoId}
            onChange={(e) => {
              const id = e.target.value as RecursoId;
              setRecursoId(id);
              setDuracao(id === "quadra" ? 60 : RECURSOS[id].duracoes[0]);
            }}
          >
            {(Object.keys(RECURSOS) as RecursoId[])
              .filter((id) => RECURSOS[id].ativo)
              .map((id) => (
                <option key={id} value={id}>
                  {RECURSOS[id].nome}
                </option>
              ))}
          </select>
        </Campo>
        {recursoId === "quadra" && RECURSOS.churrasqueira.ativo && (
          <label className="flex min-h-11 items-center gap-3 self-end pb-3">
            <input type="checkbox" className="h-5 w-5" checked={combo} onChange={(e) => setCombo(e.target.checked)} />
            Com {RECURSOS.churrasqueira.nome.toLowerCase()} (combo)
          </label>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo id="lancar-nome" rotulo="Nome do cliente">
          <input id="lancar-nome" className="entrada" autoComplete="off" value={nome} onChange={(e) => setNome(e.target.value)} />
        </Campo>
        <Campo id="lancar-telefone" rotulo="WhatsApp do cliente">
          <input
            id="lancar-telefone"
            type="tel"
            inputMode="tel"
            className="entrada dado"
            placeholder="(44) 99999-9999"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </Campo>
      </div>

      <div className="grid gap-6 sm:grid-cols-[12rem_1fr]">
        <Campo id="lancar-pago" rotulo="Já pago (R$)" opcional>
          <input id="lancar-pago" inputMode="decimal" className="entrada dado" placeholder="0,00" value={valorPago} onChange={(e) => setValorPago(e.target.value)} />
        </Campo>
        <Campo id="lancar-obs" rotulo="Observações" opcional>
          <input id="lancar-obs" className="entrada" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        </Campo>
      </div>

      <div>
        <button type="submit" className="btn btn-neon" disabled={pendente !== null} aria-busy={pendente !== null || undefined}>
          {pendente && <Carregando />}
          Lançar reserva confirmada
        </button>
        <p className="ajuda">Pelo painel, a reserva entra confirmada e não precisa de antecedência mínima.</p>
      </div>
    </form>
  );
}
