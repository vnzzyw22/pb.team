import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Sessão do painel do dono: uma senha (PAINEL_SENHA) e um cookie assinado.
 * Simples de propósito: é um único usuário, o próprio clube.
 */

export const COOKIE_PAINEL = "pb_painel";
export const DURACAO_SESSAO_DIAS = 7;
const SENHA_DEMO = "pbteam2019";

type Env = Record<string, string | undefined>;

export function senhaDoPainel(env: Env = process.env): string {
  if (env.PAINEL_SENHA) return env.PAINEL_SENHA;
  if (env.DEMO === "true" || !env.DATABASE_URL) return SENHA_DEMO;
  throw new Error("Defina PAINEL_SENHA nas variáveis de ambiente");
}

function segredo(env: Env = process.env): Buffer {
  const base = env.PAINEL_SEGREDO ?? `pb-team:${senhaDoPainel(env)}`;
  return createHash("sha256").update(base).digest();
}

function assinar(conteudo: string, env: Env = process.env): string {
  return createHmac("sha256", segredo(env)).update(conteudo).digest("base64url");
}

function iguais(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function senhaConfere(tentativa: string, env: Env = process.env): boolean {
  return iguais(tentativa, senhaDoPainel(env));
}

/** Gera o valor do cookie: "<expiraEm>.<assinatura>". */
export function criarToken(agoraMs = Date.now(), env: Env = process.env): string {
  const expira = String(agoraMs + DURACAO_SESSAO_DIAS * 86_400_000);
  return `${expira}.${assinar(expira, env)}`;
}

export function tokenValido(token: string | undefined, agoraMs = Date.now(), env: Env = process.env): boolean {
  if (!token) return false;
  const [expira, assinatura] = token.split(".");
  if (!expira || !assinatura || !/^\d+$/.test(expira)) return false;
  if (Number(expira) <= agoraMs) return false;
  return iguais(assinatura, assinar(expira, env));
}
