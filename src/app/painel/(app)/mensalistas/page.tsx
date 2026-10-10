import type { Metadata } from "next";
import { agoraEmMaringa, type DiaSemana, type Serie } from "@/lib";
import { listarMensalistas } from "@/server/acoes/painel";
import { protegerPagina } from "@/server/painel/acesso";
import { FormMensalista, ItemMensalista } from "@/components/painel/Mensalistas";
import { textoDoErro } from "@/components/painel/formatos";

export const metadata: Metadata = { title: "Mensalistas" };

/** Ativos primeiro, por dia da semana (segunda primeiro) e horário. */
function ordenar(series: Serie[]): Serie[] {
  const ordemDia = (d: DiaSemana) => (d + 6) % 7;
  return [...series].sort(
    (a, b) =>
      Number(b.ativa) - Number(a.ativa) || ordemDia(a.diaSemana) - ordemDia(b.diaSemana) || a.intervalo.inicio - b.intervalo.inicio,
  );
}

export default async function PaginaMensalistas() {
  await protegerPagina();
  const hoje = agoraEmMaringa().data;
  const resposta = await listarMensalistas();
  const series = resposta.ok ? ordenar(resposta.dados) : [];
  const ativos = series.filter((s) => s.ativa).length;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-12">
      <section aria-labelledby="titulo-mensalistas">
        <h1 id="titulo-mensalistas" className="titulo t-2">
          Mensalistas
        </h1>
        <p className="mt-3 text-giz">
          Times fixos que jogam no mesmo horário toda semana. {ativos} {ativos === 1 ? "ativo" : "ativos"}.
        </p>
        {!resposta.ok ? (
          <p role="alert" className="aviso aviso-erro mt-6">
            {textoDoErro(resposta.erro, resposta.mensagem)}
          </p>
        ) : series.length === 0 ? (
          <p className="mt-6 text-giz">Nenhum mensalista cadastrado.</p>
        ) : (
          <ul className="mt-6 grid gap-3">
            {series.map((s) => (
              <ItemMensalista key={s.id} serie={s} hoje={hoje} />
            ))}
          </ul>
        )}
      </section>
      <div className="lg:pt-2">
        <FormMensalista hoje={hoje} />
      </div>
    </div>
  );
}
