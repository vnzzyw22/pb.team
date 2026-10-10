---
name: PB Team Futsal
description: Escolinha de futsal e Arena em Maringá, desenhadas como a prancheta do técnico.
colors:
  preto: "#000000"
  feltro: "#0e0e0e"
  friso: "#181818"
  linha: "rgb(255 255 255 / 0.14)"
  linha-forte: "rgb(255 255 255 / 0.3)"
  branco: "#ffffff"
  giz: "#a8a8a8"
  neon: "#bcd00e"
  neon-vivo: "#d3e832"
  alerta: "#ff8a7a"
  ok: "#8fd8a8"
  grafico-treino: "#4a72b8"
  grafico-livre: "#8c9d00"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, Arial, sans-serif"
    fontSize: "clamp(3.5rem, 18vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "0.004em"
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "Archivo, Arial Narrow, Arial, sans-serif"
    fontSize: "clamp(2.5rem, 12.5vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "0.004em"
    fontVariation: "'wdth' 62"
  headline-sm:
    fontFamily: "Archivo, Arial Narrow, Arial, sans-serif"
    fontSize: "clamp(2.5rem, 10.5vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "0.004em"
    fontVariation: "'wdth' 62"
  title:
    fontFamily: "Archivo, Arial Narrow, Arial, sans-serif"
    fontSize: "clamp(1.625rem, 6vw, 2.25rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "0.004em"
    fontVariation: "'wdth' 62"
  title-sm:
    fontFamily: "Archivo, Arial Narrow, Arial, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.004em"
    fontVariation: "'wdth' 62"
  body:
    fontFamily: "Archivo, Arial Narrow, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  lead:
    fontFamily: "Archivo, Arial Narrow, Arial, sans-serif"
    fontSize: "clamp(1.0625rem, 2.4vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Archivo, Arial Narrow, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 650
    lineHeight: 1.3
  dado:
    fontFamily: "Archivo, Arial Narrow, Arial, sans-serif"
    fontWeight: 650
    fontFeature: "'tnum'"
    fontVariation: "'wdth' 80"
  numero:
    fontFamily: "Archivo, Arial Narrow, Arial, sans-serif"
    fontWeight: 900
    lineHeight: 0.82
    fontFeature: "'tnum', 'lnum'"
    fontVariation: "'wdth' 62"
  marca:
    fontFamily: "Archivo, Arial Narrow, Arial, sans-serif"
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: "-0.012em"
    fontVariation: "'wdth' 125"
rounded:
  reto: "0px"
  circulo: "999px"
  grafico: "2px"
spacing:
  margem-celular: "1rem"
  margem-tablet: "1.5rem"
  margem-desktop: "2.5rem"
  recipiente: "78rem"
  secao: "5rem"
  secao-desktop: "7.5rem"
components:
  button-neon:
    backgroundColor: "{colors.neon}"
    textColor: "{colors.preto}"
    rounded: "{rounded.reto}"
    padding: "12px 22px"
    height: "52px"
  button-neon-hover:
    backgroundColor: "{colors.neon-vivo}"
    textColor: "{colors.preto}"
  button-contorno:
    backgroundColor: "rgb(0 0 0 / 0.4)"
    textColor: "{colors.neon}"
    rounded: "{rounded.reto}"
    padding: "12px 22px"
    height: "52px"
  button-claro:
    backgroundColor: "transparent"
    textColor: "{colors.branco}"
    rounded: "{rounded.reto}"
    padding: "12px 22px"
    height: "52px"
  button-sobrio:
    backgroundColor: "{colors.friso}"
    textColor: "{colors.branco}"
    rounded: "{rounded.reto}"
    padding: "8px 16px"
    height: "44px"
  button-perigo:
    backgroundColor: "transparent"
    textColor: "{colors.alerta}"
    rounded: "{rounded.reto}"
    padding: "8px 16px"
    height: "44px"
  entrada:
    backgroundColor: "{colors.feltro}"
    textColor: "{colors.branco}"
    rounded: "{rounded.reto}"
    padding: "12px 14px"
    height: "52px"
  ficha:
    backgroundColor: "transparent"
    textColor: "{colors.branco}"
    rounded: "{rounded.reto}"
    height: "76px"
  ficha-marcada:
    backgroundColor: "{colors.neon}"
    textColor: "{colors.preto}"
  quadro:
    backgroundColor: "{colors.preto}"
    rounded: "{rounded.reto}"
    padding: "20px"
  quadro-cheio:
    backgroundColor: "{colors.feltro}"
    rounded: "{rounded.reto}"
    padding: "20px"
  aviso:
    backgroundColor: "{colors.feltro}"
    textColor: "{colors.branco}"
    rounded: "{rounded.reto}"
    padding: "16px 18px"
