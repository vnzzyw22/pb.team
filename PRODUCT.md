# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Principal:** pais e responsáveis de crianças e jovens de 4 a 17 anos em Maringá/PR. Chegam quase sempre pelo link da bio do Instagram @pbteamfutsal, no celular, e querem saber se o filho tem turma, em que horário, e se o projeto é sério. A ação que importa é agendar a aula experimental.
- **Secundários:** quem quer alugar a quadra da Arena PB Team (e a churrasqueira) e empresas interessadas em anunciar dentro da Arena.
- **Interno (futuro):** o dono, Pietro Bettin, no painel privado de reservas e contatos.

## Product Purpose

Site da escolinha de futsal PB Team (desde 2019) e sistema de reservas da Arena PB Team. Para os pais, o site precisa dizer em segundos qual é a categoria do filho pelo ano de nascimento, mostrar os horários reais e levar ao pedido de aula experimental pelo WhatsApp. Sucesso: mais pedidos de aula experimental qualificados (com categoria e turma certas) e reservas da Arena sem troca manual de mensagens.

## Positioning

Um projeto de base com um técnico que dá nome ao time (PB = Pietro Bettin), formado e licenciado, que já levou as equipes a títulos estaduais e a fases finais do Sul-Brasileiro, e que quer formar atletas da base até o time adulto em Maringá. Não é recreação infantil nem academia: é formação esportiva com resultados, feita junto com as famílias.

## Operating Context

- Tráfego mobile vindo do Instagram; decisão tomada pelos pais, muitas vezes conversando entre si.
- Contato real acontece no WhatsApp do Pietro (mensagens prontas geradas em `@/lib`).
- Treinos em horários fixos por categoria e turma; a quadra é a mesma usada na locação.

## Capabilities and Constraints

- Regra de negócio e conteúdo em `src/lib` (importar sempre de `@/lib`); a interface não reimplementa regra nem escreve dados nos componentes.
- `src/lib` e `src/server` pertencem a outra pessoa nesta divisão de trabalho; pedidos de lógica vão para `NOTAS-PARA-LOGICA.md`.
- Itens marcados com `CONFIRMAR`/`confirmar` nos dados não aparecem como fato no site.
- Aula experimental: por enquanto abre o WhatsApp; depois será ligada ao banco.
- Arena: fluxo de reserva online ainda não implementado na interface.
- Em aberto: valor oficial do verde (amostrado ~#BCD00E), endereço da Arena, preços reais, autorização de uso de imagem das fotos com menores.

## Brand Commitments

- Nome: PB Team / PB Team Futsal. Escudo: círculo preto, "P" e "B" separados por um X branco, bola no topo, "2019" embaixo.
- Base preta e branca do uniforme e da quadra; verde-limão neon reservado para ações, horários e números de conquistas (definido no CLAUDE.md).
- Tom mais limpo e premium que os posts do Instagram; as fotos reais carregam a emoção.
- O site não pode parecer: post de Instagram (poluído, selos gritando), academia genérica, clube profissional distante das famílias, ou recreação infantil sem seriedade esportiva.

## Evidence on Hand

- Fotos reais em `public/fotos/` (catálogo `FOTOS`), vídeo vertical `public/videos/hero-jogo.mp4` com pôster.
- Conquistas da bio (`CLUBE.conquistas`) e linha do tempo (`CLUBE.historico`), parte dela ainda a confirmar.
- Técnico: formação (UEM, pós em futsal, licenças C e B da CBFS), fotos e citação.
- Patrocinadores confirmados: VS Viagens, GRP Construtora, Lavup, Conceito Esporte (sem logos ainda).
- Não existem depoimentos, números de alunos, preços reais nem endereço confirmado: não inventar.

## Product Principles

1. Responder primeiro a pergunta do pai: "tem turma para o meu filho, e quando?".
2. Provar com fatos verificáveis (formação do técnico, títulos, fotos reais), nunca com adjetivos.
3. Seriedade esportiva com calor humano: o time é das famílias.
4. Cada ação termina numa conversa de WhatsApp já preenchida.

## Accessibility & Inclusion

Mobile first, validado em 320, 375, 390 e 430 px. Contraste alto sobre o preto, foco visível, `prefers-reduced-motion` respeitado (vídeo de fundo vira o pôster).
