import type { Metadata } from "next";
import { agoraEmMaringa, somarDias } from "@/lib";
import { listarBloqueios } from "@/server/acoes/painel";
import { protegerPagina } from "@/server/painel/acesso";
import { FormBloqueio, ItemBloqueio } from "@/components/painel/Bloqueios";
import { textoDoErro } from "@/components/painel/formatos";

export const metadata: Metadata = { title: "Bloqueios" };

const DIAS_A_FRENTE = 60;

export default async function PaginaBloqueios() {
  await protegerPagina();
  const hoje = agoraEmMaringa().data;
  const resposta = await listarBloqueios(hoje, somarDias(hoje, DIAS_A_FRENTE));
  const bloqueios = resposta.ok
    ? [...resposta.dados].sort((a, b) => a.data.localeCompare(b.data) || a.intervalo.inicio - b.intervalo.inicio)
    : [];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
      <section aria-labelledby="titulo-bloqueios">
        <h1 id="titulo-bloqueios" className="titulo t-2">
          Bloqueios
        </h1>
        <p className="mt-3 text-giz">Próximos {DIAS_A_FRENTE} dias. Horários bloqueados não aparecem para reserva no site.</p>
        {!resposta.ok ? (
          <p role="alert" className="aviso aviso-erro mt-6">
            {textoDoErro(resposta.erro, resposta.mensagem)}
          </p>
        ) : bloqueios.length === 0 ? (
          <p className="mt-6 text-giz">Nenhum bloqueio programado.</p>
        ) : (
          <ul className="mt-6 grid gap-3">
            {bloqueios.map((b) => (
              <ItemBloqueio key={b.id} bloqueio={b} />
            ))}
          </ul>
        )}
      </section>
      <div className="lg:pt-2">
        <FormBloqueio hoje={hoje} />
      </div>
    </div>
  );
}
