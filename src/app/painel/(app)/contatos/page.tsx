import type { Metadata } from "next";
import { listarContatos } from "@/server/acoes/painel";
import { protegerPagina } from "@/server/painel/acesso";
import { CartaoContato } from "@/components/painel/CartaoContato";
import { ETAPAS_FUNIL, textoDoErro } from "@/components/painel/formatos";

export const metadata: Metadata = { title: "Contatos" };

export default async function PaginaContatos() {
  await protegerPagina();
  const resposta = await listarContatos();
  const leads = resposta.ok ? [...resposta.dados].sort((a, b) => b.criadoEm - a.criadoEm) : [];

  return (
    <div>
      <h1 className="titulo t-2">Contatos</h1>
      <p className="mt-3 max-w-[60ch] text-giz">
        Pedidos de aula experimental feitos pelo site. Mova cada contato pelas etapas até a matrícula.
      </p>
      {!resposta.ok ? (
        <p role="alert" className="aviso aviso-erro mt-6">
          {textoDoErro(resposta.erro, resposta.mensagem)}
        </p>
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-5 xl:gap-4">
          {ETAPAS_FUNIL.map((etapa) => {
            const daEtapa = leads.filter((l) => l.status === etapa.status);
            return (
              <section key={etapa.status} aria-labelledby={`etapa-${etapa.status}`}>
                <h2 id={`etapa-${etapa.status}`} className="flex items-baseline justify-between gap-3 border-b border-linha-forte pb-2">
                  <span className="font-semibold">{etapa.rotulo}</span>
                  <span className="dado text-giz">{daEtapa.length}</span>
                </h2>
                {daEtapa.length === 0 ? (
                  <p className="mt-3 text-sm text-giz">Nenhum contato.</p>
                ) : (
                  <ul className="mt-3 grid gap-3">
                    {daEtapa.map((l) => (
                      <CartaoContato key={l.id} lead={l} />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
