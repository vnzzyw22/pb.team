import type { Executor } from "./executor";

/**
 * Estrutura do banco. Idempotente: pode rodar quantas vezes quiser.
 *
 * Cada reserva é guardada inteira em `doc` (JSON), com algumas colunas
 * repetidas para consulta. Os horários ocupados ficam em `reserva_itens`, onde
 * uma exclusion constraint garante, no próprio banco, que dois horários
 * ativos do mesmo recurso nunca se sobreponham, mesmo com vários servidores.
 */
export const SCHEMA = /* sql */ `
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS reservas (
  id         text PRIMARY KEY,
  codigo     text NOT NULL UNIQUE,
  data       text NOT NULL CHECK (data ~ '^\\d{4}-\\d{2}-\\d{2}$'),
  status     text NOT NULL,
  serie_id   text,
  expira_em  bigint,
  doc        jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS reservas_por_data ON reservas (data);
CREATE INDEX IF NOT EXISTS reservas_pendentes ON reservas (expira_em) WHERE status = 'aguardando_sinal';

CREATE TABLE IF NOT EXISTS reserva_itens (
  reserva_id text NOT NULL REFERENCES reservas (id) ON DELETE CASCADE,
  recurso    text NOT NULL,
  data       text NOT NULL,
  inicio     integer NOT NULL,
  fim        integer NOT NULL CHECK (fim > inicio),
  ativo      boolean NOT NULL,
  CONSTRAINT reserva_itens_sem_sobreposicao
    EXCLUDE USING gist (recurso WITH =, data WITH =, int4range(inicio, fim) WITH &&) WHERE (ativo)
);
CREATE INDEX IF NOT EXISTS reserva_itens_por_reserva ON reserva_itens (reserva_id);

CREATE TABLE IF NOT EXISTS bloqueios (
  id      text PRIMARY KEY,
  recurso text NOT NULL,
  data    text NOT NULL,
  inicio  integer NOT NULL,
  fim     integer NOT NULL CHECK (fim > inicio),
  motivo  text NOT NULL
);
CREATE INDEX IF NOT EXISTS bloqueios_por_data ON bloqueios (data);

CREATE TABLE IF NOT EXISTS series (
  id    text PRIMARY KEY,
  ativa boolean NOT NULL,
  doc   jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id        text PRIMARY KEY,
  status    text NOT NULL,
  criado_em bigint NOT NULL,
  doc       jsonb NOT NULL
);
`;

export async function migrar(db: Executor): Promise<void> {
  for (const comando of SCHEMA.split(/;\s*\n/).map((c) => c.trim()).filter(Boolean)) {
    await db.query(comando);
  }
}

/** Apaga todos os dados (mantém a estrutura). Usado pelo "resetar demo". */
export async function limparTudo(db: Executor): Promise<void> {
  await db.query("TRUNCATE reserva_itens, reservas, bloqueios, series, leads");
}
