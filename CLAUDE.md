# CLAUDE.md

Site da escolinha de futsal PB Team (Maringá/PR) + sistema de reservas da Arena PB Team.
Conteúdo, textos e comentários em **português do Brasil**.

## Comandos

- `npm run dev`: servidor local
- `npm test`: testes (Vitest) da regra de negócio
- `npm run typecheck` / `npm run lint`

Rode `npm test && npm run typecheck && npm run lint` antes de cada commit.

## Arquitetura

- `src/lib/`: **toda** a regra de negócio, pura e testada. Importe sempre de `@/lib`.
  - A interface **nunca** reimplementa regra: disponibilidade, preço, categoria por ano, validação de telefone, mensagens de WhatsApp e Pix vêm de `@/lib`.
  - Dados editáveis (horários, preços, textos, conquistas) ficam em `src/lib/dados/`. Não espalhe esses valores por componentes.
  - Dinheiro sempre em **centavos** (`number`); exiba com `formatarMoeda`.
  - Datas são strings `"AAAA-MM-DD"` e horários são minutos do dia; use `formatarData`, `formatarHora` e `formatarHoraCurta`.
  - Persistência via interface `Repositorio`. Hoje só existe `RepositorioMemoria`; o banco de verdade ainda será implementado.
- `src/app/`: páginas (App Router) e, futuramente, Server Actions/rotas que chamam `ServicoReservas`.

Ao mudar regra em `src/lib`, adicione ou ajuste testes em `src/lib/__tests__/`.

## Identidade visual

Tirada do escudo, do uniforme e das artes do Instagram @pbteamfutsal:

- **Cores:** preto e branco como base; destaque **verde-limão neon** (aprox. `#BCD00E`, amostrado das artes de "Horário de treino"; confirmar o valor oficial). O neon fica reservado para ações (botões "Agendar aula" e "Reservar"), horários e números de conquistas.
- **Escudo:** círculo preto, "P" e "B" separados por um **X** branco, bola no topo e "2019" embaixo. O X pode virar elemento gráfico (divisores, transições).
- **A quadra é preta com linhas brancas.** As marcações de quadra (círculo central, áreas, linha do meio) funcionam como grafismo sutil de fundo.
- **Tipografia:** sans-serif condensada e pesada para títulos (como o "PB" e o "2019" do escudo).
- **Tom:** mais limpo e premium que os posts do Instagram. As fotos reais carregam a emoção.
- **Mobile first.** A maior parte do tráfego vem do link da bio do Instagram.

## Páginas previstas

1. **Home:** vídeo vertical em loop como fundo no celular (`VIDEOS` → `hero-jogo`, sem áudio, com pôster), chamada "Formando atletas em Maringá desde 2019", faixa de conquistas (`CLUBE.conquistas`), selo "Matrículas abertas" (`CLUBE.matriculas`) e CTAs "Agende uma aula experimental" / "Reserve a Arena".
2. **Escolinha:** busca por ano de nascimento (`categoriaPorAnoNascimento`), cards de categoria com turmas (`resumoHorarios`) e formulário de aula experimental (`registrarAulaExperimental`).
3. **O projeto:** história e filosofia de base (`CLUBE.historia`, `CLUBE.missao`, `CLUBE.citacao`) e o técnico **Pietro Bettin**, fundador, cujas iniciais dão nome ao time (`CLUBE.tecnico`, com fotos em `CLUBE.tecnico.fotos`).
4. **Conquistas:** resumo em números (`CLUBE.conquistas`) + linha do tempo (`CLUBE.historico`, com `fotoId` quando houver).
5. **Arena:** fluxo de reserva (`disponibilidade` → `solicitar` → Pix + WhatsApp), com a opção do combo churrasqueira.
6. **Patrocinadores:** `CLUBE.patrocinadores` (exibir só `confirmado: true`) + "Sua marca dentro da Arena PB Team" (`CLUBE.anuncie`, botão com `mensagens.anuncie`).
7. **Painel (privado):** grade do dia (`grade`), confirmar sinal, cancelar, mensalistas, bloqueios, contatos e resumo.

## Fotos e vídeo

- Catálogo em `src/lib/dados/galeria.ts` (`FOTOS`, `VIDEOS`, `fotoPorId`, `fotosPorTipo`). Cada foto traz dimensões, `alt`, `foco` (object-position) e `usoSugerido`.
- Use `next/image` com `width`/`height` do catálogo. Ao adicionar foto: converter para WebP (máx. 1920px) em `public/fotos/` e registrar no catálogo. O teste `conteudo.test.ts` confere arquivo e dimensões.

## Cuidados

- Muitas fotos têm atletas **menores de idade** (`temMenores`). Use só imagens do clube e confirme a autorização de uso de imagem antes de publicar.
- Não use fotos do Google Maps nem de terceiros no site final.
- Itens com `CONFIRMAR`/`confirmar` não devem aparecer como fato no site sem validação (ex.: categoria de um título).
