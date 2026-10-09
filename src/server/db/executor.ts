/**
 * Interface mínima de acesso ao Postgres, para o mesmo código rodar com o
 * driver `pg` (Neon/produção) e com o PGlite (testes, sem servidor).
 */
export interface Executor {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  transacao<T>(fn: (tx: Executor) => Promise<T>): Promise<T>;
}

/** Código do Postgres para violação de exclusion constraint. */
export const VIOLACAO_EXCLUSAO = "23P01";

export function codigoErroPg(e: unknown): string | undefined {
  return typeof e === "object" && e !== null && "code" in e ? String((e as { code: unknown }).code) : undefined;
}
