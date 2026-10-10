"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { entrarNoPainel } from "@/server/acoes/painel";
import { Carregando } from "@/components/grafismos";
import { Campo, descritoPor } from "@/components/ui/Campo";

export function FormEntrar() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | undefined>();
  const [entrando, setEntrando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (!senha) {
      setErro("Digite a senha do painel.");
      return;
    }
    setEntrando(true);
    setErro(undefined);
    try {
      const r = await entrarNoPainel(senha);
      if (r.ok) {
        router.replace("/painel");
        router.refresh();
        return;
      }
      setErro("Senha incorreta. Tente de novo.");
    } catch {
      setErro("Não foi possível entrar agora. Tente de novo em instantes.");
    }
    setEntrando(false);
  }

  return (
    <form onSubmit={entrar} noValidate className="grid gap-6">
      <Campo id="senha" rotulo="Senha" erro={erro}>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          className="entrada"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          aria-invalid={erro ? true : undefined}
          aria-describedby={descritoPor("senha", erro)}
          autoFocus
        />
      </Campo>
      <button type="submit" className="btn btn-neon w-full" disabled={entrando} aria-busy={entrando || undefined}>
        {entrando && <Carregando />}
        {entrando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