---

# Design System: PB Team Futsal

## Overview

**Creative North Star: "A prancheta do técnico"**

O site é a prancheta que o técnico usa no banco: preto puro, a quadra desenhada em traço branco fino nas medidas oficiais, o X do escudo marcando o que importa e a seta da jogada levando o olho até a ação. Tudo o que a pessoa lê é giz sobre preto; a única cor que acende é o verde-limão das artes "Horário de treino", e ela só aparece onde há uma jogada a fazer (agendar, reservar, pagar o sinal), um horário ou um número de conquista.

A densidade é de prancheta, não de revista: listas em linhas finas, títulos condensados enormes como letra de marcador, fotos reais do clube cortadas em retângulos retos. O site recusa o padrão da categoria esportiva: foto de ação com grade de cards iguais e faixa de estatísticas. O painel do dono herda o mesmo material numa versão sóbria, de operação, em que o neon fica quase só no sinal pendente.

O movimento é desenho, não animação: a seta da jogada se traça uma vez na Home e o círculo de marcador se fecha em volta da categoria encontrada na Escolinha. Com "reduzir movimento", tudo já está desenhado.

**Key Characteristics:**
- Preto puro (#000) como prancheta; nunca cinza-escuro de fundo.
- Uma família (Archivo variável) com o eixo de largura como hierarquia: 62 nos títulos, 80 nos dados, 100 no texto, 125 nas marcas.
- Neon raro e funcional: ação, horário, sinal e conquista.
- Traço de quadra (linha 14%) no lugar de sombra, card e cor de fundo.
- Cantos retos em tudo o que é superfície; círculos só em controles flutuantes, pontos de status e no "O" da linha do tempo.
- Grafismos desenhados no código (quadra, X, seta, círculo de marcador), sempre aria-hidden e na cor do texto.

## Colors

Preto e branco de prancheta, um neon de marcador e dois tons de estado; o painel acrescenta um par de cores só para gráfico.

### Primary
- **Verde-limão de marcador** (neon): botões de agendar e reservar, ficha marcada na reserva, contorno do foco de teclado, seleção de texto, cursor dos campos. Também acende horários (turmas da Escolinha, horários livres da Arena), números de conquista e o sinal da reserva (valor, prazo em contagem regressiva, status "Aguardando sinal" e a contagem de pendentes no painel), porque o sinal é a ação que falta fazer. Amostrado das artes do clube; o valor oficial ainda deve ser confirmado.
- **Neon aceso** (neon-vivo): só o hover do botão neon.

### Neutral
- **Preto de prancheta** (preto): fundo de todas as páginas, do painel e dos quadros.
- **Feltro** (feltro): fundo de campos, quadros cheios (resumo da reserva) e avisos.
- **Friso** (friso): botão sóbrio do painel e esqueletos de carregamento.
- **Traço de quadra** (linha): divisórias, linhas de lista, bordas de quadro.
- **Traço forte** (linha-forte): bordas que precisam ser vistas (fichas, avisos, linha da linha do tempo, LinhaDoMeio).
- **Branco** (branco): títulos, texto principal, seta da jogada, círculo de marcador.
- **Giz** (giz): texto secundário, rótulos de dado, links de navegação inativos (8,9:1 sobre o preto).

### Estado
- **Coral de alerta** (alerta): erro de campo, borda de aviso de erro, botão de perigo, status cancelada/expirada.
- **Menta de confirmação** (ok): borda do aviso de sucesso.

### Gráfico (só painel)
- **Azul de treino** (grafico-treino) e **oliva livre** (grafico-livre): par validado contra o fundo #000 (luminosidade, croma, separação para daltonismo e contraste). Treino da escolinha × horas livres para locação, no gráfico de ocupação e na linha do tempo do dia. O oliva é escuro de propósito para não ser lido como o neon de ação.

### Named Rules
**A Regra do Neon.** Se não é ação de agendar, reservar ou pagar o sinal, horário, prazo do sinal ou número de conquista, não é neon. Foco de teclado é neon porque é ação.

**A Regra da Prancheta Preta.** O fundo é #000. Profundidade vem de feltro (#0e0e0e) e traço, nunca de cinza médio ou gradiente decorativo.

## Typography

**Display Font:** Archivo variável, largura 62 (com Arial Narrow, Arial)
**Body Font:** Archivo variável, largura 100
**Label/Mono Font:** Archivo variável, largura 80 com algarismos tabulares (dados) e largura 125 peso 300 (marcas)

**Character:** Uma família só, esticada e espremida como letra de marcador numa prancheta: títulos condensados pesados em caixa alta, texto aberto e calmo, dados em meia largura com números alinhados.

### Hierarchy
- **Display** (900, clamp 3.5–6rem, 0,88): só o título da Home, quebrado linha a linha no código.
- **Headline** (900, clamp 2.5–6rem, 0,88): títulos de página e da chamada final.
- **Headline pequeno** (900, clamp 2.5–4.5rem): títulos de seção.
- **Title** (900, clamp 1.625–2.25rem, 0,95): categorias, competições, etapas da reserva, itens de formação.
- **Title pequeno** (900, 1.375rem, 1): nomes de categoria em lista curta.
- **Body** (400, 1rem, 1,55): texto corrido, até 62ch.
- **Lead** (400, clamp 1.0625–1.25rem, 1,55): abertura logo abaixo do título, quase sempre em giz.
- **Label** (650, 0.9375rem, 1,3): rótulos de campo e de bloco, em caixa de frase.
- **Dado** (650, largura 80, tabular): horários, preços, telefones, códigos, datas da ficha.
- **Número** (900, largura 62, 0,82, tabular): números de conquista (4,25–11rem), contagem do sinal, números de etapa.
- **Marca** (300, largura 125): nomes de patrocinadores sem logo (1.75–2.75rem).

### Named Rules
**A Regra da Largura.** Hierarquia se faz com o eixo de largura e o peso, não com outra família nem com itálico.

**A Regra do Título Limpo.** Sem rótulo em caixa alta acima do título, sem palavra colorida dentro do título, sem itálico de destaque. Títulos usam `text-wrap: balance`; parágrafos, `pretty`.

## Layout

Mobile first, validado em 320, 375, 390 e 430 px e no desktop. O recipiente vai até 78rem, com margem lateral de 1rem no celular, 1.5rem a partir de 640px e 2.5rem a partir de 1024px. Seções respiram 5rem no celular e 7.5rem no desktop, com mais espaço acima do título que abaixo. No desktop, a grade é de 12 colunas com 3rem de vão: título ou rótulo em 3–5 colunas, conteúdo no resto.

Listas são linhas, não cards: cada item é uma faixa separada por traço de quadra (categorias e horários, patrocinadores, formação do técnico, recursos da Arena, linha do tempo). Tabelas comparativas (preços da Arena, números do resumo no painel) usam células divididas por traço de 1px, sem caixas soltas.

No celular, a Home é vídeo vertical em tela cheia com título no alto, jogador livre no meio e seta descendo até os botões, que ocupam a largura toda. No desktop, título à esquerda, quadra horizontal ao fundo e vídeo 9:16 à direita. A ação principal fica visível sem rolar. O cabeçalho é fixo (64px no celular, 80px no desktop), transparente sobre o vídeo da Home e preto com traço inferior no resto; `scroll-padding-top` de 5.5rem.

**A Regra das Linhas.** Coleções de itens parecidos viram linhas com traço entre elas. Grade de cards iguais é a recusa central desta direção.

## Elevation & Depth

Plano. A profundidade vem de três camadas tonais (preto, feltro, friso) e do traço de quadra. Não há sombra decorativa em quadros, botões ou fotos. Sobre o vídeo da Home, a legibilidade vem de degradês pretos (scrim) e de uma sombra de texto suave no título, só no celular.

### Shadow Vocabulary
- **Flutuante** (`box-shadow: 0 8px 24px rgb(0 0 0 / 0.6)`): só elementos fixos que passam por cima do conteúdo ao rolar (aviso do painel).
- **Legibilidade sobre vídeo** (`text-shadow: 0 2px 18px rgb(0 0 0 / 0.45)`): título da Home no celular; desligada no desktop.

### Named Rules
**A Regra do Traço.** Se uma área precisa ser separada, desenhe a linha da quadra. Sombra só existe para o que flutua de fato sobre a página.

## Shapes

Cantos retos (0) em botões, campos, fichas, quadros, avisos, fotos e chips de status, como ímãs de prancheta. O círculo (999px) é reservado ao que não é superfície: botão de pausar o vídeo (44px), pontos de status (8px, como o do selo "Matrículas abertas") e o "O" de campanha na linha do tempo. Barras e legenda do gráfico do painel têm 2px na ponta, convenção de leitura de dado. Bordas são de 1px (campo, quadro, aviso) ou 1.5px (botão); a ficha marcada vira bloco neon cheio.

Grafismos recorrentes, todos SVG no código e decorativos:
- **Quadra**: quadra de futsal nas medidas oficiais (40×20 m), vertical no celular e horizontal no desktop, traço que não engrossa com a escala. Como fundo, 6–14% de branco atrás do conteúdo; como imagem da própria Arena, 22–28%.
- **Escudo**: desenhado em caminhos (P, B, X, bola e ano de fundação); cabeçalho, rodapé, painel, citação, ícone do site e imagem de compartilhamento.
- **MarcaX**: o X do escudo como marcador de lista (giz em listas secundárias, branco em listas de prova).
- **LinhaDoMeio**: linha do meio com o círculo central, divisor que abre a chamada final e a seção de dúvidas.
- **SetaJogada**: linha cheia desenhada à mão com ponta, proporção 10:3, que leva do título ao botão.
- **CirculoMarcador**: o laço de marcador em volta da categoria encontrada, medido em em a partir do título.

## Components

### Buttons
Retos e firmes como ímãs de prancheta; o rótulo diz o que acontece.
- **Shape:** cantos retos (0), borda de 1.5px, altura mínima de 52px (44px no pequeno), peso 750 em largura 88.
- **Neon:** ação principal (agendar, reservar, confirmar sinal, enviar comprovante). Preto sobre neon; hover para neon aceso.
- **Contorno:** ação neon secundária ao lado da principal ("Reserve a Arena"). Borda e texto neon sobre preto 40%; hover com neon a 14%.
- **Claro:** ações neutras do site (buscar turma, copiar Pix, WhatsApp). Borda branca 42%; hover com borda branca e fundo branco 6%.
- **Sóbrio:** ações do painel. Fundo friso com traço forte; hover com borda branca 55%.
- **Perigo:** cancelar e apagar. Borda coral 60% e texto coral; hover com coral 8%.
- **Estados:** hover só em dispositivos com mouse; pressionado desce 1px; desabilitado em 45%; ocupado com `aria-busy`, 85% e o ícone Carregando girando. Transições de 0,18s na curva de saída.

### Links de jogada
- **Style:** branco, peso 650, sublinhado tracejado de 1.5px a 55% (o deslocamento na prancheta), afastado 0.38em; no hover vira linha cheia branca. Alvo mínimo de 44px. Sem seta ou glifo no fim.

### Chips (fichas da reserva)
- **Style:** rádio escondido dentro de um rótulo com borda de traço forte; dia (72×68px, dia da semana + data em dado), duração (56px de altura) e horário (76px, horário em neon, fim em giz, preço em dado).
- **State:** marcada vira bloco neon cheio com texto preto; foco desenha contorno neon afastado 2px; desabilitada (dia fechado) em 35%. Fileira de dias rola na horizontal no celular com encaixe.

### Etapas da reserva
- **Style:** cada passo é um fieldset aberto por traço de quadra, com o número de etapa em Número branco 35% e o título em Title. As etapas aparecem em sequência conforme a escolha anterior; o resumo fica num quadro cheio ao lado dos dados.

### Cards / Containers (Quadros)
- **Corner Style:** reto (0).
- **Background:** quadro em preto; quadro cheio em feltro.
- **Shadow Strategy:** nenhuma (ver Elevation & Depth).
- **Border:** traço de quadra de 1px.
- **Internal Padding:** 20px no celular, 28–40px no desktop.
- Usados para um resultado ou objeto único (resposta da busca, confirmação da reserva, técnico, reserva no painel), nunca para coleções do site público.

### Inputs / Fields (Campo)
- **Style:** fundo feltro, borda branca 26%, cantos retos, 52px de altura, texto de 16px (sem zoom no iOS), placeholder #8c8c8c. `select` com seta desenhada; `textarea` a partir de 96px.
- **Rótulo:** sempre visível acima, em Label; "(opcional)" em giz.
- **Focus:** borda e contorno de 1px neon.
- **Error / Disabled:** borda coral com `aria-invalid`; mensagem abaixo em coral com ícone de círculo, ligada por `aria-describedby`; ajuda em giz quando não há erro. Desabilitado em 50%.
- **ResumoErros:** aviso de erro que recebe o foco depois de um envio com erro, com título em coral e cada item como link tracejado para o campo.

### Avisos
- **Style:** feltro, borda de traço forte, 16×18px de respiro. Erro com borda coral 55%; sucesso com borda menta 50%. Texto continua branco e giz; a cor fica na borda.
- **Comportamento:** `role="alert"` para erro, `role="status"`/`aria-live` para sucesso. No painel, o aviso de ação concluída flutua no canto inferior por 7s com botão Fechar.

### Navigation
- **Site:** escudo + nome em título condensado. Desktop: links em 15px peso 600, giz → branco; página atual branca com sublinhado de 2px. Botão neon pequeno "Agendar aula" à direita. Celular: botão "Menu" com ícone de duas linhas; o menu ocupa a tela em preto com quadra a 7%, itens em título de 2.75rem separados por traço, os dois botões de ação e os contatos ao pé. Foco preso no menu aberto, Esc fecha.
- **Painel:** barra preta fixa com escudo e "Painel"; abas roláveis de 48px com sublinhado branco de 2px na ativa.

### Placar de conquistas
Números de conquista em Número neon, com o X do escudo no lugar do sinal de vezes (o multiplicador "4×" vira "4" + MarcaX a 0,3em). Cada número fica sobre um traço forte, em três colunas mesmo no celular. Conquistas sem contagem vão para uma lista de linhas com X em giz.

### Linha do tempo de conquistas
Anos em título grande à esquerda; à direita, uma linha vertical de traço forte com peças da prancheta: X (do escudo) para título ou pódio, O (círculo vazado branco) para campanha. Colocação em branco semibold quando é título, em giz quando é campanha.

### A jogada (assinatura da Home)
A SetaJogada desce sobre o vídeo e termina no botão neon. O título sobe linha a linha (0,8s, 70ms entre linhas), a seta se traça em 0,9s com 0,55s de atraso e a ponta 0,7s depois, e os botões surgem em 0,9s. Só `stroke-dashoffset`, `opacity` e `transform`, na curva de saída `cubic-bezier(0.16, 1, 0.3, 1)`, uma vez.

### O laço de marcador (assinatura da Escolinha)
A categoria encontrada pelo ano é circulada em branco por um laço de 2.5px que se fecha uma vez (0,9s), na resposta e na linha da categoria no quadro. Uma nova busca desenha o laço de novo.

### Painel do dono (variante sóbria)
Mesmo preto, traço e tipografia, para operar no celular. Botões sóbrios; neon só para confirmar o sinal e para o que depende dele (status "Aguardando sinal", contagem, pendentes). Status em etiqueta reta com borda: branco confirmada, giz concluída, coral cancelada/expirada/faltou, neon aguardando sinal. Linha do tempo do dia em faixas de 44px com o tipo sempre escrito: treino em azul de gráfico 20%, reserva em branco 10%, bloqueio em coral 15%, livre em traço tracejado. Gráfico de ocupação em barras horizontais empilhadas com legenda, rótulo em dado, dica no hover/foco e tabela equivalente em "Ver em tabela".

### Imagem e vídeo
- Fotos sempre do catálogo via FotoClube, com largura, altura, `alt` e ponto de foco do catálogo, em `object-cover` dentro de molduras retas de proporção fixa. Sem filtros, sem máscaras geométricas, sem cantos.
- Vídeo de fundo via VideoFundo: pôster sempre montado por baixo, vídeo só sem "reduzir movimento", pausa fora da tela e botão circular de pausar de 44px.

## Do's and Don'ts

### Do:
- **Do** usar #000 como fundo e separar áreas com o traço de quadra (branco 14%) ou o traço forte (branco 30%).
- **Do** reservar o neon para agendar, reservar, pagar o sinal, horários, prazo do sinal e números de conquista.
- **Do** escrever títulos em Archivo largura 62, peso 900, caixa alta, entrelinha 0,88, com as quebras escolhidas no código.
- **Do** mostrar horários, preços, telefones e códigos em dado (largura 80, peso 650, tabular).
- **Do** listar coleções em linhas com traço e MarcaX, não em grade de cards.
- **Do** manter a quadra a 6–14% de branco quando é fundo, e a 22–28% só quando ela é a imagem da Arena.
- **Do** limitar o movimento a um momento desenhado por página, só com stroke-dashoffset, opacity e transform, e entregar tudo pronto com "reduzir movimento".
- **Do** garantir alvo de toque de 44px e foco de teclado em contorno neon de 2px.

### Don't:
- **Don't** usar cinza-escuro de fundo, gradiente decorativo ou sombra em quadros, botões e fotos.
- **Don't** arredondar superfícies; o círculo é só de controle flutuante, ponto de status e o O da linha do tempo.
- **Don't** pôr rótulo em caixa alta acima de título, palavra colorida dentro do título ou itálico de destaque.
- **Don't** montar grade de cards iguais com foto de ação e faixa de estatísticas.
- **Don't** colocar um quadro dentro de outro.
- **Don't** usar as cores de gráfico fora do painel nem o oliva como se fosse o neon de ação.
- **Don't** aplicar filtro ou máscara geométrica às fotos do clube.
- **Don't** terminar link com seta ou glifo; o tracejado já é o deslocamento.
