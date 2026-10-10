import type { Metadata } from "next";
import { CLUBE, formatarHoraCurta, POLITICA, RECURSOS } from "@/lib";
import { LinkLegal, PaginaLegal, type SecaoLegal } from "@/components/legal/PaginaLegal";
import { urlInstagram } from "@/components/site/navegacao";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: `Regras de uso do site do ${CLUBE.nomeCompleto}, do pedido de aula experimental e da reserva da ${CLUBE.arena.nome}.`,
};

export default function PaginaTermos() {
  const antecedencia = formatarHoraCurta(POLITICA.antecedenciaMinimaMin);
  const churrasqueira = RECURSOS.churrasqueira;

  const secoes: SecaoLegal[] = [
    {
      id: "aceite",
      titulo: "Aceite destes termos",
      conteudo: (
        <p>
          Ao usar este site, pedir uma aula experimental ou reservar um horário na {CLUBE.arena.nome}, você concorda com estes
          termos e com a <LinkLegal href="/privacidade">política de privacidade</LinkLegal>. Se não concordar, não use os
          formulários do site; você pode falar com o clube diretamente pelo WhatsApp.
        </p>
      ),
    },
    {
      id: "o-site",
      titulo: "O que o site oferece",
      conteudo: (
        <ul>
          <li>Informações sobre a escolinha, as categorias, os horários de treino, o projeto e as conquistas do clube.</li>
          <li>O pedido de aula experimental, que abre uma conversa com o clube no WhatsApp.</li>
          <li>A reserva da {CLUBE.arena.nome} com horários livres em tempo real e a consulta da reserva pelo código.</li>
          <li>O contato para empresas que querem anunciar na {CLUBE.arena.nome}.</li>
        </ul>
      ),
    },
    {
      id: "aula-experimental",
      titulo: "Aula experimental",
      conteudo: (
        <>
          <p>
            O pedido de aula experimental deve ser feito pelo pai, pela mãe ou pelo responsável legal do atleta. Ele é um primeiro
            contato: o dia, o horário e as condições da aula são combinados com o clube pelo WhatsApp. Enviar o pedido não garante
            vaga na turma.
          </p>
          <p>
            A categoria indicada pelo site segue o ano de nascimento do atleta na temporada atual. Os horários publicados podem
            mudar; vale sempre o que for combinado com o clube.
          </p>
        </>
      ),
    },
    {
      id: "reservas",
      titulo: `Reservas da ${CLUBE.arena.nome}`,
      conteudo: (
        <>
          <ul>
            <li>
              Ao pedir uma reserva, o horário fica <strong>segurado por {POLITICA.prazoSinalMin} minutos</strong> enquanto você paga
              o sinal de <strong>{POLITICA.sinalPercentual}% do total</strong> pelo Pix.
            </li>
            <li>Se o sinal não chegar no prazo, a pré-reserva expira e o horário volta a ficar livre para outras pessoas.</li>
            <li>A reserva fica confirmada depois que o clube confere o pagamento do sinal. O restante é pago no dia do jogo.</li>
            <li>
              Pelo site, é preciso reservar com pelo menos {antecedencia} de antecedência e com até {POLITICA.janelaMaximaDias} dias
              à frente.
            </li>
            <li>Valem os preços mostrados no momento do pedido; eles ficam registrados na reserva.</li>
            {churrasqueira.ativo && (
              <li>
                No combo com a {churrasqueira.nome.toLowerCase()}, ela começa no mesmo horário do jogo e o total tem{" "}
                {POLITICA.descontoComboPercentual}% de desconto.
              </li>
            )}
            <li>Os horários de treino da escolinha não ficam disponíveis para reserva.</li>
          </ul>
          <p>
            <strong>Cancelamento.</strong> Cancelando com pelo menos {POLITICA.cancelamentoGratuitoHoras} horas de antecedência, o
            sinal é devolvido. Com menos de {POLITICA.cancelamentoGratuitoHoras} horas, o sinal não é devolvido. Peça o cancelamento
            pelo WhatsApp, informando o código da reserva.
          </p>
          <p>
            Se o clube precisar fechar a Arena em um horário já confirmado (manutenção ou evento), ele avisa pelo WhatsApp e combina
            com você a remarcação ou a devolução do valor pago.
          </p>
          <p>
            Quem reserva é responsável pelo uso do espaço durante o horário reservado, pelo respeito aos horários de entrada e saída
            e pelos danos causados à quadra ou aos equipamentos.
          </p>
        </>
      ),
    },
    {
      id: "conduta",
      titulo: "Uso correto do site",
      conteudo: (
        <ul>
          <li>Informe dados verdadeiros e seus, ou de quem você é responsável.</li>
          <li>Não faça reservas em nome de outra pessoa sem autorização dela.</li>
          <li>Não tente acessar o painel do clube, sobrecarregar o site ou contornar as regras de reserva.</li>
        </ul>
      ),
    },
    {
      id: "conteudo",
      titulo: "Marca, fotos e textos",
      conteudo: (
        <>
          <p>
            O nome {CLUBE.nomeCompleto}, o escudo, as fotos, os vídeos e os textos do site pertencem ao clube ou aos seus titulares.
            Não é permitido copiar, alterar ou usar esse material com fins comerciais sem autorização.
          </p>
          <p>
            As marcas dos patrocinadores pertencem às respectivas empresas. Se você é responsável por um atleta e quer que uma foto
            ou vídeo seja retirado do site, peça pelo WhatsApp.
          </p>
        </>
      ),
    },
    {
      id: "links",
      titulo: "Links para outros serviços",
      conteudo: (
        <p>
          Os botões de contato abrem o WhatsApp, e alguns links levam ao{" "}
          <a href={urlInstagram(CLUBE.contato.instagram)} target="_blank" rel="noopener noreferrer">
            Instagram do clube
          </a>
          . Esses serviços têm regras e políticas próprias, que valem a partir do momento em que você os usa.
        </p>
      ),
    },
    {
      id: "limites",
      titulo: "Disponibilidade e responsabilidade",
      conteudo: (
        <p>
          O clube se esforça para manter o site no ar e as informações corretas, mas o site pode ficar indisponível por algum tempo
          e informações podem mudar. Erros encontrados são corrigidos assim que possível. Uma reserva só vale depois de confirmada
          como descrito acima.
        </p>
      ),
    },
    {
      id: "mudancas",
      titulo: "Mudanças nestes termos",
      conteudo: (
        <p>
          Estes termos podem ser atualizados. A data da última atualização fica no topo da página. Reservas já confirmadas seguem as
          regras que valiam quando foram feitas.
        </p>
      ),
    },
    {
      id: "lei",
      titulo: "Lei aplicável",
      conteudo: (
        <p>
          Estes termos seguem as leis brasileiras, incluindo o Código de Defesa do Consumidor. Fica eleito o foro da comarca de{" "}
          {CLUBE.cidade}/{CLUBE.estado}, sem prejuízo do direito do consumidor de propor ação no foro do seu domicílio.
        </p>
      ),
    },
  ];

  return (
    <PaginaLegal
      titulo="Termos de uso"
      introducao={
        <p>
          Estas são as regras para usar o site do {CLUBE.nomeCompleto}, escolinha de futsal em {CLUBE.cidade}/{CLUBE.estado}, pedir
          uma aula experimental e reservar a {CLUBE.arena.nome}.
        </p>
      }
      resumo={[
        "O pedido de aula experimental é um primeiro contato; a aula é combinada pelo WhatsApp.",
        `A reserva fica segurada por ${POLITICA.prazoSinalMin} minutos até o sinal de ${POLITICA.sinalPercentual}% pelo Pix e é confirmada pelo clube.`,
        `Cancelando com ${POLITICA.cancelamentoGratuitoHoras} horas ou mais de antecedência, o sinal é devolvido.`,
        "Nome, escudo, fotos e textos do site são do clube e não podem ser usados sem autorização.",
      ]}
      secoes={secoes}
    />
  );
}
