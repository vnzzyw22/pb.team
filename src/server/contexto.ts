import "server-only";
import { RepositorioMemoria, ServicoReservas, type Repositorio } from "@/lib";
import { criarPool, executorPg } from "./db/conexao";
import type { Executor } from "./db/executor";
import { RepositorioPostgres } from "./db/repositorio-postgres";
import { limparTudo, migrar } from "./db/schema";
import { semearDemo } from "./demo";

/**
 * Ponto único de acesso ao sistema no servidor.
 *
 * - Com `DATABASE_URL` (Neon): usa o Postgres. Cria as tabelas sozinho na
 *   primeira conexão e, em modo demo, preenche com os dados de exemplo se o
 *   banco estiver vazio.
 * - Sem `DATABASE_URL`: usa memória com os dados de exemplo (desenvolvimento
 *   local sem configurar nada). Some quando o servidor reinicia.
 */

export interface Contexto {
  repo: Repositorio;
  servico: ServicoReservas;
  modo: "postgres" | "memoria";
  /** Volta aos dados de exemplo. Só existe em modo demo. */
  resetar?: () => Promise<void>;
}

export function modoDemo(): boolean {
  return process.env.DEMO === "true" || !process.env.DATABASE_URL;
}

async function criarContexto(): Promise<Contexto> {
  const url = process.env.DATABASE_URL;

  if (!url) {
    const ctx: Contexto = { repo: new RepositorioMemoria(), servico: undefined!, modo: "memoria" };
    const montar = async () => {
      ctx.repo = new RepositorioMemoria();
      ctx.servico = new ServicoReservas(ctx.repo);
      await semearDemo(ctx.repo);
    };
    await montar();
    ctx.resetar = montar;
    return ctx;
  }

  const db: Executor = executorPg(criarPool(url));
  await migrar(db);
  const repo = new RepositorioPostgres(db);
  const ctx: Contexto = { repo, servico: new ServicoReservas(repo), modo: "postgres" };

  if (modoDemo()) {
    ctx.resetar = async () => {
      await limparTudo(db);
      await semearDemo(repo);
    };
    const { rows } = await db.query<{ n: number }>(
      "SELECT (SELECT count(*) FROM reservas) + (SELECT count(*) FROM leads) AS n",
    );
    if (Number(rows[0].n) === 0) await semearDemo(repo);
  }
  return ctx;
}

// Guardado no globalThis para sobreviver ao hot reload do `next dev`.
const global = globalThis as unknown as { __pbContexto?: Promise<Contexto> };

export function obterContexto(): Promise<Contexto> {
  global.__pbContexto ??= criarContexto().catch((e) => {
    global.__pbContexto = undefined; // tenta de novo na próxima requisição
    throw e;
  });
  return global.__pbContexto;
}
