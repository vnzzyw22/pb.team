/**
 * Utilitário do banco:
 *   npm run db:preparar   cria/atualiza as tabelas
 *   npm run db:demo       apaga tudo e carrega os dados de exemplo
 * Lê DATABASE_URL do ambiente (ou do .env.local).
 */
import { existsSync, readFileSync } from "node:fs";
import { criarPool, executorPg } from "../src/server/db/conexao";
import { RepositorioPostgres } from "../src/server/db/repositorio-postgres";
import { limparTudo, migrar } from "../src/server/db/schema";
import { semearDemo } from "../src/server/demo";

if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  for (const linha of readFileSync(".env.local", "utf8").split("\n")) {
    const m = /^\s*([A-Z_]+)\s*=\s*(.*)\s*$/.exec(linha);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

async function main() {
  const comando = process.argv[2];
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Defina DATABASE_URL (no ambiente ou em .env.local)");
  const pool = criarPool(url);
  const db = executorPg(pool);
  try {
    await migrar(db);
    console.log("✓ Tabelas prontas");
    if (comando === "demo") {
      await limparTudo(db);
      await semearDemo(new RepositorioPostgres(db));
      console.log("✓ Dados de exemplo carregados");
    }
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
