"use server";

/**
 * Server Actions do painel do dono. Todas exigem login (cookie do painel) e
 * respondem no formato `Resposta<T>`:
 *   { ok: true, dados } | { ok: false, erro, mensagem }
 */

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  agoraEmMaringa,
  atualizarStatusLead,
  diasEntre,
  ErroReserva,
  linkWhatsApp,
  mensagens,
  ocupacaoSemanal,
  ocupaHorario,
  RECURSOS,
  somarDias,
  validarData,
  type Bloqueio,
  type EntradaReserva,
  type EntradaSerie,
  type Lead,
  type OcupacaoSemana,
  type RecursoId,
  type Reserva,
  type ResultadoSolicitacao,
  type ResumoPeriodo,
  type Segmento,
  type Serie,
  type StatusLead,
} from "@/lib";
import { obterContexto, type Contexto } from "../contexto";
import { estaNoPainel } from "../painel/acesso";
import { COOKIE_PAINEL, criarToken, DURACAO_SESSAO_DIAS, senhaConfere } from "../painel/sessao";

export type Resposta<T> = { ok: true; dados: T } | { ok: false; erro: string; mensagem: string };

const MAX_DIAS_CONSULTA = 93;

async function noPainel<T>(fn: (ctx: Contexto) => Promise<T>, mutacao = false): Promise<Resposta<T>> {
  if (!(await estaNoPainel())) return { ok: false, erro: "nao_autorizado", mensagem: "Faça login no painel." };
  try {
    const dados = await fn(await obterContexto());
    if (mutacao) revalidatePath("/", "layout");
    return { ok: true, dados };
  } catch (e) {
    if (e instanceof ErroReserva) return { ok: false, erro: e.codigo, mensagem: e.message };
    if (e instanceof EntradaInvalida) return { ok: false, erro: "entrada_invalida", mensagem: e.message };
    throw e;
  }
}

class EntradaInvalida extends Error {}

function periodo(de: string, ate: string): [string, string] {
  if (!validarData(de) || !validarData(ate) || ate < de) throw new EntradaInvalida("Período inválido");
  if (diasEntre(de, ate) > MAX_DIAS_CONSULTA) throw new EntradaInvalida(`Período máximo: ${MAX_DIAS_CONSULTA} dias`);
  return [de, ate];
}

function data(d: string): string {
  if (!validarData(d)) throw new EntradaInvalida("Data inválida");
  return d;
}

// ------------------------------------------------------------------ sessão

export async function entrarNoPainel(senha: string): Promise<{ ok: boolean }> {
  if (typeof senha !== "string" || !senhaConfere(senha)) {
    await new Promise((r) => setTimeout(r, 600)); // desestimula tentativa e erro
    return { ok: false };
  }
  const jar = await cookies();
  jar.set(COOKIE_PAINEL, criarToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_SESSAO_DIAS * 86_400,
  });
  return { ok: true };
}

export async function sairDoPainel(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_PAINEL);
}

export async function infoDoSistema(): Promise<Resposta<{ modo: Contexto["modo"]; demo: boolean }>> {
  return noPainel(async (ctx) => ({ modo: ctx.modo, demo: Boolean(ctx.resetar) }));
}

// ------------------------------------------------------------------ agenda

export interface AgendaDoDia {
  data: string;
  grade: Record<RecursoId, Segmento[]>;
  reservas: Reserva[];
}

/** Linha do tempo do dia (treinos, reservas, bloqueios e horários livres) + reservas do dia. */
export async function agendaDoDia(dia: string): Promise<Resposta<AgendaDoDia>> {
  return noPainel(async ({ servico, repo }) => {
    const d = data(dia);
    const recursos = Object.keys(RECURSOS) as RecursoId[];
    const grades = await Promise.all(recursos.map((r) => servico.grade(r, d)));
    return {
      data: d,
      grade: Object.fromEntries(recursos.map((r, i) => [r, grades[i]])) as Record<RecursoId, Segmento[]>,
      reservas: await repo.reservasEntre(d, d),
    };
  });
}

export async function reservasDoPeriodo(de: string, ate: string): Promise<Resposta<Reserva[]>> {
  return noPainel(async ({ repo }) => repo.reservasEntre(...periodo(de, ate)));
}

/** Pré-reservas aguardando o Pix do sinal (ainda dentro do prazo). */
export async function pendentesDeSinal(): Promise<Resposta<Reserva[]>> {
  return noPainel(async ({ repo }) => {
    const agora = agoraEmMaringa();
    const todas = await repo.reservasEntre(agora.data, somarDias(agora.data, 90));
    return todas.filter((r) => r.status === "aguardando_sinal" && ocupaHorario(r, agora.instante));
  });
}

