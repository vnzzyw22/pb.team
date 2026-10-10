import {
  agoraEmMaringa,
  diaDaSemana,
  expedienteDoDia,
  formatarData,
  formatarHoraCurta,
  hora,
  NOMES_DIAS,
  NOMES_DIAS_CURTOS,
  POLITICA,
  RECURSOS,
  somarDias,
  type DataISO,
  type DiaSemana,
  type ErroSolicitacao,
  type RecursoId,
  type StatusReserva,
} from "@/lib";

/** Segunda primeiro, domingo por último, como no calendário do clube. */
const ORDEM_SEMANA: DiaSemana[] = [1, 2, 3, 4, 5, 6, 0];

/** [1,2,3,4,5] → "Seg a Sex"; [0,6] → "Sáb e Dom"; [2,4] → "Ter e Qui". */
export function formatarDias(dias: readonly DiaSemana[]): string {
  const ordenados = ORDEM_SEMANA.filter((d) => dias.includes(d));
  const posicoes = ordenados.map((d) => ORDEM_SEMANA.indexOf(d));
  const seguidos = posicoes.every((p, i) => i === 0 || p === posicoes[i - 1] + 1);
  const nomes = ordenados.map((d) => NOMES_DIAS_CURTOS[d]);
  if (seguidos && nomes.length >= 3) return `${nomes[0]} a ${nomes[nomes.length - 1]}`;
  return nomes.length > 1 ? `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}` : nomes[0];
}

/** "08:00"–"17:00" → "8h às 17h"; "00:00"–"24:00" → "o dia todo" */
export function faixaDeHoras(inicio: string, fim: string): string {
  if (hora(inicio) === 0 && hora(fim) === 24 * 60) return "o dia todo";
  return `${formatarHoraCurta(hora(inicio))} às ${formatarHoraCurta(hora(fim))}`;
}

/** 90 → "1h30" */
export function formatarDuracao(minutos: number): string {
  return formatarHoraCurta(minutos);
}

/** Expediente agrupado: [{ dias: "Seg a Sáb", horas: "8h às 23h" }, { dias: "Dom", horas: "8h às 20h" }]. */
export function expedienteResumido(recursoId: RecursoId): { dias: string; horas: string }[] {
  const grupos: { dias: DiaSemana[]; horas: string }[] = [];
  for (const d of ORDEM_SEMANA) {
    const e = RECURSOS[recursoId].expediente[d];
    const horas = e ? faixaDeHoras(e.abre, e.fecha) : "Fechado";
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.horas === horas) ultimo.dias.push(d);
    else grupos.push({ dias: [d], horas });
  }
  return grupos.map((g) => ({ dias: formatarDias(g.dias), horas: g.horas }));
}

export interface DiaReservavel {
  data: DataISO;
  rotuloCurto: string;
  diaMes: string;
  nomeCompleto: string;
  aberto: boolean;
}

/** Próximos `quantos` dias a partir de hoje em Maringá. */
export function proximosDias(quantos: number, recursoId: RecursoId = "quadra"): DiaReservavel[] {
  const hoje = agoraEmMaringa().data;
  return Array.from({ length: quantos }, (_, i) => {
    const data = somarDias(hoje, i);
    const dia = diaDaSemana(data);
    const [, mes, d] = data.split("-");
    return {
      data,
      rotuloCurto: i === 0 ? "Hoje" : i === 1 ? "Amanhã" : NOMES_DIAS_CURTOS[dia],
      diaMes: `${d}/${mes}`,
      nomeCompleto: `${NOMES_DIAS[dia]}, ${formatarData(data)}`,
      aberto: expedienteDoDia(recursoId, data) !== null,
    };
  });
}

/** "Sábado, 11/10/2026" */
export function dataPorExtenso(data: DataISO): string {
  return `${NOMES_DIAS[diaDaSemana(data)]}, ${formatarData(data)}`;
}

/** Textos para todos os códigos de erro da reserva (site e painel). */
export const MENSAGENS_ERRO_RESERVA: Record<ErroSolicitacao, string> = {
  recurso_inativo: "Esse espaço não está recebendo reservas agora.",
  fechado: "A Arena não abre nesse dia. Escolha outra data.",
  fora_do_expediente: "Esse horário passa do horário de funcionamento da Arena.",
  duracao_invalida: "Escolha uma das durações disponíveis.",
  inicio_fora_da_grade: "Escolha um dos horários da lista.",
  antecedencia_minima: `Pelo site, as reservas precisam de pelo menos ${formatarHoraCurta(POLITICA.antecedenciaMinimaMin)} de antecedência. Escolha um horário mais tarde.`,
  alem_da_janela: `Dá para reservar com até ${POLITICA.janelaMaximaDias} dias de antecedência.`,
  no_passado: "Esse horário já passou. Escolha outro.",
  conflito: "Esse horário acabou de ser ocupado. Escolha outro horário livre.",
  data_invalida: "Escolha um dia válido.",
  horario_invalido: "Escolha um horário da lista.",
  nome_invalido: "Escreva seu nome completo.",
  telefone_invalido: "Confira o WhatsApp com DDD, por exemplo (44) 99999-9999.",
  combo_indisponivel: "A churrasqueira não está livre nesse horário. Reserve só a quadra ou escolha outro horário.",
};

export const ROTULOS_STATUS: Record<StatusReserva, string> = {
  aguardando_sinal: "Aguardando o sinal",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  expirada: "Expirada: o prazo do sinal acabou",
  concluida: "Concluída",
  nao_compareceu: "Não compareceu",
};
