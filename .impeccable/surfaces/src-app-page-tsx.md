---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app"]
---

Escopo: site público do PB Team (Home, Escolinha, O projeto, Conquistas, Patrocinadores, Arena) e painel do dono. Modo da Home e das páginas públicas: Persuade. Arena (reserva) e painel: Operate.

Público e tarefa: pais vindos da bio do Instagram, no celular, querem achar a turma do filho pelo ano e agendar a aula experimental; quem aluga reserva a quadra sem troca de mensagens; o dono opera a agenda no celular.

Provas: técnico formado e licenciado (UEM, pós, CBFS C e B), títulos (CLUBE.conquistas, historicoPublico), base até o adulto (CLUBE.missao, citação), famílias (foto da equipe com as famílias). Evitar: post de Instagram, academia genérica, clube distante, infantil demais.

## Direction contract

THESIS: O site é a prancheta do técnico: a quadra desenhada em traço branco sobre o preto, marcações em X (do escudo) e setas de jogada conduzindo o olhar até a ação. Recusa o padrão da categoria (foto de ação + grade de cards iguais + faixa de estatísticas).

OWN-WORLD: preto puro de prancheta; linhas de quadra com medidas oficiais a 10–14% de branco; títulos em Archivo condensado 900, caixa alta, como letra de marcador; texto em Archivo normal; marcas em Archivo expandido leve. X do escudo como marcador de lista e divisor; seta tracejada = deslocamento (links), seta cheia = jogada que leva à ação. Neon #BCD00E só em botões de agendar/reservar, horários e números de conquistas. Cantos retos, sem sombras decorativas, sem cards empilhados.

STORY: em segundos o pai entende que é escolinha séria de futsal em Maringá, acha a turma pelo ano, confia (técnico, títulos, famílias) e agenda pelo WhatsApp; quem aluga reserva e paga o sinal; o dono confirma pelo painel.

FIRST VIEWPORT: celular: vídeo vertical em tela cheia, escurecido na base; topo com escudo e Menu; na base, selo "Matrículas abertas", título em quatro linhas (~18vw) e uma seta de jogada desenhada que desce do título até o botão neon "Agende uma aula experimental" (largura total), com "Reserve a Arena" contornado embaixo. Desktop: título à esquerda sobre a quadra horizontal desenhada; vídeo 9:16 à direita no formato nativo. Ação principal sempre visível sem rolar.

FORM: prancheta tática do técnico, posição 1 da lista ordenada (escolhida pelo usuário como IMPECCABLE’S PICK); seed c271e22c. Interação assinatura: a seta da jogada se desenha uma vez ao abrir a Home; na Escolinha, a categoria encontrada pelo ano é circulada com traço de marcador. Movimento só com stroke-dashoffset/opacity/transform, uma vez por página, desligado com reduced-motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
