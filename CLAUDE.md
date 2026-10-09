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

1. **Home:** chamada "Formando atletas em Maringá desde 2019", faixa de conquistas e CTAs "Agende uma aula experimental" / "Reserve a Arena".
2. **Escolinha:** busca por ano de nascimento (`categoriaPorAnoNascimento`), cards de categoria com turmas (`resumoHorarios`) e formulário de aula experimental (`registrarAulaExperimental`).
3. **O projeto:** história e filosofia de base do Pietro Bettin (`CLUBE.historia`, `CLUBE.missao`).
4. **Conquistas:** `CLUBE.conquistas`.
5. **Arena:** fluxo de reserva (`disponibilidade` → `solicitar` → Pix + WhatsApp), com a opção do combo churrasqueira.
6. **Patrocinadores:** `CLUBE.patrocinadores` + "Seja patrocinador".
7. **Painel (privado):** grade do dia (`grade`), confirmar sinal, cancelar, mensalistas, bloqueios, contatos e resumo.

## Cuidados

- Fotos de atletas são de **menores de idade**. Use só imagens fornecidas pelo clube, com autorização.
- Não use fotos do Google Maps nem de terceiros no site final.
