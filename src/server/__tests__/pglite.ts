import { PGlite, type Transaction } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import type { Executor } from "../db/executor";
import { migrar } from "../db/schema";

function executorDe(db: PGlite | Transaction): Executor {
  return {
    async query<T>(sql: string, params: unknown[] = []) {
      const r = await db.query<T>(sql, params);
      return { rows: r.rows };
    },
    async transacao<T>(fn: (tx: Executor) => Promise<T>): Promise<T> {
      if (!("transaction" in db)) throw new Error("Transações aninhadas não são suportadas");
      return db.transaction((tx) => fn(executorDe(tx)));
    },
  };
}

/** Postgres embutido (WASM) com a estrutura do projeto, para testes. */
export async function bancoDeTeste(): Promise<Executor> {
  const db = await PGlite.create({ extensions: { btree_gist } });
  const executor = executorDe(db);
  await migrar(executor);
  return executor;
}
