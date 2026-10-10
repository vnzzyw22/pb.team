import { diaDaSemana, somarDias, type DataISO, type OrigemReserva, type StatusLead } from "@/lib";

/** "150,00", "150" ou "R$ 1.250,50" → centavos; null se não for um valor. */
export function paraCentavos(texto: string): number | null {
  const limpo = texto.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  if (!limpo) return null;
  const valor = Number(limpo);
  return Number.isFinite(valor) && valor > 0 ? Math.round(valor * 100) : null;
}

/** 15000 → "150,00" (para preencher campos de valor). */
export function centavosParaCampo(centavos: number): string {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

export const ROTULOS_ORIGEM: Record<OrigemReserva, string> = {
  site: "Site",
  admin: "Painel",
  mensalista: "Mensalista",
};

export const ETAPAS_FUNIL: { status: StatusLead; rotulo: string }[] = [
  { status: "novo", rotulo: "Novos" },
  { status: "contatado", rotulo: "Contatados" },
  { status: "aula_agendada", rotulo: "Aula agendada" },
  { status: "matriculado", rotulo: "Matriculados" },
  { status: "desistiu", rotulo: "Desistiram" },
];

export const ROTULO_STATUS_LEAD: Record<StatusLead, string> = {
  novo: "Novo",
  contatado: "Contatado",
  aula_agendada: "Aula agendada",
  matriculado: "Matriculado",
  desistiu: "Desistiu",
};

/** Texto amigável para as respostas `{ ok: false, erro, mensagem }` do painel. */
export function textoDoErro(erro: string, mensagem: string): string {
  switch (erro) {
    case "nao_encontrada":
      return "Reserva não encontrada. Atualize a página.";
    case "status_invalido":
      return "Essa ação não vale para a situação atual da reserva. Atualize a página.";
    case "horario_ocupado":
      return "O horário foi ocupado por outra reserva depois que a pré-reserva expirou.";
    case "valor_invalido":
      return "Informe um valor maior que zero.";
    case "serie_nao_encontrada":
      return "Mensalista não encontrado. Atualize a página.";
    case "entrada_invalida":
      return mensagem.startsWith("Não é possível mudar") ? "Essa mudança de etapa não é permitida no funil." : `${mensagem}.`;
    default:
      return mensagem || "Não foi possível concluir.";
  }
}

/** Segunda-feira da semana de `data`. */
export function segundaDaSemana(data: DataISO): DataISO {
  return somarDias(data, -((diaDaSemana(data) + 6) % 7));
}
