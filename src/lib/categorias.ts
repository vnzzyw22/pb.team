import { CATEGORIAS, DURACAO_TREINO_PADRAO, type Categoria, type Turma } from "./dados/categorias";
import {
  agoraEmMaringa,
  formatarHoraCurta,
  hora,
  NOMES_DIAS_CURTOS,
  sobrepoe,
  type DiaSemana,
  type Intervalo,
} from "./tempo";

export type ResultadoCategoria =
  | { ok: true; categoria: Categoria; idadeNoAno: number; temporada: number }
  | { ok: false; motivo: "muito_novo" | "muito_velho" | "ano_invalido"; idadeNoAno?: number; temporada: number };

/** Temporada vigente = ano corrente em Maringá. */
export function temporadaAtual(agora = agoraEmMaringa()): number {
  return Number(agora.data.slice(0, 4));
}

/**
 * "Em que ano seu filho nasceu?" → categoria.
 * Usa a idade que o atleta completa no ano da temporada.
 */
export function categoriaPorAnoNascimento(
  anoNascimento: number,
  temporada = temporadaAtual(),
  categorias: Categoria[] = CATEGORIAS,
): ResultadoCategoria {
  if (!Number.isInteger(anoNascimento) || anoNascimento < 1900 || anoNascimento > temporada) {
    return { ok: false, motivo: "ano_invalido", temporada };
  }
  const idadeNoAno = temporada - anoNascimento;
  const categoria = categorias.find((c) => idadeNoAno >= c.idadeMin && idadeNoAno <= c.idadeMax);
  if (categoria) return { ok: true, categoria, idadeNoAno, temporada };

  const menor = Math.min(...categorias.map((c) => c.idadeMin));
  return { ok: false, motivo: idadeNoAno < menor ? "muito_novo" : "muito_velho", idadeNoAno, temporada };
}

/** Anos de nascimento atendidos por uma categoria na temporada (mais novo primeiro). */
export function anosDeNascimento(categoria: Categoria, temporada = temporadaAtual()): number[] {
  const anos: number[] = [];
  for (let idade = categoria.idadeMin; idade <= categoria.idadeMax; idade++) anos.push(temporada - idade);
  return anos;
}

export function categoriaPorId(id: string): Categoria | undefined {
  return CATEGORIAS.find((c) => c.id === id);
}

export function turmaPorId(id: string): { categoria: Categoria; turma: Turma } | undefined {
  for (const categoria of CATEGORIAS) {
    const turma = categoria.turmas.find((t) => t.id === id);
    if (turma) return { categoria, turma };
  }
  return undefined;
}

/**
 * Resumo legível dos horários de uma turma, agrupando dias com o mesmo
 * horário: "Seg e Qua · 18h", "Ter, Qui e Sex · 15h30".
 */
export function resumoHorarios(turma: Turma): string[] {
  const porHorario = new Map<string, DiaSemana[]>();
  for (const s of turma.sessoes) {
    const chave = `${s.inicio}|${s.duracao ?? DURACAO_TREINO_PADRAO}`;
    porHorario.set(chave, [...(porHorario.get(chave) ?? []), s.dia]);
  }
  return [...porHorario.entries()].map(([chave, dias]) => {
    const nomes = dias.sort((a, b) => a - b).map((d) => NOMES_DIAS_CURTOS[d]);
    const lista = nomes.length > 1 ? `${nomes.slice(0, -1).join(", ")} e ${nomes.at(-1)}` : nomes[0];
    return `${lista} · ${formatarHoraCurta(hora(chave.split("|")[0]))}`;
  });
}

export interface BlocoTreino extends Intervalo {
  categoriaId: string;
  categoriaNome: string;
  turmaId: string;
  turmaNome: string;
}

/** Treinos que ocupam a quadra num dia da semana, ordenados por horário. */
export function treinosDoDia(dia: DiaSemana, categorias: Categoria[] = CATEGORIAS): BlocoTreino[] {
  const blocos: BlocoTreino[] = [];
  for (const c of categorias) {
    for (const t of c.turmas) {
      for (const s of t.sessoes) {
        if (s.dia !== dia) continue;
        const inicio = hora(s.inicio);
        blocos.push({
          inicio,
          fim: inicio + (s.duracao ?? DURACAO_TREINO_PADRAO),
          categoriaId: c.id,
          categoriaNome: c.nome,
          turmaId: t.id,
          turmaNome: t.nome,
        });
      }
    }
  }
  return blocos.sort((a, b) => a.inicio - b.inicio);
}

/** Pares de treinos que se sobrepõem na quadra (deveria ser sempre vazio). */
export function conflitosNaGrade(categorias: Categoria[] = CATEGORIAS): [BlocoTreino, BlocoTreino][] {
  const conflitos: [BlocoTreino, BlocoTreino][] = [];
  for (let d = 0; d < 7; d++) {
    const blocos = treinosDoDia(d as DiaSemana, categorias);
    for (let i = 0; i < blocos.length; i++) {
      for (let j = i + 1; j < blocos.length; j++) {
        if (sobrepoe(blocos[i], blocos[j])) conflitos.push([blocos[i], blocos[j]]);
      }
    }
  }
  return conflitos;
}
