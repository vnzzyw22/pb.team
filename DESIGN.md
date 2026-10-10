# DESIGN.md: PB Team Futsal

Direção: **a prancheta do técnico**. A quadra desenhada em traço branco sobre o
preto, marcações em X (o X do escudo) e setas de jogada conduzindo o olhar até
a ação. Recusa o padrão de site esportivo (foto de ação + grade de cards iguais
+ faixa de estatísticas). Tokens em `src/app/globals.css`.

## Cor

| Token | Valor | Uso |
|---|---|---|
| `preto` | `#000000` | Fundo de tudo: a prancheta e a quadra. Preto puro, nunca cinza-escuro. |
| `feltro` | `#0e0e0e` | Fundo de campos e de quadros cheios. |
| `friso` | `#181818` | Botões sóbrios do painel. |
| `linha` | branco 14% | Traço de quadra, divisórias, bordas de quadro. |
| `linha-forte` | branco 30% | Bordas que precisam ser vistas (campos, avisos). |
| `branco` | `#ffffff` | Títulos e texto principal. |
| `giz` | `#a8a8a8` | Texto secundário (8,9:1 sobre o preto). |
| `neon` | `#bcd00e` | **Só** ações de agendar e reservar, horários de treino e números de conquistas. Valor amostrado das artes do clube; confirmar o oficial. |
| `alerta` | `#ff8a7a` | Erros de formulário e ações destrutivas. |
| `ok` | `#8fd8a8` | Confirmações. |

Regra do neon: se não é botão de agendar/reservar, horário ou número de
conquista, não é neon. Foco de teclado também usa o neon (é ação).

## Tipografia

Uma família, **Archivo** variável (Google Fonts via `next/font`), usando o eixo
de largura como hierarquia:

- **Títulos** (`.titulo`): largura 62, peso 900, caixa alta, entrelinha 0,88.
  Escala: `.t-hero` (até 6rem), `.t-1` (até 6rem), `.t-2` (até 4,5rem), `.t-3`
  (até 2,25rem), `.t-4` (1,375rem). Quebras de linha escolhidas no código.
- **Texto**: largura 100, peso 400, 16px, entrelinha 1,55, medida até 62ch
  (`.medida`). `.lead` para aberturas.
- **Dados** (`.dado`): largura 80, peso 650, algarismos tabulares. Horários,
  telefones, códigos.
- **Números de conquista** (`.numero`): largura 62, peso 900, tabulares.
- **Marcas** (`.marca`): largura 125, peso 300. Nomes de patrocinadores sem logo.

Sem rótulos em caixa alta acima de títulos, sem itálico de destaque, sem uma
palavra colorida dentro do título.

## Espaço e grade

- `.recipiente`: até 78rem, margem lateral de 16px no celular, 24px no tablet e
  40px no desktop.
- `.secao`: 5rem de respiro vertical no celular, 7,5rem no desktop. Mais espaço
  acima do título do que abaixo.
- Mobile first. Larguras validadas: 320, 375, 390, 430 e desktop.

## Componentes

- **Botões** (`.btn`): retos, sem raio, altura mínima de 52px (44px no
  `.btn-pequeno`).
  - `.btn-neon`: ação principal (agendar, reservar).
  - `.btn-contorno`: ação neon secundária ("Reserve a Arena" ao lado da aula).
  - `.btn-claro`: ações neutras (anunciar, voltar).
  - `.btn-sobrio`: botões do painel.
  - `.btn-perigo`: cancelar e apagar.
  - Estados: hover só em dispositivos com mouse, `:disabled`, `aria-busy` com o
    ícone `Carregando`.
- **Links** (`.link-jogada`): sublinhado tracejado (o deslocamento na prancheta),
  vira linha cheia no hover. Sem setas ou glifos no fim do texto.
- **Campos** (`.entrada`): fundo feltro, borda de 1px, 16px de texto (sem zoom no
  iOS), rótulo sempre visível acima. Erro com borda `alerta`, mensagem abaixo
  ligada por `aria-describedby` e resumo de erros que recebe o foco ao enviar.
  `select` com seta desenhada.
- **Quadros** (`.quadro`, `.quadro-cheio`): área delimitada por traço de quadra.
  Sem sombra, sem cantos arredondados, nunca um quadro dentro de outro.
- **Avisos** (`.aviso`, `.aviso-erro`, `.aviso-ok`): mensagens de erro e sucesso
  com `role="alert"` ou `aria-live`.

## Grafismos

- `Quadra`: quadra de futsal com as medidas oficiais (40×20 m), vertical no
  celular e horizontal no desktop, sempre em 6–14% de branco, atrás do
  conteúdo.
- `Escudo`: SVG desenhado em caminhos (P, B, X, bola, ano de `CLUBE.fundacao`).
  Também é o ícone do site (`app/icon.svg`, `apple-icon`) e entra na imagem de
  compartilhamento.
- `MarcaX`: o X do escudo como marcador de lista (formação do técnico, formatos
  de anúncio).
- `LinhaDoMeio`: divisor com o círculo central.
- `SetaJogada`: linha cheia com ponta, que leva do título até a ação.

## Movimento

Um momento orquestrado por página, só com `stroke-dashoffset`, `opacity` e
`transform`:

- Home: o título sobe linha a linha e a seta da jogada se desenha até o botão.
- Escolinha: a categoria encontrada pelo ano é circulada com traço de marcador.

Com "reduzir movimento" ligado, tudo aparece pronto, sem animação, e o vídeo de
fundo vira o pôster.

## Imagem e vídeo

- Fotos sempre do catálogo `FOTOS` via `FotoClube` (`next/image` com largura,
  altura, `alt` e `foco` do catálogo). Sem filtros, sem máscaras geométricas.
- Vídeo `hero-jogo` via `VideoFundo`: pôster sempre montado por baixo, vídeo só
  sem "reduzir movimento", pausa fora da tela e botão de pausar.

## Texto

Português do Brasil, voz direta, frases curtas, sentença com inicial maiúscula.
Botões dizem o que acontece ("Agende uma aula experimental", "Enviar pelo
WhatsApp"). Erros dizem o que houve e como resolver. Todo dado (nomes,
horários, preços, títulos, contatos) vem de `@/lib`.
