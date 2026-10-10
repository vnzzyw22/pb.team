import type { Metadata } from "next";
import { CLUBE } from "@/lib";
import { COOKIE_PAINEL, DURACAO_SESSAO_DIAS } from "@/server/painel/sessao";
import { LinkLegal, PaginaLegal, type SecaoLegal } from "@/components/legal/PaginaLegal";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: `Quais cookies o site do ${CLUBE.nomeCompleto} usa: só o da sessão do painel interno, sem rastreamento nem publicidade.`,
};

export default function PaginaCookies() {
  const secoes: SecaoLegal[] = [
    {
      id: "o-que-sao",
      titulo: "O que são cookies",
      conteudo: (
        <p>
          Cookies são pequenos arquivos que um site grava no seu navegador para lembrar informações entre uma página e outra, como
          uma sessão aberta. Eles podem ser essenciais para o site funcionar ou servir para medir audiência e mostrar anúncios.
        </p>
      ),
    },
    {
      id: "visitantes",
      titulo: "Para quem visita o site",
      conteudo: (
        <p>
          Navegar pelas páginas públicas, buscar a turma pelo ano, pedir uma aula experimental ou reservar a {CLUBE.arena.nome}{" "}
          <strong>não grava cookies do {CLUBE.nome}</strong> no seu navegador. O site não usa ferramentas de análise de audiência,
          pixels de publicidade nem cookies de terceiros, e as fontes e imagens são servidas pelo próprio site.
        </p>
      ),
    },
    {
      id: "lista",
      titulo: "Cookies que o site usa",
      conteudo: (
        <>
          <table>
            <caption className="sr-only">Cookies usados pelo site</caption>
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Para que serve</th>
                <th scope="col">Duração</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="dado">{COOKIE_PAINEL}</td>
                <td>
                  Mantém aberta a sessão do painel interno do clube depois do login com senha. Só é criado para quem entra no painel.
                  Essencial.
                </td>
                <td className="whitespace-nowrap">{DURACAO_SESSAO_DIAS} dias ou até sair</td>
              </tr>
            </tbody>
          </table>
          <p>
            Esse cookie é estritamente necessário para o painel funcionar, é protegido contra leitura por scripts e é assinado para não
            poder ser falsificado. Por isso o site não mostra aviso de consentimento: não há cookies opcionais para aceitar ou recusar.
          </p>
        </>
      ),
    },
    {
      id: "terceiros",
      titulo: "Ao sair do site",
      conteudo: (
        <p>
          Os botões de WhatsApp e os links do Instagram levam a serviços de outras empresas. A partir dali, valem os cookies e as
          políticas desses serviços.
        </p>
      ),
    },
    {
      id: "controle",
      titulo: "Como controlar os cookies",
      conteudo: (
        <p>
          Você pode ver e apagar cookies nas configurações do seu navegador. Bloquear o cookie do painel só impede o login no painel
          do clube; o restante do site continua funcionando normalmente.
        </p>
      ),
    },
    {
      id: "mudancas",
      titulo: "Mudanças",
      conteudo: (
        <p>
          Se o site passar a usar cookies de medição de audiência ou de publicidade, esta página será atualizada antes, e esses
          cookies só serão gravados com o seu consentimento. Veja também a <LinkLegal href="/privacidade">política de privacidade</LinkLegal>.
        </p>
      ),
    },
  ];

  return (
    <PaginaLegal
      titulo="Política de cookies"
      introducao={<p>Esta página explica quais cookies o site do {CLUBE.nomeCompleto} grava no seu navegador e por quê.</p>}
      resumo={[
        "Quem visita o site não recebe cookies do clube.",
        "Não há analytics, pixels de publicidade nem cookies de terceiros.",
        `O único cookie é o da sessão do painel interno (${COOKIE_PAINEL}), criado só para quem faz login.`,
      ]}
      secoes={secoes}
    />
  );
}