// ---------------------------------------------------------------- reservas

/** Reserva lançada pelo dono (telefone/balcão): já entra confirmada. */
export async function lancarReserva(entrada: EntradaReserva & { valorPago?: number }): Promise<Resposta<ResultadoSolicitacao>> {
  return noPainel(({ servico }) => servico.criarPeloPainel(entrada), true);
}

/** Confirma o Pix do sinal e devolve o link de WhatsApp com a confirmação para o cliente. */
export async function confirmarSinal(id: string, valor?: number): Promise<Resposta<{ reserva: Reserva; whatsapp: string }>> {
  return noPainel(({ servico }) => servico.confirmarSinal(id, valor), true);
}

export async function registrarPagamento(id: string, valor: number): Promise<Resposta<Reserva>> {
  return noPainel(({ servico }) => servico.registrarPagamento(id, valor), true);
}

export async function cancelarReserva(id: string, motivo = ""): Promise<Resposta<{ reserva: Reserva; devolverSinal: boolean }>> {
  return noPainel(({ servico }) => servico.cancelar(id, motivo), true);
}

export async function marcarComparecimento(id: string, compareceu: boolean): Promise<Resposta<Reserva>> {
  return noPainel(({ servico }) => servico.marcarComparecimento(id, compareceu), true);
}

/** Link de WhatsApp com o lembrete da véspera para o cliente. */
export async function linkDeLembrete(id: string): Promise<Resposta<string>> {
  return noPainel(async ({ repo }) => {
    const r = await repo.reservaPorId(id);
    if (!r) throw new ErroReserva("nao_encontrada", "Reserva não encontrada");
    return linkWhatsApp(mensagens.lembrete(r), r.cliente.telefone);
  });
}

// --------------------------------------------------------------- bloqueios

export async function bloquearHorario(b: {
  recursoId: RecursoId | "todos";
  data: string;
  inicio: string;
  fim: string;
  motivo: string;
}): Promise<Resposta<{ bloqueio: Bloqueio; reservasAfetadas: Reserva[] }>> {
  return noPainel(({ servico }) => servico.criarBloqueio(b), true);
}

export async function desbloquearHorario(id: string): Promise<Resposta<null>> {
  return noPainel(async ({ servico }) => {
    await servico.removerBloqueio(id);
    return null;
  }, true);
}

export async function listarBloqueios(de: string, ate: string): Promise<Resposta<Bloqueio[]>> {
  return noPainel(async ({ repo }) => repo.bloqueiosEntre(...periodo(de, ate)));
}

// ------------------------------------------------------------- mensalistas

export async function listarMensalistas(): Promise<Resposta<Serie[]>> {
  return noPainel(async ({ repo }) => repo.series());
}

export async function criarMensalista(
  entrada: EntradaSerie,
): Promise<Resposta<{ serie: Serie; criadas: Reserva[]; conflitos: string[] }>> {
  return noPainel(({ servico }) => servico.criarSerie(entrada), true);
}

/** Encerra o mensalista e cancela as ocorrências a partir da data. */
export async function encerrarMensalista(id: string, aPartirDe: string): Promise<Resposta<number>> {
  return noPainel(({ servico }) => servico.encerrarSerie(id, data(aPartirDe)), true);
}

// ---------------------------------------------------------------- contatos

export async function listarContatos(): Promise<Resposta<Lead[]>> {
  return noPainel(async ({ repo }) => repo.leads());
}

export async function mudarStatusContato(id: string, status: StatusLead): Promise<Resposta<Lead>> {
  return noPainel(async ({ repo }) => {
    try {
      return await atualizarStatusLead(repo, id, status);
    } catch (e) {
      throw new EntradaInvalida(e instanceof Error ? e.message : "Não foi possível atualizar");
    }
  }, true);
}

// --------------------------------------------------------------- relatórios

export async function resumoDoPeriodo(de: string, ate: string): Promise<Resposta<ResumoPeriodo>> {
  return noPainel(({ servico }) => servico.resumo(...periodo(de, ate)));
}

/** Semana típica da quadra: horas de treino × horas livres para locação. */
export async function ocupacaoDaSemana(): Promise<Resposta<OcupacaoSemana>> {
  return noPainel(async () => ocupacaoSemanal());
}

// --------------------------------------------------------------------- demo

/** Apaga tudo e recarrega os dados de exemplo. Só em modo demo. */
export async function resetarDemo(): Promise<Resposta<null>> {
  return noPainel(async (ctx) => {
    if (!ctx.resetar) throw new EntradaInvalida("Disponível só no modo demonstração");
    await ctx.resetar();
    return null;
  }, true);
}
