import type { Metadata } from "next";
import Link from "next/link";
import { agoraEmMaringa, formatarData, formatarHoraCurta, formatarMoeda, somarDias, validarData } from "@/lib";
import { ocupacaoDaSemana, resumoDoPeriodo } from "@/server/acoes/painel";
import { protegerPagina } from "@/server/painel/acesso";
import { GraficoOcupacao } from "@/components/painel/GraficoOcupacao";
import { textoDoErro } from "@/components/painel/formatos";

export const metadata: Metadata = { title: "Resumo" };

const horasEmTexto = (h: number) => formatarHoraCurta(Math.round(h * 60));

export default async function PaginaResumo({ searchParams }: { searchParams: Promise<{ de?: string; ate?: string }> }) {
  await protegerPagina();
  const sp = await searchParams;
  const hoje = agoraEmMaringa().data;
  const inicioDoMes = `${hoje.slice(0, 8)}01`;
  const fimMesPassado = somarDias(inicioDoMes, -1);
  const atalhos = [
    { rotulo: "Este mês", de: inicioDoMes, ate: hoje },
    { rotulo: "Mês passado", de: `${fimMesPassado.slice(0, 8)}01`, ate: fimMesPassado },
    { rotulo: "Últimos 30 dias", de: somarDias(hoje, -29), ate: hoje },
    { rotulo: "Próximos 30 dias", de: hoje, ate: somarDias(hoje, 29) },
  ];
  const de = sp.de && validarData(sp.de) ? sp.de : inicioDoMes;
  const ate = sp.ate && validarData(sp.ate) ? sp.ate : hoje;

  const [resumo, ocupacao] = await Promise.all([resumoDoPeriodo(de, ate), ocupacaoDaSemana()]);

  return (
    <div className="grid gap-14">
      <section aria-labelledby="titulo-resumo">
        <h1 id="titulo-resumo" className="titulo t-2">
          Resumo
        </h1>
        <nav aria-label="Períodos" className="mt-5 flex flex-wrap gap-2">
          {atalhos.map((a) => {
            const ativo = a.de === de && a.ate === ate;
            return (
              <Link
                key={a.rotulo}
                href={`/painel/resumo?de=${a.de}&ate=${a.ate}`}
                aria-current={ativo ? "true" : undefined}
                className={`btn btn-pequeno ${ativo ? "btn-claro border-branco" : "btn-sobrio"}`}
              >
                {a.rotulo}
              </Link>
            );
          })}
        </nav>
        <form action="/painel/resumo" method="get" className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="resumo-de" className="block text-sm font-semibold">
              De
            </label>
            <input id="resumo-de" type="date" name="de" defaultValue={de} className="entrada dado mt-1.5 min-h-11 w-auto py-2" />
          </div>
          <div>
            <label htmlFor="resumo-ate" className="block text-sm font-semibold">
              Até
            </label>
            <input id="resumo-ate" type="date" name="ate" defaultValue={ate} className="entrada dado mt-1.5 min-h-11 w-auto py-2" />
          </div>
          <button type="submit" className="btn btn-sobrio btn-pequeno">
            Ver período
          </button>
        </form>

        <p className="mt-8 text-giz">
          {formatarData(de)} a {formatarData(ate)}
        </p>
        {!resumo.ok ? (
          <p role="alert" className="aviso aviso-erro mt-4">
            {textoDoErro(resumo.erro, resumo.mensagem)}
          </p>
        ) : (
          <dl className="mt-4 grid grid-cols-2 border-l border-t border-linha sm:grid-cols-3 lg:grid-cols-4">
            {[
              { rotulo: "Faturamento previsto", valor: formatarMoeda(resumo.dados.faturamentoPrevisto) },
              { rotulo: "Recebido", valor: formatarMoeda(resumo.dados.recebido) },
              { rotulo: "A receber", valor: formatarMoeda(resumo.dados.aReceber) },
              { rotulo: "Reservas", valor: String(resumo.dados.reservas) },
              { rotulo: "Horas vendidas", valor: horasEmTexto(resumo.dados.horasVendidas) },
              { rotulo: "Não compareceram", valor: String(resumo.dados.naoCompareceu) },
              { rotulo: "Canceladas", valor: String(resumo.dados.canceladas) },
            ].map((k) => (
              <div key={k.rotulo} className="border-b border-r border-linha p-4 sm:p-5">
                <dt className="text-sm text-giz">{k.rotulo}</dt>
                <dd className="dado mt-1.5 text-[1.375rem] sm:text-[1.625rem]">{k.valor}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section aria-labelledby="titulo-ocupacao">
        <h2 id="titulo-ocupacao" className="titulo t-3">
          Ocupação da quadra
        </h2>
        {!ocupacao.ok ? (
          <p role="alert" className="aviso aviso-erro mt-4">
            {textoDoErro(ocupacao.erro, ocupacao.mensagem)}
          </p>
        ) : (
          <>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-3">
              <span className="dado text-[3.25rem] leading-none">{horasEmTexto(ocupacao.dados.horasLivres)}</span>
              <span className="text-giz">
                livres por semana para locação, {horasEmTexto(ocupacao.dados.horasLivresNobres)} no horário nobre. Semana típica, só com os
                treinos da escolinha.
              </span>
            </p>
            <div className="mt-8 max-w-4xl">
              <GraficoOcupacao ocupacao={ocupacao.dados} />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
