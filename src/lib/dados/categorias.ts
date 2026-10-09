import type { DiaSemana } from "../tempo";

/**
 * Categorias e horários de treino, transcritos das artes "Horário de treino"
 * publicadas nos destaques do Instagram (@pbteamfutsal).
 *
 * Suposições a CONFIRMAR com o clube:
 * - Cada treino dura 60 minutos (DURACAO_TREINO_PADRAO).
 * - Horários em turnos diferentes na mesma categoria são turmas distintas
 *   (ex.: Sub-7 às 18h seg/qua OU às 10h ter/qui), não a mesma criança
 *   treinando todos os dias.
 * - Faixas por "idade no ano" (temporada − ano de nascimento), padrão das
 *   federações: Sub-9 em 2026 = quem completa até 9 anos em 2026.
 *   Anos sem categoria própria (8, 14 e 16) sobem para a categoria seguinte.
 */

export const DURACAO_TREINO_PADRAO = 60;

export interface SessaoTreino {
  dia: DiaSemana;
  /** "HH:MM" */
  inicio: string;
  /** minutos; padrão DURACAO_TREINO_PADRAO */
  duracao?: number;
}

export interface Turma {
  id: string;
  /** Rótulo exibido quando a categoria tem mais de uma turma. */
  nome: string;
  sessoes: SessaoTreino[];
}

export interface Categoria {
  id: string;
  nome: string;
  /** Idade no ano da temporada (inclusive). */
  idadeMin: number;
  idadeMax: number;
  turmas: Turma[];
}

const SEG = 1, TER = 2, QUA = 3, QUI = 4, SEX = 5;

export const CATEGORIAS: Categoria[] = [
  {
    id: "baby",
    nome: "Baby",
    idadeMin: 4,
    idadeMax: 6,
    turmas: [
      { id: "baby-manha", nome: "Turma manhã", sessoes: [{ dia: SEG, inicio: "10:00" }, { dia: QUA, inicio: "10:00" }] },
      { id: "baby-tarde", nome: "Turma tarde", sessoes: [{ dia: SEG, inicio: "17:00" }, { dia: QUA, inicio: "17:00" }] },
    ],
  },
  {
    id: "sub7",
    nome: "Sub-7",
    idadeMin: 7,
    idadeMax: 7,
    turmas: [
      { id: "sub7-manha", nome: "Turma manhã", sessoes: [{ dia: TER, inicio: "10:00" }, { dia: QUI, inicio: "10:00" }] },
      { id: "sub7-noite", nome: "Turma noite", sessoes: [{ dia: SEG, inicio: "18:00" }, { dia: QUA, inicio: "18:00" }] },
    ],
  },
  {
    id: "sub9",
    nome: "Sub-9",
    idadeMin: 8,
    idadeMax: 9,
    turmas: [
      { id: "sub9", nome: "Turma única", sessoes: [{ dia: SEG, inicio: "19:00" }, { dia: QUA, inicio: "19:00" }] },
    ],
  },
  {
    id: "sub10",
    nome: "Sub-10",
    idadeMin: 10,
    idadeMax: 10,
    turmas: [
      { id: "sub10-tarde", nome: "Turma tarde", sessoes: [{ dia: SEG, inicio: "14:30" }, { dia: QUA, inicio: "14:30" }] },
      { id: "sub10-noite", nome: "Turma noite", sessoes: [{ dia: TER, inicio: "19:00" }, { dia: QUI, inicio: "19:00" }] },
    ],
  },
  {
    id: "sub11",
    nome: "Sub-11",
    idadeMin: 11,
    idadeMax: 11,
    turmas: [
      {
        id: "sub11-tarde",
        nome: "Turma tarde",
        sessoes: [{ dia: TER, inicio: "15:30" }, { dia: QUI, inicio: "15:30" }, { dia: SEX, inicio: "15:30" }],
      },
      { id: "sub11-noite", nome: "Turma noite", sessoes: [{ dia: SEG, inicio: "20:00" }, { dia: QUA, inicio: "20:00" }] },
    ],
  },
  {
    id: "sub12",
    nome: "Sub-12",
    idadeMin: 12,
    idadeMax: 12,
    turmas: [
      { id: "sub12", nome: "Turma única", sessoes: [{ dia: TER, inicio: "17:00" }, { dia: QUI, inicio: "17:00" }] },
    ],
  },
  {
    id: "sub13",
    nome: "Sub-13",
    idadeMin: 13,
    idadeMax: 13,
    turmas: [
      { id: "sub13", nome: "Turma única", sessoes: [{ dia: TER, inicio: "20:00" }, { dia: QUI, inicio: "20:00" }] },
    ],
  },
  {
    id: "sub15",
    nome: "Sub-15",
    idadeMin: 14,
    idadeMax: 15,
    turmas: [
      { id: "sub15", nome: "Turma única", sessoes: [{ dia: SEG, inicio: "15:30" }, { dia: QUA, inicio: "15:30" }] },
    ],
  },
  {
    id: "sub17",
    nome: "Sub-17",
    idadeMin: 16,
    idadeMax: 17,
    turmas: [
      { id: "sub17", nome: "Turma única", sessoes: [{ dia: TER, inicio: "21:00" }, { dia: QUI, inicio: "21:00" }] },
    ],
  },
];
