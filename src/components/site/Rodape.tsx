import Link from "next/link";
import { CLUBE, formatarTelefone } from "@/lib";
import { Escudo } from "@/components/Escudo";
import { IconeInstagram, IconeWhatsApp } from "@/components/grafismos";
import { ITENS_MENU, urlInstagram, whatsappDaArena, whatsappDoClube } from "./navegacao";

export function Rodape() {
  const ano = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-linha bg-preto">
      <div className="recipiente relative grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <Escudo contorno className="h-20 w-20" />
          <p className="titulo mt-6 text-[2.5rem]">{CLUBE.nomeCompleto}</p>
          <p className="mt-3 text-giz">
            Escolinha de futsal em {CLUBE.cidade}/{CLUBE.estado} desde {CLUBE.fundacao}.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
          <div>
            <h2 className="rotulo text-branco">Fale com a gente</h2>
            <ul className="mt-4 grid gap-1 text-giz">
              <li>
                <a
                  href={whatsappDoClube()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2.5 hover:text-branco"
                >
                  <IconeWhatsApp className="h-5 w-5 shrink-0" />
                  <span className="dado">{formatarTelefone(CLUBE.contato.whatsapp)}</span>
                </a>
              </li>
              <li>
                <a
                  href={urlInstagram(CLUBE.contato.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2.5 hover:text-branco"
                >
                  <IconeInstagram className="h-5 w-5 shrink-0" />@{CLUBE.contato.instagram}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="rotulo text-branco">{CLUBE.arena.nome}</h2>
            <p className="mt-4 text-giz">{CLUBE.arena.descricao}.</p>
            {CLUBE.arena.endereco && <p className="mt-2 text-giz">{CLUBE.arena.endereco}</p>}
            <ul className="mt-3 grid gap-1">
              <li>
                <Link href="/arena" className="link-jogada inline-flex min-h-11 items-center">
                  Ver horários e preços
                </Link>
              </li>
              <li>
                <a
                  href={whatsappDaArena()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-giz hover:text-branco"
                >
                  Dúvidas sobre a locação
                </a>
              </li>
            </ul>
          </div>

          <nav aria-label="Rodapé">
            <h2 className="rotulo text-branco">O clube</h2>
            <ul className="mt-4 grid gap-1 text-giz">
              {ITENS_MENU.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex min-h-11 items-center hover:text-branco">
                    {item.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="recipiente relative flex flex-col gap-2 border-t border-linha pb-28 pt-6 text-sm text-giz sm:flex-row sm:items-center sm:justify-between lg:pb-8">
        <p>
          © {ano} {CLUBE.nomeCompleto}
        </p>
        <Link href="/painel/entrar" className="inline-flex min-h-11 items-center hover:text-branco">
          Painel do clube
        </Link>
      </div>
    </footer>
  );
}
