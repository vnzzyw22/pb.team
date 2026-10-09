import type { DiaSemana } from "../tempo";

/**
 * Configuração da locação da Arena PB Team.
 *
 * Todos os valores abaixo são FICTÍCIOS e devem ser substituídos pelos reais
 * (horário de funcionamento, preços, política de sinal e cancelamento).
 * Valores monetários sempre em centavos.
 */

export type RecursoId = "quadra" | "churrasqueira";

export interface Expediente {
  /** "HH:MM" */
  abre: string;
  /** "HH:MM" — pode ser "24:00" */
  fecha: string;
}

export interface FaixaPreco {
  dias: DiaSemana[];
  inicio: string;
  fim: string;
  /** centavos por hora */
  valorHora: number;
  rotulo: string;
}

export type TabelaPreco =
  | { tipo: "hora"; faixas: FaixaPreco[] }
  | { tipo: "fixo"; valor: number; rotulo: string };

export interface Recurso {
  id: RecursoId;
  nome: string;
  descricao: string;
  ativo: boolean;
  /** Se true, os horários de treino da escolinha ficam indisponíveis. */
  bloqueadoPorTreinos: boolean;
  /** null = fechado no dia */
  expediente: Record<DiaSemana, Expediente | null>;
  /** Durações que o cliente pode escolher, em minutos. */
  duracoes: number[];
  /** Granularidade dos horários de início, em minutos. */
  passo: number;
  preco: TabelaPreco;
}

const TODO_DIA: Expediente = { abre: "08:00", fecha: "23:00" };
const DOMINGO: Expediente = { abre: "08:00", fecha: "20:00" };
const UTEIS: DiaSemana[] = [1, 2, 3, 4, 5];
const FIM_DE_SEMANA: DiaSemana[] = [0, 6];

export const RECURSOS: Record<RecursoId, Recurso> = {
  quadra: {
    id: "quadra",
    nome: "Quadra coberta",
    descricao: "Quadra de futsal coberta, piso esportivo, iluminação para jogos noturnos.",
    ativo: true,
    bloqueadoPorTreinos: true,
    expediente: { 0: DOMINGO, 1: TODO_DIA, 2: TODO_DIA, 3: TODO_DIA, 4: TODO_DIA, 5: TODO_DIA, 6: TODO_DIA },
    duracoes: [60, 90, 120],
    passo: 30,
    preco: {
      tipo: "hora",
      faixas: [
        { dias: UTEIS, inicio: "08:00", fim: "17:00", valorHora: 12000, rotulo: "Diurno" },
        { dias: UTEIS, inicio: "17:00", fim: "24:00", valorHora: 16000, rotulo: "Noturno" },
        { dias: FIM_DE_SEMANA, inicio: "00:00", fim: "24:00", valorHora: 15000, rotulo: "Fim de semana" },
      ],
    },
  },
  churrasqueira: {
    id: "churrasqueira",
    nome: "Churrasqueira",
    // CONFIRMAR: se existe no barracão, capacidade e o que está incluso.
    descricao: "Espaço com churrasqueira para a resenha depois do jogo.",
    ativo: true,
    bloqueadoPorTreinos: false,
    expediente: { 0: DOMINGO, 1: TODO_DIA, 2: TODO_DIA, 3: TODO_DIA, 4: TODO_DIA, 5: TODO_DIA, 6: TODO_DIA },
    duracoes: [240],
    passo: 30,
    preco: { tipo: "fixo", valor: 15000, rotulo: "Período de 4 horas" },
  },
};

export const POLITICA = {
  /** Percentual do total cobrado como sinal via Pix. */
  sinalPercentual: 50,
  /** Minutos que um horário fica "segurado" aguardando o sinal. */
  prazoSinalMin: 30,
  /** Antecedência mínima para reservar pelo site. */
  antecedenciaMinimaMin: 120,
  /** Até quantos dias à frente o site aceita reservas. */
  janelaMaximaDias: 60,
  /** Cancelamento com devolução do sinal até X horas antes. */
  cancelamentoGratuitoHoras: 24,
  /** Desconto sobre o total no combo quadra + churrasqueira. */
  descontoComboPercentual: 10,
} as const;

/** Horário nobre — usado no relatório de ocupação. */
export const HORARIO_NOBRE = {
  diasUteis: { inicio: "18:00", fim: "23:00" },
  fimDeSemana: "dia todo" as const,
};

export const PIX = {
  // CONFIRMAR: chave Pix, nome do recebedor (até 25 caracteres) e cidade.
  chave: "",
  recebedor: "PB TEAM FUTSAL",
  cidade: "MARINGA",
};
