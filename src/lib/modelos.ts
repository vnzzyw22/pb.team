import type { RecursoId } from "./dados/arena";
import type { Orcamento, ItemReserva } from "./precos";
import type { DataISO, DiaSemana, Intervalo } from "./tempo";

export type StatusReserva =
  | "aguardando_sinal" // horário segurado até `expiraEm`, aguardando o Pix do sinal
  | "confirmada"
  | "cancelada"
  | "expirada" // o sinal não chegou no prazo
  | "concluida"
  | "nao_compareceu";

export type OrigemReserva = "site" | "admin" | "mensalista";

export interface Cliente {
  nome: string;
  /** Somente dígitos, com DDI 55. */
  telefone: string;
}

export interface Reserva {
  id: string;
  /** Código curto para o cliente citar no WhatsApp, ex.: "PB-7K3Q". */
  codigo: string;
  data: DataISO;
  itens: ItemReserva[];
  cliente: Cliente;
  status: StatusReserva;
  origem: OrigemReserva;
  orcamento: Orcamento;
  /** Centavos já recebidos (sinal + restante). */
  valorPago: number;
  serieId?: string;
  observacoes?: string;
  motivoCancelamento?: string;
  /** epoch ms */
  criadaEm: number;
  atualizadaEm: number;
  /** epoch ms — só para `aguardando_sinal` */
  expiraEm?: number;
}

export interface Bloqueio {
  id: string;
  recursoId: RecursoId | "todos";
  data: DataISO;
  intervalo: Intervalo;
  motivo: string;
}

/** Turma fixa (mensalista): mesmo horário toda semana. */
export interface Serie {
  id: string;
  cliente: Cliente;
  recursoId: RecursoId;
  diaSemana: DiaSemana;
  intervalo: Intervalo;
  dataInicio: DataISO;
  /** Inclusive. Sem data = até ser encerrada. */
  dataFim?: DataISO;
  /** Valor mensal combinado, se diferente da tabela. */
  valorPorOcorrencia?: number;
  ativa: boolean;
  criadaEm: number;
}

export type StatusLead = "novo" | "contatado" | "aula_agendada" | "matriculado" | "desistiu";

/** Pedido de aula experimental. */
export interface Lead {
  id: string;
  responsavel: string;
  telefone: string;
  atleta: string;
  anoNascimento: number;
  categoriaId?: string;
  turmaId?: string;
  status: StatusLead;
  observacoes?: string;
  criadoEm: number;
}

/** Status que ocupam o horário (a pré-reserva só enquanto não expirar). */
export function ocupaHorario(r: Reserva, agoraMs: number): boolean {
  switch (r.status) {
    case "confirmada":
    case "concluida":
    case "nao_compareceu":
      return true;
    case "aguardando_sinal":
      return r.expiraEm === undefined || r.expiraEm > agoraMs;
    default:
      return false;
  }
}
