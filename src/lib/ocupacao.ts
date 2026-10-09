import { treinosDoDia } from "./categorias";
import { HORARIO_NOBRE, RECURSOS } from "./dados/arena";
import { hora, NOMES_DIAS, sobrepoe, type DiaSemana, type Intervalo } from "./tempo";

export interface OcupacaoDia {
  dia: DiaSemana;
  nome: string;
  minutosAbertos: number;
  minutosTreino: number;
  minutosLivres: number;
  /** Minutos livres no horário nobre (noite em dia útil, fim de semana inteiro). */
  minutosLivresNobres: number;
  janelasLivres: Intervalo[];
}

export interface OcupacaoSemana {
  dias: OcupacaoDia[];
  horasAbertas: number;
  horasTreino: number;
  horasLivres: number;
  horasLivresNobres: number;
}

function intersecao(a: Intervalo, b: Intervalo): number {
  return Math.max(0, Math.min(a.fim, b.fim) - Math.max(a.inicio, b.inicio));
}

/**
 * Semana típica da quadra: quanto é treino e quanto sobra para locação.
 * É o número do pitch: "a quadra tem X horas livres por semana".
 */
export function ocupacaoSemanal(): OcupacaoSemana {
  const quadra = RECURSOS.quadra;
  const dias: OcupacaoDia[] = [];

  for (let d = 0; d < 7; d++) {
    const dia = d as DiaSemana;
    const exp = quadra.expediente[dia];
    if (!exp) {
      dias.push({ dia, nome: NOMES_DIAS[dia], minutosAbertos: 0, minutosTreino: 0, minutosLivres: 0, minutosLivresNobres: 0, janelasLivres: [] });
      continue;
    }
    const aberto = { inicio: hora(exp.abre), fim: hora(exp.fecha) };
    const treinos = treinosDoDia(dia).filter((t) => sobrepoe(t, aberto));

    const janelasLivres: Intervalo[] = [];
    let cursor = aberto.inicio;
    for (const t of treinos) {
      if (t.inicio > cursor) janelasLivres.push({ inicio: cursor, fim: t.inicio });
      cursor = Math.max(cursor, t.fim);
    }
    if (cursor < aberto.fim) janelasLivres.push({ inicio: cursor, fim: aberto.fim });

    const nobre: Intervalo =
      dia === 0 || dia === 6
        ? aberto
        : { inicio: hora(HORARIO_NOBRE.diasUteis.inicio), fim: hora(HORARIO_NOBRE.diasUteis.fim) };

    const minutosLivres = janelasLivres.reduce((s, j) => s + (j.fim - j.inicio), 0);
    dias.push({
      dia,
      nome: NOMES_DIAS[dia],
      minutosAbertos: aberto.fim - aberto.inicio,
      minutosTreino: treinos.reduce((s, t) => s + intersecao(t, aberto), 0),
      minutosLivres,
      minutosLivresNobres: janelasLivres.reduce((s, j) => s + intersecao(j, nobre), 0),
      janelasLivres,
    });
  }

  const soma = (k: keyof Pick<OcupacaoDia, "minutosAbertos" | "minutosTreino" | "minutosLivres" | "minutosLivresNobres">) =>
    dias.reduce((s, d) => s + d[k], 0) / 60;

  // segunda-feira primeiro, como no calendário do clube
  const ordenados = [...dias.slice(1), dias[0]];
  return {
    dias: ordenados,
    horasAbertas: soma("minutosAbertos"),
    horasTreino: soma("minutosTreino"),
    horasLivres: soma("minutosLivres"),
    horasLivresNobres: soma("minutosLivresNobres"),
  };
}
