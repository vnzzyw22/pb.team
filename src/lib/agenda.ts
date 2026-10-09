import { treinosDoDia } from "./categorias";
import { POLITICA, RECURSOS, type RecursoId } from "./dados/arena";
import { ocupaHorario, type Bloqueio, type Reserva } from "./modelos";
import { orcar } from "./precos";
import {
  contem,
  diaDaSemana,
  diasEntre,
  formatarHora,
  hora,
  minutosAte,
  sobrepoe,
  type Agora,
  type DataISO,
  type Intervalo,
} from "./tempo";

/** O que a agenda precisa saber sobre um dia para decidir disponibilidade. */
export interface ContextoDia {
  data: DataISO;
  reservas: Reserva[];
  bloqueios: Bloqueio[];
  agora: Agora;
}

export type TipoOcupacao = "treino" | "reserva" | "bloqueio";

export interface Ocupacao extends Intervalo {
  tipo: TipoOcupacao;
  rotulo: string;
  /** id da reserva/bloqueio ou da turma */
  refId: string;
}

export function expedienteDoDia(recursoId: RecursoId, data: DataISO): Intervalo | null {
  const e = RECURSOS[recursoId].expediente[diaDaSemana(data)];
  return e ? { inicio: hora(e.abre), fim: hora(e.fecha) } : null;
}

/** Tudo que ocupa o recurso no dia, ordenado por horário. */
export function ocupacoes(recursoId: RecursoId, ctx: ContextoDia): Ocupacao[] {
  const lista: Ocupacao[] = [];

  if (RECURSOS[recursoId].bloqueadoPorTreinos) {
    for (const t of treinosDoDia(diaDaSemana(ctx.data))) {
      lista.push({ inicio: t.inicio, fim: t.fim, tipo: "treino", rotulo: `Treino ${t.categoriaNome}`, refId: t.turmaId });
    }
  }

  for (const r of ctx.reservas) {
    if (r.data !== ctx.data || !ocupaHorario(r, ctx.agora.instante)) continue;
    for (const item of r.itens) {
      if (item.recursoId !== recursoId) continue;
      lista.push({ ...item.intervalo, tipo: "reserva", rotulo: r.cliente.nome, refId: r.id });
    }
  }

  for (const b of ctx.bloqueios) {
    if (b.data !== ctx.data || (b.recursoId !== "todos" && b.recursoId !== recursoId)) continue;
    lista.push({ ...b.intervalo, tipo: "bloqueio", rotulo: b.motivo, refId: b.id });
  }

  return lista.sort((a, b) => a.inicio - b.inicio);
}

export type ErroHorario =
  | "recurso_inativo"
  | "fechado"
  | "fora_do_expediente"
  | "duracao_invalida"
  | "inicio_fora_da_grade"
  | "antecedencia_minima"
  | "alem_da_janela"
  | "no_passado"
  | "conflito";

export interface OpcoesValidacao {
  /** Reservas feitas pelo painel ignoram antecedência, janela e durações do site. */
  peloPainel?: boolean;
  /** Ignora esta reserva ao checar conflitos (edição/remarcação). */
  ignorarReservaId?: string;
}

export interface ResultadoValidacao {
  ok: boolean;
  erros: ErroHorario[];
  conflitos: Ocupacao[];
}

/** Verifica se o recurso pode ser reservado no intervalo. */
export function validarHorario(
  recursoId: RecursoId,
  intervalo: Intervalo,
  ctx: ContextoDia,
  opcoes: OpcoesValidacao = {},
): ResultadoValidacao {
  const recurso = RECURSOS[recursoId];
  const erros: ErroHorario[] = [];
  const duracao = intervalo.fim - intervalo.inicio;

  if (!recurso.ativo) erros.push("recurso_inativo");

  const expediente = expedienteDoDia(recursoId, ctx.data);
  if (!expediente) erros.push("fechado");
  else if (!contem(expediente, intervalo)) erros.push("fora_do_expediente");

  if (duracao <= 0 || (!opcoes.peloPainel && !recurso.duracoes.includes(duracao))) {
    erros.push("duracao_invalida");
  }
  if (!opcoes.peloPainel && intervalo.inicio % recurso.passo !== 0) erros.push("inicio_fora_da_grade");

  const faltam = minutosAte(ctx.agora, ctx.data, intervalo.inicio);
  if (faltam < 0) erros.push("no_passado");
  else if (!opcoes.peloPainel && faltam < POLITICA.antecedenciaMinimaMin) erros.push("antecedencia_minima");
  if (!opcoes.peloPainel && diasEntre(ctx.agora.data, ctx.data) > POLITICA.janelaMaximaDias) {
    erros.push("alem_da_janela");
  }

  const conflitos = ocupacoes(recursoId, ctx).filter(
    (o) => sobrepoe(o, intervalo) && !(o.tipo === "reserva" && o.refId === opcoes.ignorarReservaId),
  );
  if (conflitos.length) erros.push("conflito");

  return { ok: erros.length === 0, erros, conflitos };
}

export interface HorarioLivre extends Intervalo {
  /** "19:00" */
  rotulo: string;
  /** Total em centavos para essa duração nesse horário. */
  preco: number;
}

/** Horários de início livres para uma duração — o que o cliente vê no site. */
export function horariosDisponiveis(recursoId: RecursoId, duracao: number, ctx: ContextoDia): HorarioLivre[] {
  const recurso = RECURSOS[recursoId];
  const expediente = expedienteDoDia(recursoId, ctx.data);
  if (!expediente || !recurso.ativo || !recurso.duracoes.includes(duracao)) return [];

  const livres: HorarioLivre[] = [];
  const primeiro = Math.ceil(expediente.inicio / recurso.passo) * recurso.passo;
  for (let inicio = primeiro; inicio + duracao <= expediente.fim; inicio += recurso.passo) {
    const intervalo = { inicio, fim: inicio + duracao };
    if (!validarHorario(recursoId, intervalo, ctx).ok) continue;
    livres.push({ ...intervalo, rotulo: formatarHora(inicio), preco: orcar(ctx.data, [{ recursoId, intervalo }]).total });
  }
  return livres;
}

export interface Segmento extends Intervalo {
  tipo: TipoOcupacao | "livre";
  rotulo: string;
  refId?: string;
}

/** Linha do tempo completa do dia (livre + ocupado), para o painel. */
export function gradeDoDia(recursoId: RecursoId, ctx: ContextoDia): Segmento[] {
  const expediente = expedienteDoDia(recursoId, ctx.data);
  if (!expediente) return [];

  const segmentos: Segmento[] = [];
  let cursor = expediente.inicio;
  for (const o of ocupacoes(recursoId, ctx)) {
    // ocupações sobrepostas (ex.: bloqueio sobre um treino) não se repetem
    const ini = Math.max(o.inicio, expediente.inicio, cursor);
    const fim = Math.min(o.fim, expediente.fim);
    if (fim <= ini) continue;
    if (ini > cursor) segmentos.push({ inicio: cursor, fim: ini, tipo: "livre", rotulo: "Livre" });
    segmentos.push({ inicio: ini, fim, tipo: o.tipo, rotulo: o.rotulo, refId: o.refId });
    cursor = Math.max(cursor, fim);
  }
  if (cursor < expediente.fim) segmentos.push({ inicio: cursor, fim: expediente.fim, tipo: "livre", rotulo: "Livre" });
  return segmentos;
}
