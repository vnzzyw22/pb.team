import type { Metadata } from "next";
import { CLUBE, formatarTelefone } from "@/lib";
import { LinkLegal, PaginaLegal, type SecaoLegal } from "@/components/legal/PaginaLegal";
import { urlInstagram, whatsappDoClube } from "@/components/site/navegacao";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: `Como o ${CLUBE.nomeCompleto} trata os dados pessoais enviados pelo site, conforme a LGPD.`,
};

export default function PaginaPrivacidade() {
  const whatsapp = (
    <a href={whatsappDoClube()} target="_blank" rel="noopener noreferrer">
      WhatsApp {formatarTelefone(CLUBE.contato.whatsapp)}
    </a>
  );

  const secoes: SecaoLegal[] = [
    {
      id: "controlador",
      titulo: "Quem cuida dos seus dados",
      conteudo: (
        <p>
          O controlador dos dados é o <strong>{CLUBE.nomeCompleto}</strong>, escolinha de futsal e {CLUBE.arena.nome} em{" "}
          {CLUBE.cidade}/{CLUBE.estado}. O canal de atendimento para qualquer assunto sobre dados pessoais é o {whatsapp}. Também
          atendemos pelo{" "}
          <a href={urlInstagram(CLUBE.contato.instagram)} target="_blank" rel="noopener noreferrer">
            Instagram @{CLUBE.contato.instagram}
          </a>
          .
        </p>
      ),
    },
    {
      id: "dados",
      titulo: "Quais dados coletamos",
      conteudo: (
        <>
          <ul>
            <li>
              <strong>Pedido de aula experimental:</strong> nome do responsável, WhatsApp do responsável, nome do atleta, ano de
              nascimento, turma escolhida (se houver) e observações.
            </li>
            <li>
              <strong>Reserva da {CLUBE.arena.nome}:</strong> nome, WhatsApp, dia, horário e espaço reservados, observações e os
              valores e pagamentos registrados.
            </li>
            <li>
              <strong>Consulta de reserva:</strong> só o código da reserva. A resposta mostra apenas o primeiro nome de quem
              reservou.
            </li>
            <li>
              <strong>Contato de anunciantes:</strong> os dados desse formulário não ficam salvos no site; eles vão direto na
              mensagem do WhatsApp.
            </li>
            <li>
              <strong>Dados técnicos de acesso:</strong> endereço IP, data e hora e dados do navegador, registrados pela hospedagem
              do site para segurança e para cumprir o Marco Civil da Internet (Lei 12.965/2014).
            </li>
          </ul>
          <p>
            O site não pede CPF, endereço, dados de saúde nem dados de cartão. O pagamento do sinal é feito pelo Pix, no aplicativo do
            seu banco.
          </p>
        </>
      ),
    },
    {
      id: "criancas",
      titulo: "Dados de crianças e adolescentes",
      conteudo: (
        <>
          <p>
            Os atletas da escolinha são crianças e adolescentes. Por isso, o pedido de aula experimental deve ser feito por um dos pais
            ou pelo responsável legal, que confirma no formulário que autoriza o uso dos dados do atleta, como pede o artigo 14 da
            LGPD.
          </p>
          <p>
            Do atleta, pedimos só o nome e o ano de nascimento, o mínimo para indicar a categoria e a turma certas e combinar a aula.
            Esses dados não são usados para nenhuma outra finalidade.
          </p>
          <p>
            Fotos e vídeos de atletas exibidos no site pertencem ao clube. Se você é responsável por um atleta e quer que uma imagem
            seja retirada, peça pelo {whatsapp}.
          </p>
        </>
      ),
    },
    {
      id: "finalidades",
      titulo: "Para que usamos os dados",
      conteudo: (
        <ul>
          <li>
            <strong>Combinar a aula experimental</strong> e responder ao seu pedido, com o consentimento do responsável (art. 7º, I, e
            art. 14 da LGPD).
          </li>
          <li>
            <strong>Fazer, confirmar e lembrar reservas</strong> da Arena e registrar o pagamento do sinal e do restante, para executar
            o que você contratou (art. 7º, V).
          </li>
          <li>
            <strong>Organizar a agenda e os contatos</strong> no painel interno do clube, que só pessoas autorizadas acessam.
          </li>
          <li>
            <strong>Segurança e obrigações legais</strong>, como guardar registros de acesso e documentos de pagamento (art. 7º, II e
            IX).
          </li>
        </ul>
      ),
    },
    {
      id: "compartilhamento",
      titulo: "Com quem compartilhamos",
      conteudo: (
        <>
          <ul>
            <li>
              <strong>WhatsApp:</strong> quando você envia um formulário, o site abre o WhatsApp com a mensagem pronta. A conversa
              segue as regras de privacidade do WhatsApp.
            </li>
            <li>
              <strong>Hospedagem e banco de dados:</strong> empresas que mantêm o site no ar e guardam os dados por nós. Elas podem
              ter servidores fora do Brasil; nesse caso, a transferência segue o artigo 33 da LGPD.
            </li>
            <li>
              <strong>Seu banco:</strong> o pagamento do sinal pelo Pix acontece entre você e o seu banco; o clube só confere o
              recebimento.
            </li>
            <li>
              <strong>Autoridades:</strong> apenas quando a lei ou uma ordem judicial exigir.
            </li>
          </ul>
          <p>O clube não vende, não aluga e não usa seus dados para publicidade.</p>
        </>
      ),
    },
    {
      id: "prazo",
      titulo: "Por quanto tempo guardamos",
      conteudo: (
        <ul>
          <li>Pedidos de aula experimental: enquanto forem úteis para o contato com a família, ou até você pedir a exclusão.</li>
          <li>Reservas e pagamentos: pelo tempo exigido pelas leis fiscais e de defesa do consumidor.</li>
          <li>Registros de acesso: pelo prazo do Marco Civil da Internet (6 meses).</li>
        </ul>
      ),
    },
    {
      id: "seguranca",
      titulo: "Como protegemos os dados",
      conteudo: (
        <p>
          O site usa conexão criptografada (HTTPS), o painel do clube exige senha e a sessão é guardada num cookie assinado. Só
          pessoas autorizadas do clube veem os pedidos e as reservas. Nenhum sistema é totalmente imune a falhas; se acontecer um
          incidente que possa trazer risco a você, avisaremos os titulares e a Autoridade Nacional de Proteção de Dados (ANPD).
        </p>
      ),
    },
    {
      id: "direitos",
      titulo: "Seus direitos",
      conteudo: (
        <>
          <p>Pela LGPD (art. 18), você pode pedir a qualquer momento:</p>
          <ul>
            <li>a confirmação de que tratamos seus dados e o acesso a eles;</li>
            <li>a correção de dados incompletos ou errados;</li>
            <li>a exclusão, o bloqueio ou a anonimização de dados desnecessários;</li>
            <li>a portabilidade dos dados e a informação sobre com quem os compartilhamos;</li>
            <li>a revogação do consentimento, inclusive o dado para a aula experimental.</li>
          </ul>
          <p>
            Para isso, fale com o clube pelo {whatsapp}. Você também pode reclamar à{" "}
            <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">
              ANPD
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      titulo: "Cookies",
      conteudo: (
        <p>
          Quem visita o site não recebe cookies de rastreamento nem de publicidade. O único cookie do site é o da sessão do painel
          interno do clube. Os detalhes estão na <LinkLegal href="/cookies">política de cookies</LinkLegal>.
        </p>
      ),
    },
    {
      id: "mudancas",
      titulo: "Mudanças nesta política",
      conteudo: (
        <p>
          Esta política pode ser atualizada quando o site ou a lei mudarem. A data da última atualização fica no topo da página. Veja
          também os <LinkLegal href="/termos">termos de uso</LinkLegal>.
        </p>
      ),
    },
  ];

  return (
    <PaginaLegal
      titulo="Política de privacidade"
      introducao={
        <p>
          Esta política explica quais dados pessoais o {CLUBE.nomeCompleto} recebe pelo site, para que usa, com quem compartilha e
          quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018, LGPD).
        </p>
      }
      resumo={[
        "Pedimos só o necessário para combinar a aula experimental, fazer reservas e responder pelo WhatsApp.",
        "Os dados de atletas são enviados e autorizados pelo pai, pela mãe ou pelo responsável.",
        "Não vendemos dados e não usamos cookies de rastreamento ou de publicidade.",
        "Você pode pedir acesso, correção ou exclusão dos seus dados pelo WhatsApp a qualquer momento.",
      ]}
      secoes={secoes}
    />
  );
}
