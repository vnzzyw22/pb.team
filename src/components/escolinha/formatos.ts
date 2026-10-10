import { anosDeNascimento, CATEGORIAS, type Categoria } from "@/lib";

/** "2019", "2017 e 2018" ou "2020 a 2022": anos de nascimento atendidos na temporada. */
export function faixaDeAnos(categoria: Categoria, temporada?: number): string {
  const anos = anosDeNascimento(categoria, temporada);
  const menor = Math.min(...anos);
  const maior = Math.max(...anos);
  if (menor === maior) return `${menor}`;
  return maior - menor === 1 ? `${menor} e ${maior}` : `${menor} a ${maior}`;
}

/** "Nascidos em 2019", "Nascidos em 2017 e 2018", "Nascidos de 2020 a 2022". */
export function textoNascidos(categoria: Categoria, temporada?: number): string {
  const faixa = faixaDeAnos(categoria, temporada);
  return faixa.includes(" a ") ? `Nascidos de ${faixa}` : `Nascidos em ${faixa}`;
}

/** "do Baby ao Sub-17" */
export function faixaDeCategorias(): { primeira: string; ultima: string } {
  return { primeira: CATEGORIAS[0].nome, ultima: CATEGORIAS[CATEGORIAS.length - 1].nome };
}
