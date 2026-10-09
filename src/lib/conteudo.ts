import { CLUBE, type CampoAConfirmar, type Patrocinador, type Resultado } from "./dados/clube";

/**
 * Versões "publicáveis" do conteúdo: só o que está confirmado.
 * A interface deve usar estas funções em vez de ler CLUBE.historico,
 * CLUBE.torneiosDisputados e CLUBE.patrocinadores diretamente.
 */

export interface ResultadoPublico {
  ano?: number;
  competicao: string;
  categoria?: string;
  colocacao: string;
  titulo: boolean;
  fotoId?: string;
}

/** Linha do tempo sem campos pendentes; resultados com colocação pendente ficam de fora. */
export function historicoPublico(historico: readonly Resultado[] = CLUBE.historico): ResultadoPublico[] {
  return historico
    .filter((r) => !r.confirmar?.includes("colocacao"))
    .map((r) => {
      const pendente = (campo: CampoAConfirmar) => r.confirmar?.includes(campo) ?? false;
      const pub: ResultadoPublico = { competicao: r.competicao, colocacao: r.colocacao, titulo: r.titulo };
      if (r.ano !== undefined && !pendente("ano")) pub.ano = r.ano;
      if (r.categoria && !pendente("categoria")) pub.categoria = r.categoria;
      if (r.fotoId) pub.fotoId = r.fotoId;
      return pub;
    });
}

export function torneiosPublicos(): string[] {
  return CLUBE.torneiosDisputados.filter((t) => t.confirmado).map((t) => t.nome);
}

export function patrocinadoresPublicos(): Patrocinador[] {
  return CLUBE.patrocinadores.filter((p) => p.confirmado);
}

/** Tudo que ainda precisa ser confirmado com o clube no conteúdo (para a lista de perguntas). */
export function pendenciasDeConteudo(): string[] {
  const nomes: Record<CampoAConfirmar, string> = { ano: "ano", categoria: "categoria", colocacao: "colocação" };
  return [
    ...CLUBE.historico
      .filter((r) => r.confirmar?.length)
      .map((r) => `${r.competicao}: ${r.confirmar!.map((c) => nomes[c]).join(" e ")}`),
    ...CLUBE.torneiosDisputados.filter((t) => !t.confirmado).map((t) => `Torneio "${t.nome}": nome completo`),
    ...CLUBE.patrocinadores.filter((p) => !p.confirmado).map((p) => `Patrocinador ${p.nome}: vínculo com o PB Team`),
  ];
}
