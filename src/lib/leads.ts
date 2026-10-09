import { categoriaPorAnoNascimento, turmaPorId } from "./categorias";
import type { Lead, StatusLead } from "./modelos";
import type { Repositorio } from "./repositorio";
import { linkWhatsApp, mensagens, normalizarTelefone } from "./whatsapp";

export interface EntradaAulaExperimental {
  responsavel: string;
  telefone: string;
  atleta: string;
  anoNascimento: number;
  /** Turma escolhida pelo responsável (opcional). */
  turmaId?: string;
  observacoes?: string;
}

export type ErroLead = "responsavel_invalido" | "atleta_invalido" | "telefone_invalido" | "fora_das_categorias" | "turma_invalida";

export type ResultadoLead =
  | { ok: true; lead: Lead; whatsapp: string }
  | { ok: false; erros: ErroLead[] };

export interface AulaExperimentalValidada {
  responsavel: string;
  /** Normalizado com DDI 55. */
  telefone: string;
  atleta: string;
  anoNascimento: number;
  categoriaId: string;
  categoriaNome: string;
  turmaId?: string;
  turmaNome?: string;
  observacoes?: string;
}

export type ResultadoValidacaoLead =
  | { ok: true; dados: AulaExperimentalValidada; whatsapp: string }
  | { ok: false; erros: ErroLead[] };

/**
 * Valida o pedido de aula experimental sem gravar nada: pode rodar no
 * navegador (validação do formulário) ou antes de abrir o WhatsApp.
 * Devolve os dados normalizados e o link do WhatsApp já preenchido.
 */
export function validarAulaExperimental(
  e: EntradaAulaExperimental,
  opcoes: { temporada?: number } = {},
): ResultadoValidacaoLead {
  const erros: ErroLead[] = [];
  const responsavel = (e.responsavel ?? "").trim().replace(/\s+/g, " ");
  const atleta = (e.atleta ?? "").trim().replace(/\s+/g, " ");
  if (responsavel.length < 3) erros.push("responsavel_invalido");
  if (atleta.length < 2) erros.push("atleta_invalido");
  const telefone = normalizarTelefone(e.telefone ?? "");
  if (!telefone) erros.push("telefone_invalido");

  const cat = categoriaPorAnoNascimento(e.anoNascimento, opcoes.temporada);
  if (!cat.ok) erros.push("fora_das_categorias");

  const escolhida = e.turmaId ? turmaPorId(e.turmaId) : undefined;
  if (e.turmaId && (!escolhida || (cat.ok && escolhida.categoria.id !== cat.categoria.id))) {
    erros.push("turma_invalida");
  }
  if (erros.length || !telefone || !cat.ok) return { ok: false, erros };

  const dados: AulaExperimentalValidada = {
    responsavel,
    telefone,
    atleta,
    anoNascimento: e.anoNascimento,
    categoriaId: cat.categoria.id,
    categoriaNome: cat.categoria.nome,
    turmaId: escolhida?.turma.id,
    turmaNome: escolhida?.turma.nome,
    observacoes: e.observacoes?.trim() || undefined,
  };
  return {
    ok: true,
    dados,
    whatsapp: linkWhatsApp(
      mensagens.aulaExperimental({
        responsavel,
        atleta,
        anoNascimento: e.anoNascimento,
        categoria: dados.categoriaNome,
        turma: dados.turmaNome,
      }),
    ),
  };
}

/**
 * Pedido de aula experimental: valida, registra o contato no painel e
 * devolve o link de WhatsApp já preenchido.
 */
export async function registrarAulaExperimental(
  repo: Repositorio,
  e: EntradaAulaExperimental,
  opcoes: { temporada?: number; agora?: Date; gerarId?: () => string } = {},
): Promise<ResultadoLead> {
  const v = validarAulaExperimental(e, opcoes);
  if (!v.ok) return v;
  const { dados } = v;
  const lead: Lead = {
    id: (opcoes.gerarId ?? (() => crypto.randomUUID()))(),
    responsavel: dados.responsavel,
    telefone: dados.telefone,
    atleta: dados.atleta,
    anoNascimento: dados.anoNascimento,
    categoriaId: dados.categoriaId,
    turmaId: dados.turmaId,
    status: "novo",
    observacoes: dados.observacoes,
    criadoEm: (opcoes.agora ?? new Date()).getTime(),
  };
  await repo.salvarLead(lead);
  return { ok: true, lead, whatsapp: v.whatsapp };
}

const TRANSICOES: Record<StatusLead, StatusLead[]> = {
  novo: ["contatado", "aula_agendada", "desistiu"],
  contatado: ["aula_agendada", "matriculado", "desistiu"],
  aula_agendada: ["matriculado", "desistiu", "contatado"],
  matriculado: [],
  desistiu: ["contatado"],
};

/** Funil no painel: novo → contatado → aula agendada → matriculado. */
export async function atualizarStatusLead(repo: Repositorio, id: string, status: StatusLead): Promise<Lead> {
  const lead = await repo.leadPorId(id);
  if (!lead) throw new Error("Contato não encontrado");
  if (!TRANSICOES[lead.status].includes(status)) {
    throw new Error(`Não é possível mudar de "${lead.status}" para "${status}"`);
  }
  lead.status = status;
  await repo.salvarLead(lead);
  return lead;
}
