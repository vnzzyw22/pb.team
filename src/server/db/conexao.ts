import { Pool, type PoolClient } from "pg";
import type { Executor } from "./executor";

function executorDoCliente(cliente: Pool | PoolClient): Executor {
  return {
    async query<T>(sql: string, params: unknown[] = []) {
      const r = await cliente.query(sql, params);
      return { rows: r.rows as T[] };
    },
    async transacao() {
      throw new Error("Transações aninhadas não são suportadas");
    },
  };
}

/** Executor sobre o driver `pg` (funciona com a connection string do Neon). */
export function executorPg(pool: Pool): Executor {
  return {
    ...executorDoCliente(pool),
    async transacao<T>(fn: (tx: Executor) => Promise<T>): Promise<T> {
      const cliente = await pool.connect();
      try {
        await cliente.query("BEGIN");
        const resultado = await fn(executorDoCliente(cliente));
        await cliente.query("COMMIT");
        return resultado;
      } catch (e) {
        await cliente.query("ROLLBACK").catch(() => undefined);
        throw e;
      } finally {
        cliente.release();
      }
    },
  };
}

export function criarPool(connectionString: string): Pool {
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);
  return new Pool({
    connectionString,
    // serverless: poucas conexões por instância; o Neon faz o pooling do lado dele
    max: 3,
    ssl: local ? undefined : { rejectUnauthorized: true },
  });
}
