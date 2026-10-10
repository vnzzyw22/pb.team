"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Resposta } from "@/server/acoes/painel";
import { textoDoErro } from "./formatos";

/**
 * Executa uma Server Action do painel: guarda qual ação está rodando, trata
 * `{ ok: false }` com texto amigável, manda para o login se a sessão caiu e
 * atualiza a página quando dá certo.
 */
export function useAcao() {
  const router = useRouter();
  const [pendente, setPendente] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  /** Devolve `{ dados }` quando dá certo e `null` quando falha (o erro fica em `erro`). */
  async function executar<T>(chave: string, acao: () => Promise<Resposta<T>>): Promise<{ dados: T } | null> {
    setPendente(chave);
    setErro(null);
    try {
      const r = await acao();
      if (!r.ok) {
        if (r.erro === "nao_autorizado") {
          router.push("/painel/entrar");
          return null;
        }
        setErro(textoDoErro(r.erro, r.mensagem));
        return null;
      }
      router.refresh();
      return { dados: r.dados };
    } catch {
      setErro("Não foi possível concluir. Confira a conexão e tente de novo.");
      return null;
    } finally {
      setPendente(null);
    }
  }

  return { executar, pendente, erro, setErro };
}
