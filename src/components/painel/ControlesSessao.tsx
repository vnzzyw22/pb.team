"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { resetarDemo, sairDoPainel } from "@/server/acoes/painel";
import { Carregando } from "@/components/grafismos";
import { useAcao } from "./useAcao";

export function BotaoSair() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-sobrio btn-pequeno"
      disabled={saindo}
      onClick={async () => {
        setSaindo(true);
        await sairDoPainel();
        router.replace("/painel/entrar");
        router.refresh();
      }}
    >
      Sair
    </button>
  );
}

/** "Resetar demo" com confirmação: apaga tudo e recarrega os dados de exemplo. */
export function ResetarDemo() {
  const { executar, pendente, erro } = useAcao();
  const [confirmando, setConfirmando] = useState(false);
  const [feito, setFeito] = useState(false);

  if (confirmando) {
    return (
      <div role="alertdialog" aria-labelledby="resetar-titulo" className="aviso aviso-erro mt-3 grid gap-3 sm:flex sm:items-center sm:justify-between">
        <p id="resetar-titulo" className="text-[0.9375rem]">
          Apagar todas as reservas, bloqueios, mensalistas e contatos e voltar aos dados de exemplo?
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="btn btn-perigo btn-pequeno"
            disabled={pendente !== null}
            aria-busy={pendente !== null || undefined}
            autoFocus
            onClick={async () => {
              const r = await executar("resetar", () => resetarDemo());
              setFeito(r !== null);
              setConfirmando(false);
            }}
          >
            {pendente && <Carregando />}
            Sim, resetar
          </button>
          <button type="button" className="btn btn-sobrio btn-pequeno" onClick={() => setConfirmando(false)}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className="btn btn-sobrio btn-pequeno" onClick={() => (setFeito(false), setConfirmando(true))}>
        Resetar demo
      </button>
      {feito && !erro && (
        <span role="status" className="text-sm text-ok">
          Dados de exemplo recarregados.
        </span>
      )}
      {erro && (
        <span role="alert" className="text-sm text-alerta">
          {erro}
        </span>
      )}
    </div>
  );
}
