import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CLUBE } from "@/lib";
import { estaNoPainel } from "@/server/painel/acesso";
import { Escudo } from "@/components/Escudo";
import { FormEntrar } from "@/components/painel/FormEntrar";

export const metadata: Metadata = { title: "Entrar" };

export default async function PaginaEntrar() {
  if (await estaNoPainel()) redirect("/painel");
  return (
    <main className="grid min-h-[100svh] place-items-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Escudo contorno className="h-16 w-16" />
        <h1 className="titulo t-2 mt-6">Painel</h1>
        <p className="mt-3 text-giz">Reservas, sinais, mensalistas e contatos do {CLUBE.nomeCompleto}.</p>
        <div className="mt-10">
          <FormEntrar />
        </div>
        <Link href="/" className="link-jogada mt-8 inline-flex min-h-11 items-center text-[0.9375rem]">
          Voltar para o site
        </Link>
      </div>
    </main>
  );
}
