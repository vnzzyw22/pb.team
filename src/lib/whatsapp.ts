import { RECURSOS } from "./dados/arena";
import { CLUBE } from "./dados/clube";
import type { Reserva } from "./modelos";
import { formatarMoeda } from "./precos";
import { diaDaSemana, formatarData, formatarHora, NOMES_DIAS } from "./tempo";

/**
 * Normaliza um telefone brasileiro para o formato do wa.me (55 + DDD + número).
 * Aceita "(44) 99944-8422", "44999448422", "+55 44 99944-8422"…
 * Retorna null se não parecer um telefone válido.
 */
export function normalizarTelefone(entrada: string): string | null {
  let d = entrada.replace(/\D/g, "");
  if (d.startsWith("0")) d = d.replace(/^0+/, "");
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99) return null;
  if (d.length === 11 && d[2] !== "9") return null; // celular tem 9 dígitos começando com 9
  return `55${d}`;
}

/** "5544999448422" → "(44) 99944-8422" */
export function formatarTelefone(normalizado: string): string {
  const d = normalizado.startsWith("55") ? normalizado.slice(2) : normalizado;
  const ddd = d.slice(0, 2);
  const num = d.slice(2);
  const meio = num.length === 9 ? 5 : 4;
  return `(${ddd}) ${num.slice(0, meio)}-${num.slice(meio)}`;
}

export function linkWhatsApp(texto: string, numero: string = CLUBE.contato.whatsapp): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

function linhasDaReserva(r: Reserva): string[] {
  const linhas = [
    `Código: ${r.codigo}`,
    `Data: ${NOMES_DIAS[diaDaSemana(r.data)]}, ${formatarData(r.data)}`,
    ...r.itens.map(
      (i) => `${RECURSOS[i.recursoId].nome}: ${formatarHora(i.intervalo.inicio)} às ${formatarHora(i.intervalo.fim)}`,
    ),
    `Total: ${formatarMoeda(r.orcamento.total)}`,
  ];
  if (r.orcamento.desconto > 0) linhas.push(`(desconto combo: ${formatarMoeda(r.orcamento.desconto)})`);
  return linhas;
}

export const mensagens = {
  /** Pai/mãe → clube, a partir da página de categorias. */
  aulaExperimental(p: {
    responsavel: string;
    atleta: string;
    anoNascimento: number;
    categoria?: string;
    turma?: string;
  }): string {
    return [
      `Olá! Gostaria de agendar uma aula experimental no ${CLUBE.nome}.`,
      ``,
      `Responsável: ${p.responsavel}`,
      `Atleta: ${p.atleta} (nascido em ${p.anoNascimento})`,
      p.categoria ? `Categoria: ${p.categoria}${p.turma ? ` · ${p.turma}` : ""}` : null,
    ]
      .filter((l) => l !== null)
      .join("\n");
  },

  /** Empresa → clube, a partir de "Sua marca dentro da Arena PB Team". */
  anuncie(p: { empresa: string; responsavel?: string; formato?: string }): string {
    return [
      `Olá, Pietro! Tenho interesse em anunciar na ${CLUBE.arena.nome}.`,
      ``,
      `Empresa: ${p.empresa}`,
      p.responsavel ? `Responsável: ${p.responsavel}` : null,
      p.formato ? `Formato de interesse: ${p.formato}` : null,
    ]
      .filter((l) => l !== null)
      .join("\n");
  },

  /** Cliente → clube, logo após pedir a reserva no site (envia o comprovante). */
  pedidoDeReserva(r: Reserva): string {
    return [
      `Olá! Fiz uma pré-reserva na ${CLUBE.arena.nome} pelo site.`,
      ``,
      ...linhasDaReserva(r),
      `Sinal: ${formatarMoeda(r.orcamento.sinal)}`,
      ``,
      `Segue o comprovante do Pix.`,
      `Nome: ${r.cliente.nome}`,
    ].join("\n");
  },

  /** Clube → cliente, ao confirmar o sinal no painel. */
  confirmacao(r: Reserva): string {
    const restante = r.orcamento.total - r.valorPago;
    return [
      `Reserva confirmada na ${CLUBE.arena.nome}! ✅`,
      ``,
      ...linhasDaReserva(r),
      restante > 0 ? `Restante a pagar no dia: ${formatarMoeda(restante)}` : `Pagamento completo.`,
      ``,
      `Até lá!`,
    ].join("\n");
  },

  /** Clube → cliente, na véspera. */
  lembrete(r: Reserva): string {
    return [
      `Lembrete: amanhã tem jogo na ${CLUBE.arena.nome}! ⚽`,
      ``,
      ...linhasDaReserva(r),
      ``,
      `Se precisar cancelar, avise com antecedência.`,
    ].join("\n");
  },
};
