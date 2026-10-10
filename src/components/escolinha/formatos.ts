import { anosDeNascimento, CATEGORIAS, type Categoria } from "@/lib";

/** "2020 a 2022" ou "2019": anos de nascimento atendidos na temporada. */
export function faixaDeAnos(categoria: Categoria, temporada?: number): string {
  const anos = anosDeNascimento(categoria, temporada);
  const menor = Math.min(...anos);
  const maior = Math.max(...anos);
  return menor === maior ? `${menor}` : `${menor} a ${maior}`;
}

/** "do Baby ao Sub-17" */
export function faixaDeCategorias(): { primeira: string; ultima: string } {
  return { primeira: CATEGORIAS[0].nome, ultima: CATEGORIAS[CATEGORIAS.length - 1].nome };
}
