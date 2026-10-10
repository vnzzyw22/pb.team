"use client";

import { useState } from "react";
import { formatarHora, RECURSOS, type Bloqueio, type RecursoId, type Reserva } from "@/lib";
import { bloquearHorario, desbloquearHorario } from "@/server/acoes/painel";
import { dataPorExtenso } from "@/components/arena/formatos";
import { Carregando } from "@/components/grafismos";
import { Campo } from "@/components/ui/Campo";
import { useAcao } from "./useAcao";

const nomeRecurso = (id: RecursoId | "todos") => (id === "todos" ? "Todos os espaços" : RECURSOS[id].nome);

export function FormBloqueio({ hoje }: { hoje: string }) {
  const { executar, pendente, erro, setErro } = useAcao();
  const [recursoId, setRecursoId] = useState<RecursoId | "todos">("quadra");
  const [data, setData] = useState(hoje);
  const [inicio, setInicio] = useState("08:00");
  const [fim, setFim] = useState("12:00");
  const [motivo, setMotivo] = useState("");
  const [afetadas, setAfetadas] = useState<Reserva[] | null>(null);

  async function bloquear(e: React.FormEvent) {
    e.preventDefault();
    setAfetadas(null);
    if (!motivo.trim()) {
      setErro("Escreva o motivo do bloqueio (ex.: manutenção do piso).");
      return;
    }
    const res = await executar("bloquear", () => bloquearHorario({ recursoId, data, inicio, fim, motivo }));
    if (res) {
      setAfetadas(res.dados.reservasAfetadas);
      setMotivo("");
    }
  }

  return (
    <form onSubmit={bloquear} noValidate className="quadro grid gap-5 p-5">
      <h2 className="titulo t-4">Bloquear horário</h2>
      {erro && (
        <p role="alert" className="aviso aviso-erro">
          {erro}
        </p>
      )}
      {afetadas && (
        <div role="status" className={`aviso ${afetadas.length ? "aviso-erro" : "aviso-ok"}`}>
          {afetadas.length === 0 ? (
            <p>Horário bloqueado. Nenhuma reserva foi afetada.</p>
          ) : (
            <>
              <p className="font-semibold">Horário bloqueado. Estas reservas estão dentro do bloqueio:</p>
              <ul className="mt-2 grid gap-1 text-sm">
                {afetadas.map((r) => (
                  <li key={r.id}>
                    {r.codigo}, {r.cliente.nome}: {r.itens.map((i) => `${formatarHora(i.intervalo.inicio)} às ${formatarHora(i.intervalo.fim)}`).join(", ")}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-giz">Avise os clientes ou cancele as reservas pela agenda do dia.</p>
            </>
          )}
        </div>
      )}
      <Campo id="bloq-recurso" rotulo="Espaço">
        <select id="bloq-recurso" className="entrada" value={recursoId} onChange={(e) => setRecursoId(e.target.value as RecursoId | "todos")}>
          <option value="todos">{nomeRecurso("todos")}</option>
          {(Object.keys(RECURSOS) as RecursoId[]).map((id) => (
            <option key={id} value={id}>
              {RECURSOS[id].nome}
            </option>
          ))}
        </select>
      </Campo>
      <div className="grid grid-cols-3 gap-3">
        <Campo id="bloq-data" rotulo="Data">
          <input id="bloq-data" type="date" className="entrada dado px-2" value={data} onChange={(e) => setData(e.target.value)} />
        </Campo>
        <Campo id="bloq-inicio" rotulo="De">
          <input id="bloq-inicio" type="time" step={1800} className="entrada dado px-2" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </Campo>
        <Campo id="bloq-fim" rotulo="Até">
          <input id="bloq-fim" type="time" step={1800} className="entrada dado px-2" value={fim} onChange={(e) => setFim(e.target.value)} />
        </Campo>
      </div>
      <Campo id="bloq-motivo" rotulo="Motivo">
        <input id="bloq-motivo" className="entrada" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: manutenção do piso" />
      </Campo>
      <div>
        <button type="submit" className="btn btn-neon btn-pequeno" disabled={pendente !== null} aria-busy={pendente !== null || undefined}>
          {pendente && <Carregando />}
          Bloquear
        </button>
      </div>
    </form>
  );
}

export function ItemBloqueio({ bloqueio: b }: { bloqueio: Bloqueio }) {
  const { executar, pendente, erro } = useAcao();
  return (
    <li className="quadro flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className="font-semibold">{dataPorExtenso(b.data)}</p>
        <p className="text-sm text-giz">
          {nomeRecurso(b.recursoId)}, <span className="dado">{formatarHora(b.intervalo.inicio)} às {formatarHora(b.intervalo.fim)}</span>
        </p>
        <p className="mt-1 text-sm">{b.motivo}</p>
        {erro && (
          <p role="alert" className="mt-1 text-sm text-alerta">
            {erro}
          </p>
        )}
      </div>
      <button
        type="button"
        className="btn btn-sobrio btn-pequeno"
        disabled={pendente !== null}
        aria-busy={pendente !== null || undefined}
        onClick={() => executar("desbloquear", () => desbloquearHorario(b.id))}
      >
        {pendente && <Carregando />}
        Desbloquear
      </button>
    </li>
  );
}
