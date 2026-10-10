"use client";

import { useState } from "react";
import {
  formatarData,
  formatarHora,
  formatarMoeda,
  formatarTelefone,
  NOMES_DIAS,
  normalizarTelefone,
  RECURSOS,
  type DiaSemana,
  type RecursoId,
  type Serie,
} from "@/lib";
import { criarMensalista, encerrarMensalista } from "@/server/acoes/painel";
import { formatarDuracao } from "@/components/arena/formatos";
import { Carregando } from "@/components/grafismos";
import { Campo } from "@/components/ui/Campo";
import { paraCentavos } from "./formatos";
import { useAcao } from "./useAcao";

const DIAS: DiaSemana[] = [1, 2, 3, 4, 5, 6, 0];
const DURACOES = [60, 90, 120, 150, 180];

export function FormMensalista({ hoje }: { hoje: string }) {
  const { executar, pendente, erro, setErro } = useAcao();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [recursoId, setRecursoId] = useState<RecursoId>("quadra");
  const [diaSemana, setDiaSemana] = useState<DiaSemana>(1);
  const [inicio, setInicio] = useState("21:00");
  const [duracao, setDuracao] = useState(60);
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState("");
  const [valor, setValor] = useState("");
  const [resultado, setResultado] = useState<{ criadas: number; conflitos: string[] } | null>(null);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setResultado(null);
    if (nome.trim().length < 3 || !normalizarTelefone(telefone)) {
      setErro("Confira o nome (completo) e o WhatsApp com DDD do mensalista.");
      return;
    }
    const valorPorOcorrencia = valor ? paraCentavos(valor) : undefined;
    if (valorPorOcorrencia === null) {
      setErro("Valor por jogo inválido. Use, por exemplo, 140,00.");
      return;
    }
    const res = await executar("criar", () =>
      criarMensalista({
        cliente: { nome, telefone },
        recursoId,
        diaSemana,
        inicio,
        duracao,
        dataInicio,
        dataFim: dataFim || undefined,
        valorPorOcorrencia,
      }),
    );
    if (res) {
      setResultado({ criadas: res.dados.criadas.length, conflitos: res.dados.conflitos });
      setNome("");
      setTelefone("");
      setValor("");
    }
  }

  return (
    <form onSubmit={criar} noValidate className="quadro grid gap-5 p-5">
      <h2 className="titulo t-4">Novo mensalista</h2>
      {erro && (
        <p role="alert" className="aviso aviso-erro">
          {erro}
        </p>
      )}
      {resultado && (
        <div role="status" className={`aviso ${resultado.conflitos.length ? "aviso-erro" : "aviso-ok"}`}>
          <p>
            Mensalista criado. {resultado.criadas} {resultado.criadas === 1 ? "jogo lançado" : "jogos lançados"} na agenda.
          </p>
          {resultado.conflitos.length > 0 && (
            <p className="mt-1 text-sm">
              Datas com conflito, que ficaram de fora: {resultado.conflitos.map((d) => formatarData(d)).join(", ")}.
            </p>
          )}
        </div>
      )}
      <Campo id="mens-nome" rotulo="Nome do responsável">
        <input id="mens-nome" className="entrada" value={nome} onChange={(e) => setNome(e.target.value)} />
      </Campo>
      <Campo id="mens-telefone" rotulo="WhatsApp">
        <input id="mens-telefone" type="tel" inputMode="tel" className="entrada dado" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo id="mens-dia" rotulo="Dia da semana">
          <select id="mens-dia" className="entrada" value={diaSemana} onChange={(e) => setDiaSemana(Number(e.target.value) as DiaSemana)}>
            {DIAS.map((d) => (
              <option key={d} value={d}>
                {NOMES_DIAS[d]}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="mens-recurso" rotulo="Espaço">
          <select id="mens-recurso" className="entrada" value={recursoId} onChange={(e) => setRecursoId(e.target.value as RecursoId)}>
            {(Object.keys(RECURSOS) as RecursoId[]).map((id) => (
              <option key={id} value={id}>
                {RECURSOS[id].nome}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="mens-inicio" rotulo="Início">
          <input id="mens-inicio" type="time" step={1800} className="entrada dado" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </Campo>
        <Campo id="mens-duracao" rotulo="Duração">
          <select id="mens-duracao" className="entrada" value={duracao} onChange={(e) => setDuracao(Number(e.target.value))}>
            {DURACOES.map((m) => (
              <option key={m} value={m}>
                {formatarDuracao(m)}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="mens-desde" rotulo="A partir de">
          <input id="mens-desde" type="date" className="entrada dado px-2" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </Campo>
        <Campo id="mens-ate" rotulo="Até" opcional>
          <input id="mens-ate" type="date" className="entrada dado px-2" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </Campo>
      </div>
      <Campo id="mens-valor" rotulo="Valor por jogo (R$)" opcional ajuda="Deixe em branco para usar a tabela de preços.">
        <input id="mens-valor" inputMode="decimal" className="entrada dado" value={valor} onChange={(e) => setValor(e.target.value)} />
      </Campo>
      <div>
        <button type="submit" className="btn btn-neon btn-pequeno" disabled={pendente !== null} aria-busy={pendente !== null || undefined}>
          {pendente && <Carregando />}
          Criar mensalista
        </button>
      </div>
    </form>
  );
}

export function ItemMensalista({ serie: s, hoje }: { serie: Serie; hoje: string }) {
  const { executar, pendente, erro } = useAcao();
  const [encerrando, setEncerrando] = useState(false);
  const [aPartirDe, setAPartirDe] = useState(hoje);
  const [cancelados, setCancelados] = useState<number | null>(null);

  return (
    <li className={`quadro p-4 ${s.ativa ? "" : "opacity-60"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{s.cliente.nome}</p>
          <p className="text-sm text-giz">
            {NOMES_DIAS[s.diaSemana]}, <span className="dado">{formatarHora(s.intervalo.inicio)} às {formatarHora(s.intervalo.fim)}</span>,{" "}
            {RECURSOS[s.recursoId].nome.toLowerCase()}
          </p>
          <p className="mt-1 text-sm text-giz">
            Desde {formatarData(s.dataInicio)}
            {s.dataFim && ` até ${formatarData(s.dataFim)}`}
            {s.valorPorOcorrencia !== undefined && `, ${formatarMoeda(s.valorPorOcorrencia)} por jogo`}
            {" · "}
            <span className="dado">{formatarTelefone(s.cliente.telefone)}</span>
          </p>
        </div>
        <span className={`border px-2 py-0.5 text-sm font-semibold ${s.ativa ? "border-branco" : "border-linha-forte text-giz"}`}>
          {s.ativa ? "Ativo" : "Encerrado"}
        </span>
      </div>
      {cancelados !== null && (
        <p role="status" className="aviso aviso-ok mt-3 text-sm">
          Mensalista encerrado. {cancelados} {cancelados === 1 ? "jogo futuro cancelado" : "jogos futuros cancelados"}.
        </p>
      )}
      {erro && (
        <p role="alert" className="aviso aviso-erro mt-3 text-sm">
          {erro}
        </p>
      )}
      {s.ativa && !encerrando && (
        <button type="button" className="btn btn-perigo btn-pequeno mt-3" onClick={() => setEncerrando(true)}>
          Encerrar
        </button>
      )}
      {s.ativa && encerrando && (
        <form
          className="mt-3 flex flex-wrap items-end gap-2 border-t border-linha pt-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await executar("encerrar", () => encerrarMensalista(s.id, aPartirDe));
            if (res) {
              setCancelados(res.dados);
              setEncerrando(false);
            }
          }}
        >
          <div>
            <label htmlFor={`encerrar-${s.id}`} className="block text-sm font-semibold">
              Cancelar jogos a partir de
            </label>
            <input
              id={`encerrar-${s.id}`}
              type="date"
              className="entrada dado mt-1.5 min-h-11 w-auto py-2"
              value={aPartirDe}
              onChange={(e) => setAPartirDe(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-perigo btn-pequeno" disabled={pendente !== null} aria-busy={pendente !== null || undefined}>
            {pendente && <Carregando />}
            Confirmar encerramento
          </button>
          <button type="button" className="btn btn-sobrio btn-pequeno" onClick={() => setEncerrando(false)}>
            Voltar
          </button>
        </form>
      )}
    </li>
  );
}
