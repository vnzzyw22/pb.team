import type { Metadata } from "next";
import { CLUBE, fotoPorId, historicoPublico, torneiosPublicos, type Conquista, type ResultadoPublico } from "@/lib";
import { FaixaConquistas } from "@/components/conquistas/FaixaConquistas";
import { FotoClube } from "@/components/FotoClube";
import { MarcaX } from "@/components/grafismos";
import { ChamadaFinal } from "@/components/site/ChamadaFinal";

export const metadata: Metadata = {
  title: "Conquistas",
  description: `Títulos e campanhas do ${CLUBE.nomeCompleto}: ${(CLUBE.conquistas as readonly Conquista[])
    .map((c) => (c.vezes ? `${c.vezes}x ${c.titulo}` : c.titulo))
    .join(", ")}.`,
};

interface Grupo {
  rotulo: string;
  resultados: ResultadoPublico[];
}

/** Agrupa por ano (mais recente primeiro); os sem ano confirmado vão para o fim. */
function agrupar(historico: ResultadoPublico[]): Grupo[] {
  const grupos: Grupo[] = [];
  for (const r of historico.filter((h) => h.ano !== undefined)) {
    const rotulo = String(r.ano);
    const grupo = grupos.find((g) => g.rotulo === rotulo);
    if (grupo) grupo.resultados.push(r);
    else grupos.push({ rotulo, resultados: [r] });
  }
  grupos.sort((a, b) => Number(b.rotulo) - Number(a.rotulo));
  const semAno = historico.filter((h) => h.ano === undefined);
  if (semAno.length) {
    grupos.push({
      rotulo: semAno.every((r) => r.titulo) ? "Outros títulos e pódios" : "Outros resultados",
      resultados: semAno,
    });
  }
  return grupos;
}

export default function PaginaConquistas() {
  const grupos = agrupar(historicoPublico());
  const torneios = torneiosPublicos();
  const premiacao = fotoPorId("premiacao-equipe-rosa");

  return (
    <>
      <section className="recipiente pb-14 pt-28 lg:pb-20 lg:pt-40">
        <h1 className="titulo t-1">Conquistas</h1>
        <p className="lead medida mt-6 text-giz">
          Títulos e campanhas das equipes de base do {CLUBE.nome} desde {CLUBE.fundacao}.
        </p>
      </section>

      <section aria-label="Resumo das conquistas" className="recipiente pb-20 lg:pb-28">
        <FaixaConquistas tamanho="pagina" />
      </section>

      {/* Linha do tempo */}
      <section aria-labelledby="titulo-linha" className="border-t border-linha">
        <div className="recipiente secao">
          <h2 id="titulo-linha" className="titulo t-2">
            Linha do tempo
          </h2>

          <ol className="mt-12 lg:mt-16">
            {grupos.map((g) => (
              <li key={g.rotulo} className="grid gap-x-12 lg:grid-cols-12">
                <h3
                  className={`titulo pb-6 lg:col-span-3 lg:pb-0 lg:pt-1 ${
                    /^\d+$/.test(g.rotulo) ? "text-[3.5rem] lg:text-[5rem]" : "t-3"
                  }`}
                >
                  {g.rotulo}
                </h3>
                <ol className="relative ml-2 border-l border-linha-forte pb-14 lg:col-span-9 lg:ml-0">
                  {g.resultados.map((r) => (
                    <ItemLinhaDoTempo key={`${r.competicao}-${r.ano ?? ""}`} resultado={r} />
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Torneios disputados */}
      {torneios.length > 0 && (
        <section aria-labelledby="titulo-torneios" className="border-t border-linha">
          <div className="recipiente py-16 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:py-24">
            <h2 id="titulo-torneios" className="titulo t-3 lg:col-span-3">
              Torneios disputados
            </h2>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-4 lg:col-span-9 lg:mt-0">
              {torneios.map((t) => (
                <li key={t} className="flex items-baseline gap-3">
                  <MarcaX className="h-3 w-3 shrink-0 text-giz" />
                  <span className="text-xl font-semibold">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {premiacao && (
        <figure className="border-t border-linha">
          <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/8]">
            <FotoClube id={premiacao.id} sizes="100vw" />
          </div>
          {premiacao.legenda && <figcaption className="recipiente pt-5 text-giz">{premiacao.legenda}</figcaption>}
        </figure>
      )}

      <div className="pt-20 lg:pt-28">
        <ChamadaFinal titulo="A próxima campanha começa no treino" />
      </div>
    </>
  );
}

function ItemLinhaDoTempo({ resultado: r }: { resultado: ResultadoPublico }) {
  const foto = r.fotoId ? fotoPorId(r.fotoId) : undefined;
  return (
    <li className="relative pb-10 pl-7 last:pb-0 sm:pl-10">
      {/* peças da prancheta na linha: X (do escudo) para título ou pódio, O para campanha */}
      <span aria-hidden className="absolute -left-[0.6875rem] top-1 grid h-[1.375rem] w-[1.375rem] place-items-center bg-preto">
        {r.titulo ? (
          <MarcaX espessura={2.2} className="h-3.5 w-3.5" />
        ) : (
          <span className="h-3.5 w-3.5 rounded-full border-2 border-branco" />
        )}
      </span>
      <div className={foto ? "grid gap-6 sm:grid-cols-[1fr_14rem] sm:items-start lg:grid-cols-[1fr_17rem]" : ""}>
        <div>
          <p className="titulo t-3">{r.competicao}</p>
          {r.categoria && <p className="mt-2 text-giz">{r.categoria}</p>}
          <p className={`mt-3 text-lg ${r.titulo ? "font-semibold text-branco" : "text-giz"}`}>
            {r.titulo && <span className="sr-only">Título ou pódio: </span>}
            {r.colocacao}
          </p>
        </div>
        {foto && (
          <div
            className="relative w-full max-w-[17rem] overflow-hidden"
            style={{ aspectRatio: `${foto.largura} / ${foto.altura}` }}
          >
            <FotoClube id={foto.id} sizes="(min-width: 640px) 17rem, 80vw" />
          </div>
        )}
      </div>
    </li>
  );
}
