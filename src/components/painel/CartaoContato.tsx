"use client";

import { useState } from "react";
import { categoriaPorId, formatarTelefone, linkWhatsApp, turmaPorId, type Lead, type StatusLead } from "@/lib";
import { mudarStatusContato } from "@/server/acoes/painel";
import { Carregando, IconeWhatsApp } from "@/components/grafismos";
import { ETAPAS_FUNIL } from "./formatos";
import { useAcao } from "./useAcao";

const quando = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

export function CartaoContato({ lead }: { lead: Lead }) {
  const { executar, pendente, erro } = useAcao();
  const [destino, setDestino] = useState<StatusLead | "">("");
  const categoria = lead.categoriaId ? categoriaPorId(lead.categoriaId) : undefined;
  const turma = lead.turmaId ? turmaPorId(lead.turmaId)?.turma : undefined;
  const opcoes = ETAPAS_FUNIL.filter((e) => e.status !== lead.status);

  return (
    <li className="quadro p-4">
      <p className="font-semibold leading-tight">{lead.atleta}</p>
      <p className="mt-1 text-sm text-giz">
        <span className="dado">{lead.anoNascimento}</span>
        {categoria && `, ${categoria.nome}`}
        {turma && `, ${turma.nome.toLowerCase()}`}
      </p>
      <p className="mt-2 text-sm">Responsável: {lead.responsavel}</p>
      {lead.observacoes && <p className="mt-1 text-sm text-giz">Obs.: {lead.observacoes}</p>}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3">
        <a
          href={linkWhatsApp("", lead.telefone)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-giz hover:text-branco"
        >
          <IconeWhatsApp className="h-4 w-4" />
          <span className="dado">{formatarTelefone(lead.telefone)}</span>
        </a>
        <span className="dado text-xs text-giz">{quando.format(lead.criadoEm)}</span>
      </div>
      {erro && (
        <p role="alert" className="mt-2 text-sm text-alerta">
          {erro}
        </p>
      )}
      <form
        className="mt-3 flex gap-2 border-t border-linha pt-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (destino) await executar("mover", () => mudarStatusContato(lead.id, destino));
        }}
      >
        <label htmlFor={`mover-${lead.id}`} className="sr-only">
          Mover {lead.atleta} para
        </label>
        <select
          id={`mover-${lead.id}`}
          className="entrada min-h-11 py-2 text-sm"
          value={destino}
          onChange={(e) => setDestino(e.target.value as StatusLead | "")}
        >
          <option value="">Mover para…</option>
          {opcoes.map((o) => (
            <option key={o.status} value={o.status}>
              {o.rotulo}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-sobrio btn-pequeno shrink-0" disabled={!destino || pendente !== null} aria-busy={pendente !== null || undefined}>
          {pendente && <Carregando />}
          Mover
        </button>
      </form>
    </li>
  );
}
