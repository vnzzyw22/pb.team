/**
 * Utilitários de data e hora.
 *
 * Toda a agenda trabalha em horário local de Maringá (America/Sao_Paulo, sem
 * horário de verão desde 2019). Para evitar armadilhas de fuso, datas são
 * strings "AAAA-MM-DD" e horários são minutos desde a meia-noite.
 */

export const FUSO = "America/Sao_Paulo";

/** "AAAA-MM-DD" */
export type DataISO = string;

/** 0 = domingo … 6 = sábado (mesma convenção de Date#getDay). */
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const NOMES_DIAS: Record<DiaSemana, string> = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

export const NOMES_DIAS_CURTOS: Record<DiaSemana, string> = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

/** Intervalo semiaberto [inicio, fim) em minutos do dia. */
export interface Intervalo {
  inicio: number;
  fim: number;
}

/** "14:30" → 870 */
export function hora(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) throw new Error(`Horário inválido: "${hhmm}"`);
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 24 || min > 59 || (h === 24 && min > 0)) {
    throw new Error(`Horário inválido: "${hhmm}"`);
  }
  return h * 60 + min;
}

/** 870 → "14:30" */
export function formatarHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** 870 → "14h30", 1140 → "19h" (formato usado nas artes do clube). */
export function formatarHoraCurta(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

export function validarData(data: string): data is DataISO {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const d = new Date(`${data}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === data;
}

function paraUTC(data: DataISO): Date {
  if (!validarData(data)) throw new Error(`Data inválida: "${data}"`);
  return new Date(`${data}T00:00:00Z`);
}

export function diaDaSemana(data: DataISO): DiaSemana {
  return paraUTC(data).getUTCDay() as DiaSemana;
}

export function somarDias(data: DataISO, dias: number): DataISO {
  const d = paraUTC(data);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Diferença em dias inteiros (b - a). */
export function diasEntre(a: DataISO, b: DataISO): number {
  return Math.round((paraUTC(b).getTime() - paraUTC(a).getTime()) / 86_400_000);
}

/** "2026-10-09" → "09/10/2026" */
export function formatarData(data: DataISO): string {
  const [a, m, d] = data.split("-");
  return `${d}/${m}/${a}`;
}

export function sobrepoe(a: Intervalo, b: Intervalo): boolean {
  return a.inicio < b.fim && b.inicio < a.fim;
}

export function contem(externo: Intervalo, interno: Intervalo): boolean {
  return externo.inicio <= interno.inicio && interno.fim <= externo.fim;
}

/** Momento presente em Maringá, como data local + minutos do dia. */
export interface Agora {
  data: DataISO;
  minutos: number;
  /** epoch em ms, útil para expirar pré-reservas */
  instante: number;
}

export function agoraEmMaringa(instante: Date = new Date()): Agora {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instante);
  const v = (t: string) => partes.find((p) => p.type === t)!.value;
  return {
    data: `${v("year")}-${v("month")}-${v("day")}`,
    minutos: Number(v("hour")) * 60 + Number(v("minute")),
    instante: instante.getTime(),
  };
}

/** Compara (data, minutos) com o momento atual: >0 futuro, <0 passado. */
export function minutosAte(agora: Agora, data: DataISO, minutos: number): number {
  return diasEntre(agora.data, data) * 1440 + (minutos - agora.minutos);
}
