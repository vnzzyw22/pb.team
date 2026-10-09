"use server";

/**
 * Server Actions do site público. Podem ser chamadas direto de componentes
 * cliente: `const horarios = await buscarHorarios("quadra", "2026-10-16", 60)`.
 * Toda entrada vem do navegador, então é tratada como não confiável.
 */

import {
  RECURSOS,
  registrarAulaExperimental,
  type EntradaAulaExperimental,
  type EntradaReserva,
  type HorarioLivre,
  type RecursoId,
  type ResultadoLead,
  type ResultadoSolicitacao,
  type StatusReserva,
} from "@/lib";
import { obterContexto } from "../contexto";

const texto = (v: unknown, max = 120) => (typeof v === "string" ? v.slice(0, max) : "");
const inteiro = (v: unknown) => (typeof v === "number" && Number.isInteger(v) ? v : NaN);
const recurso = (v: unknown): RecursoId | null => (typeof v === "string" && v in RECURSOS ? (v as RecursoId) : null);

/** Horários livres para o cliente escolher (já com o preço de cada um). */
export async function buscarHorarios(recursoId: RecursoId, data: string, duracao: number): Promise<HorarioLivre[]> {
  const r = recurso(recursoId);
  if (!r) return [];
  const { servico } = await obterContexto();
  return servico.disponibilidade(r, texto(data, 10), inteiro(duracao));
}

/**
 * Pede a reserva: segura o horário aguardando o sinal e devolve o Pix copia e
 * cola (quando configurado) e o link de WhatsApp para enviar o comprovante.
 */
export async function pedirReserva(entrada: EntradaReserva): Promise<ResultadoSolicitacao> {
  const r = recurso(entrada?.recursoId);
  if (!r) return { ok: false, erros: ["horario_invalido"], conflitos: [] };
  const { servico } = await obterContexto();
  return servico.solicitar({
    data: texto(entrada.data, 10),
    recursoId: r,
    inicio: texto(entrada.inicio, 5),
    duracao: inteiro(entrada.duracao),
    comChurrasqueira: entrada.comChurrasqueira === true,
    cliente: { nome: texto(entrada.cliente?.nome, 80), telefone: texto(entrada.cliente?.telefone, 30) },
    observacoes: texto(entrada.observacoes, 500) || undefined,
  });
}

/** Registra o pedido de aula experimental e devolve o link do WhatsApp. */
export async function pedirAulaExperimental(entrada: EntradaAulaExperimental): Promise<ResultadoLead> {
  const { repo } = await obterContexto();
  return registrarAulaExperimental(repo, {
    responsavel: texto(entrada?.responsavel, 80),
    telefone: texto(entrada?.telefone, 30),
    atleta: texto(entrada?.atleta, 80),
    anoNascimento: inteiro(entrada?.anoNascimento),
    turmaId: texto(entrada?.turmaId, 40) || undefined,
    observacoes: texto(entrada?.observacoes, 500) || undefined,
  });
}

export interface ReservaPublica {
  codigo: string;
  status: StatusReserva;
  data: string;
  itens: { recurso: string; inicio: number; fim: number }[];
  total: number;
  sinal: number;
  valorPago: number;
  /** epoch ms — prazo do sinal, quando aguardando */
  expiraEm?: number;
  /** Só o primeiro nome, para não expor dados pessoais. */
  primeiroNome: string;
}

/** O cliente acompanha a reserva pelo código (ex.: "PB-7K3Q"). */
export async function consultarReserva(codigo: string): Promise<ReservaPublica | null> {
  const c = texto(codigo, 10).trim().toUpperCase();
  if (!/^PB-[A-Z0-9]{4}$/.test(c)) return null;
  const { repo } = await obterContexto();
  const r = await repo.reservaPorCodigo(c);
  if (!r) return null;
  return {
    codigo: r.codigo,
    status: r.status === "aguardando_sinal" && r.expiraEm !== undefined && r.expiraEm <= Date.now() ? "expirada" : r.status,
    data: r.data,
    itens: r.itens.map((i) => ({ recurso: RECURSOS[i.recursoId].nome, inicio: i.intervalo.inicio, fim: i.intervalo.fim })),
    total: r.orcamento.total,
    sinal: r.orcamento.sinal,
    valorPago: r.valorPago,
    expiraEm: r.expiraEm,
    primeiroNome: r.cliente.nome.split(" ")[0],
  };
}
