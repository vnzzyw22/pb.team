import { ConflitoDeHorario, ocupaHorario, type Bloqueio, type Lead, type Repositorio, type Reserva, type Serie } from "@/lib";
import { codigoErroPg, VIOLACAO_EXCLUSAO, type Executor } from "./executor";

type LinhaDoc<T> = { doc: T };

/** Itens que ocupam a agenda: mesma regra do domínio, mas sem olhar o relógio. */
function itemAtivo(r: Reserva): boolean {
  // pré-reservas vencidas são marcadas "expirada" pelo serviço antes de qualquer gravação
  return ocupaHorario(r, -Infinity);
}

export class RepositorioPostgres implements Repositorio {
  constructor(private db: Executor) {}

  // ------------------------------------------------------------- reservas

  async reservasEntre(de: string, ate: string): Promise<Reserva[]> {
    const { rows } = await this.db.query<LinhaDoc<Reserva>>(
      "SELECT doc FROM reservas WHERE data BETWEEN $1 AND $2 ORDER BY data, codigo",
      [de, ate],
    );
    return rows.map((r) => r.doc);
  }

  async reservaPorId(id: string): Promise<Reserva | undefined> {
    const { rows } = await this.db.query<LinhaDoc<Reserva>>("SELECT doc FROM reservas WHERE id = $1", [id]);
    return rows[0]?.doc;
  }

  async reservaPorCodigo(codigo: string): Promise<Reserva | undefined> {
    const { rows } = await this.db.query<LinhaDoc<Reserva>>("SELECT doc FROM reservas WHERE codigo = $1", [
      codigo.toUpperCase(),
    ]);
    return rows[0]?.doc;
  }

  async salvarReserva(r: Reserva): Promise<void> {
    try {
      await this.db.transacao(async (tx) => {
        await tx.query(
          `INSERT INTO reservas (id, codigo, data, status, serie_id, expira_em, doc)
           VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
           ON CONFLICT (id) DO UPDATE SET
             codigo = EXCLUDED.codigo, data = EXCLUDED.data, status = EXCLUDED.status,
             serie_id = EXCLUDED.serie_id, expira_em = EXCLUDED.expira_em, doc = EXCLUDED.doc`,
          [r.id, r.codigo, r.data, r.status, r.serieId ?? null, r.expiraEm ?? null, JSON.stringify(r)],
        );
        await tx.query("DELETE FROM reserva_itens WHERE reserva_id = $1", [r.id]);
        const ativo = itemAtivo(r);
        for (const item of r.itens) {
          await tx.query(
            "INSERT INTO reserva_itens (reserva_id, recurso, data, inicio, fim, ativo) VALUES ($1, $2, $3, $4, $5, $6)",
            [r.id, item.recursoId, r.data, item.intervalo.inicio, item.intervalo.fim, ativo],
          );
        }
      });
    } catch (e) {
      if (codigoErroPg(e) === VIOLACAO_EXCLUSAO) throw new ConflitoDeHorario();
      throw e;
    }
  }

  async pendentesVencidas(agoraMs: number): Promise<Reserva[]> {
    const { rows } = await this.db.query<LinhaDoc<Reserva>>(
      "SELECT doc FROM reservas WHERE status = 'aguardando_sinal' AND expira_em <= $1",
      [agoraMs],
    );
    return rows.map((r) => r.doc);
  }

  // ------------------------------------------------------------ bloqueios

  async bloqueiosEntre(de: string, ate: string): Promise<Bloqueio[]> {
    const { rows } = await this.db.query<{ id: string; recurso: string; data: string; inicio: number; fim: number; motivo: string }>(
      "SELECT id, recurso, data, inicio, fim, motivo FROM bloqueios WHERE data BETWEEN $1 AND $2 ORDER BY data, inicio",
      [de, ate],
    );
    return rows.map((b) => ({
      id: b.id,
      recursoId: b.recurso as Bloqueio["recursoId"],
      data: b.data,
      intervalo: { inicio: Number(b.inicio), fim: Number(b.fim) },
      motivo: b.motivo,
    }));
  }

  async salvarBloqueio(b: Bloqueio): Promise<void> {
    await this.db.query(
      `INSERT INTO bloqueios (id, recurso, data, inicio, fim, motivo) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET recurso = EXCLUDED.recurso, data = EXCLUDED.data,
         inicio = EXCLUDED.inicio, fim = EXCLUDED.fim, motivo = EXCLUDED.motivo`,
      [b.id, b.recursoId, b.data, b.intervalo.inicio, b.intervalo.fim, b.motivo],
    );
  }

  async removerBloqueio(id: string): Promise<void> {
    await this.db.query("DELETE FROM bloqueios WHERE id = $1", [id]);
  }

  // --------------------------------------------------------------- séries

  async series(): Promise<Serie[]> {
    const { rows } = await this.db.query<LinhaDoc<Serie>>("SELECT doc FROM series ORDER BY doc->>'criadaEm'");
    return rows.map((r) => r.doc);
  }

  async seriePorId(id: string): Promise<Serie | undefined> {
    const { rows } = await this.db.query<LinhaDoc<Serie>>("SELECT doc FROM series WHERE id = $1", [id]);
    return rows[0]?.doc;
  }

  async salvarSerie(s: Serie): Promise<void> {
    await this.db.query(
      `INSERT INTO series (id, ativa, doc) VALUES ($1, $2, $3::jsonb)
       ON CONFLICT (id) DO UPDATE SET ativa = EXCLUDED.ativa, doc = EXCLUDED.doc`,
      [s.id, s.ativa, JSON.stringify(s)],
    );
  }

  // ---------------------------------------------------------------- leads

  async leads(): Promise<Lead[]> {
    const { rows } = await this.db.query<LinhaDoc<Lead>>("SELECT doc FROM leads ORDER BY criado_em DESC");
    return rows.map((r) => r.doc);
  }

  async leadPorId(id: string): Promise<Lead | undefined> {
    const { rows } = await this.db.query<LinhaDoc<Lead>>("SELECT doc FROM leads WHERE id = $1", [id]);
    return rows[0]?.doc;
  }

  async salvarLead(l: Lead): Promise<void> {
    await this.db.query(
      `INSERT INTO leads (id, status, criado_em, doc) VALUES ($1, $2, $3, $4::jsonb)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, doc = EXCLUDED.doc`,
      [l.id, l.status, l.criadoEm, JSON.stringify(l)],
    );
  }
}
