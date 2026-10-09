import { POLITICA, RECURSOS, type RecursoId } from "./dados/arena";
import { diaDaSemana, hora, type DataISO, type Intervalo } from "./tempo";

export interface ItemPreco {
  rotulo: string;
  minutos: number;
  valor: number;
}

export interface Orcamento {
  itens: ItemPreco[];
  subtotal: number;
  desconto: number;
  total: number;
  sinal: number;
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** 16000 → "R$ 160,00" */
export function formatarMoeda(centavos: number): string {
  return moeda.format(centavos / 100).replace(/ /g, " ");
}

/** Sinal arredondado para cima em reais inteiros. */
export function calcularSinal(total: number, percentual: number = POLITICA.sinalPercentual): number {
  return Math.ceil((total * percentual) / 100 / 100) * 100;
}

/** Preço de uso de um recurso num intervalo, separado por faixa de preço. */
export function precoDoRecurso(recursoId: RecursoId, data: DataISO, intervalo: Intervalo): ItemPreco[] {
  const recurso = RECURSOS[recursoId];
  const tabela = recurso.preco;
  const minutosTotais = intervalo.fim - intervalo.inicio;
  if (minutosTotais <= 0) throw new Error("Intervalo vazio");

  if (tabela.tipo === "fixo") {
    return [{ rotulo: `${recurso.nome} · ${tabela.rotulo}`, minutos: minutosTotais, valor: tabela.valor }];
  }

  const dia = diaDaSemana(data);
  const itens: ItemPreco[] = [];
  let cobertos = 0;
  for (const faixa of tabela.faixas) {
    if (!faixa.dias.includes(dia)) continue;
    const ini = Math.max(intervalo.inicio, hora(faixa.inicio));
    const fim = Math.min(intervalo.fim, hora(faixa.fim));
    if (fim <= ini) continue;
    const minutos = fim - ini;
    cobertos += minutos;
    itens.push({
      rotulo: `${recurso.nome} · ${faixa.rotulo}`,
      minutos,
      valor: Math.round((faixa.valorHora * minutos) / 60),
    });
  }
  if (cobertos !== minutosTotais) {
    throw new Error(`Tabela de preços de "${recurso.nome}" não cobre todo o horário solicitado`);
  }
  return itens;
}

export interface ItemReserva {
  recursoId: RecursoId;
  intervalo: Intervalo;
}

/** Orçamento de uma reserva (um ou mais recursos no mesmo dia). */
export function orcar(data: DataISO, itens: ItemReserva[]): Orcamento {
  const linhas = itens.flatMap((i) => precoDoRecurso(i.recursoId, data, i.intervalo));
  const subtotal = linhas.reduce((s, l) => s + l.valor, 0);
  const ehCombo =
    itens.some((i) => i.recursoId === "quadra") && itens.some((i) => i.recursoId === "churrasqueira");
  const desconto = ehCombo ? Math.round((subtotal * POLITICA.descontoComboPercentual) / 100) : 0;
  const total = subtotal - desconto;
  return { itens: linhas, subtotal, desconto, total, sinal: calcularSinal(total) };
}
