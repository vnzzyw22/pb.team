import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_PAINEL, tokenValido } from "./sessao";

/** true se quem está acessando fez login no painel. */
export async function estaNoPainel(): Promise<boolean> {
  const jar = await cookies();
  return tokenValido(jar.get(COOKIE_PAINEL)?.value);
}

/** Use no topo das páginas privadas: manda para o login se não estiver logado. */
export async function protegerPagina(destinoLogin = "/painel/entrar"): Promise<void> {
  if (!(await estaNoPainel())) redirect(destinoLogin);
}
