import { CLUBE, type Conquista } from "@/lib";
import { MarcaX } from "@/components/grafismos";

interface FaixaConquistasProps {
  /** Tamanho dos números: compacto na Home, cheio na página de conquistas. */
  tamanho?: "faixa" | "pagina";
}

/**
 * Placar de conquistas da bio do clube. Quem tem contagem ("4×") vira número
 * grande em neon; as demais entram numa lista logo abaixo.
 */
export function FaixaConquistas({ tamanho = "faixa" }: FaixaConquistasProps) {
  const conquistas: readonly Conquista[] = CLUBE.conquistas;
  const contadas = conquistas.filter((c) => c.vezes);
  const demais = conquistas.filter((c) => !c.vezes);
  const numero = tamanho === "pagina" ? "text-[5.25rem] sm:text-[7rem] lg:text-[11rem]" : "text-[4.25rem] sm:text-[6rem] lg:text-[9rem]";

  return (
    <div>
      <ul className="grid grid-cols-3 gap-x-3 sm:gap-x-6 lg:gap-x-10">
        {contadas.map((c) => (
          <li key={c.titulo} className="border-t border-linha-forte pt-5">
            <p className={`numero flex items-start text-neon ${numero}`} aria-hidden>
              {c.vezes}
              {/* o X do escudo no lugar do sinal de vezes */}
              <MarcaX espessura={2.6} className="ml-[0.06em] mt-[0.04em] h-[0.3em] w-[0.3em] shrink-0" />
            </p>
            <p className="mt-4 text-[0.9375rem] font-semibold leading-snug sm:text-lg">
              <span className="sr-only">{c.vezes} vezes: </span>
              {c.titulo}
            </p>
            {c.detalhe && <p className="mt-1 text-sm text-giz sm:text-base">{c.detalhe}</p>}
          </li>
        ))}
      </ul>

      {demais.length > 0 && (
        <ul className="mt-10 grid gap-x-10 gap-y-4 border-t border-linha pt-6 sm:grid-cols-2">
          {demais.map((c) => (
            <li key={c.titulo} className="flex items-baseline gap-3">
              <MarcaX className="h-3 w-3 shrink-0 translate-y-[-0.05em] text-giz" />
              <p className="text-[1.0625rem] leading-snug">
                <span className="font-semibold">{c.titulo}</span>
                {c.detalhe && <span className="text-giz">, {c.detalhe}</span>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
