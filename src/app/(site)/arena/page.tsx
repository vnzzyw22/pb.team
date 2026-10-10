import type { Metadata } from "next";
import Link from "next/link";
import { CLUBE, formatarHoraCurta, formatarMoeda, POLITICA, RECURSOS } from "@/lib";
import { ArenaInterativa } from "@/components/arena/ArenaInterativa";
import { expedienteResumido, faixaDeHoras, formatarDias, formatarDuracao } from "@/components/arena/formatos";
import { IconeWhatsApp, LinhaDoMeio } from "@/components/grafismos";
import { Quadra } from "@/components/Quadra";
import { whatsappDaArena } from "@/components/site/navegacao";

export const metadata: Metadata = {
  title: "Arena",
  description:
    `${CLUBE.arena.descricao} em ${CLUBE.cidade}: preços, horários livres e reserva online da ` +
    `${CLUBE.arena.nome}, com opção de churrasqueira.`,
};

export default function PaginaArena() {
  const quadra = RECURSOS.quadra;
  const churrasqueira = RECURSOS.churrasqueira;
  const duracoes = quadra.duracoes.map(formatarDuracao);
  const listaDuracoes = duracoes.length > 1 ? `${duracoes.slice(0, -1).join(", ")} ou ${duracoes[duracoes.length - 1]}` : duracoes[0];

  return (
    <>
      {/* Apresentação: a quadra desenhada é a imagem da Arena */}
      <section className="relative overflow-hidden">
        <Quadra
          orientacao="horizontal"
          className="pointer-events-none absolute right-[-10%] top-1/2 hidden w-[62%] -translate-y-1/2 text-white/[0.22] lg:block"
        />
        <div className="recipiente relative pb-14 pt-28 lg:pb-28 lg:pt-44">
          <h1 className="titulo t-1 max-w-[8ch]">{CLUBE.arena.nome}</h1>
          <p className="lead mt-6 max-w-[32ch]">
            {CLUBE.arena.descricao}. Veja os horários livres, reserve pelo site e pague o sinal no Pix.
          </p>
          {CLUBE.arena.endereco && <p className="mt-4 text-giz">{CLUBE.arena.endereco}</p>}
          {CLUBE.arena.mapsUrl && (
            <a href={CLUBE.arena.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-jogada mt-2 inline-flex min-h-11 items-center">
              Ver no mapa
            </a>
          )}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="#reservar" className="btn btn-neon">
              Reservar horário
            </Link>
            <a href={whatsappDaArena()} target="_blank" rel="noopener noreferrer" className="btn btn-claro">
              <IconeWhatsApp className="h-5 w-5" />
              Tirar dúvidas no WhatsApp
            </a>
          </div>
        </div>
        <Quadra orientacao="horizontal" className="pointer-events-none mx-auto mb-12 w-[calc(100%-2rem)] text-white/[0.28] lg:hidden" />
      </section>

      {/* Preços e funcionamento */}
      <section aria-labelledby="titulo-precos" className="border-t border-linha">
        <div className="recipiente secao">
          <h2 id="titulo-precos" className="titulo t-2">
            Preços e horários
          </h2>

          <div className="mt-10 grid gap-px border border-linha bg-linha lg:grid-cols-3">
            <article className="bg-preto p-5 sm:p-7">
              <h3 className="titulo t-3">{quadra.nome}</h3>
              <p className="mt-3 text-giz">{quadra.descricao}</p>
              {quadra.preco.tipo === "hora" && (
                <table className="mt-6 w-full text-left text-[0.9375rem]">
                  <caption className="sr-only">Preço por hora da {quadra.nome.toLowerCase()}</caption>
                  <thead className="sr-only">
                    <tr>
                      <th scope="col">Faixa</th>
                      <th scope="col">Preço por hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quadra.preco.faixas.map((f) => (
                      <tr key={f.rotulo} className="border-t border-linha">
                        <th scope="row" className="py-3 pr-4 align-top font-normal">
                          <span className="block font-semibold">{f.rotulo}</span>
                          <span className="block text-giz">
                            {formatarDias(f.dias)}, {faixaDeHoras(f.inicio, f.fim)}
                          </span>
                        </th>
                        <td className="dado whitespace-nowrap py-3 text-right align-top text-lg">
                          {formatarMoeda(f.valorHora)}
                          <span className="text-sm font-normal text-giz">/h</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="mt-4 border-t border-linha pt-4 text-[0.9375rem] text-giz">Reservas de {listaDuracoes}.</p>
            </article>

            {churrasqueira.ativo && (
              <article className="bg-preto p-5 sm:p-7">
                <h3 className="titulo t-3">{churrasqueira.nome}</h3>
                <p className="mt-3 text-giz">{churrasqueira.descricao}</p>
                {churrasqueira.preco.tipo === "fixo" && (
                  <p className="mt-6 flex items-baseline justify-between gap-4 border-t border-linha pt-3">
                    <span className="font-semibold">{churrasqueira.preco.rotulo}</span>
                    <span className="dado text-lg">{formatarMoeda(churrasqueira.preco.valor)}</span>
                  </p>
                )}
                <p className="mt-6 border-t border-linha pt-4">
                  <span className="block font-semibold">
                    {quadra.nome} + {churrasqueira.nome.toLowerCase()}
                  </span>
                  <span className="mt-1 block text-giz">
                    {POLITICA.descontoComboPercentual}% de desconto no total, com a churrasqueira começando no mesmo horário do jogo.
                  </span>
                </p>
              </article>
            )}

            <article className="bg-preto p-5 sm:p-7">
              <h3 className="titulo t-3">Como funciona</h3>
              <ol className="mt-5 grid gap-3">
                {[
                  "Escolha o dia, a duração e um horário livre.",
                  `Pague o sinal de ${POLITICA.sinalPercentual}% pelo Pix em até ${POLITICA.prazoSinalMin} minutos.`,
                  "Envie o comprovante no WhatsApp com o código da reserva.",
                  "Pague o restante no dia do jogo.",
                ].map((passo, i) => (
                  <li key={passo} className="flex gap-3">
                    <span className="numero w-5 shrink-0 text-xl text-white/40" aria-hidden>
                      {i + 1}
                    </span>
                    <span>{passo}</span>
                  </li>
                ))}
              </ol>
              <ul className="mt-6 grid gap-2 border-t border-linha pt-4 text-[0.9375rem] text-giz">
                <li>Reservas pelo site com pelo menos {formatarHoraCurta(POLITICA.antecedenciaMinimaMin)} de antecedência.</li>
                <li>Até {POLITICA.janelaMaximaDias} dias à frente.</li>
                <li>Cancelamento com devolução do sinal até {POLITICA.cancelamentoGratuitoHoras}h antes do horário.</li>
              </ul>
            </article>
          </div>

          <div className="mt-10">
            <h3 className="rotulo">Funcionamento</h3>
            <dl className="mt-3 flex flex-wrap gap-x-10 gap-y-2">
              {expedienteResumido("quadra").map((e) => (
                <div key={e.dias} className="flex gap-3">
                  <dt className="text-giz">{e.dias}</dt>
                  <dd className="dado">{e.horas}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <ArenaInterativa />

      <section aria-labelledby="titulo-duvidas" className="pb-24 lg:pb-32">
        <div className="recipiente">
          <LinhaDoMeio />
          <div className="mt-16 max-w-2xl lg:mt-20">
            <h2 id="titulo-duvidas" className="titulo t-2">
              Dúvidas sobre a locação?
            </h2>
            <p className="lead mt-5 text-giz">Time fixo toda semana, evento ou qualquer outra dúvida: fale com o clube.</p>
            <a href={whatsappDaArena()} target="_blank" rel="noopener noreferrer" className="btn btn-claro mt-8">
              <IconeWhatsApp className="h-5 w-5" />
              Conversar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
