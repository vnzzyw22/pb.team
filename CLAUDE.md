# CLAUDE.md

Site da escolinha de futsal PB Team (Maringá/PR) + sistema de reservas da Arena PB Team.
Conteúdo, textos e comentários em **português do Brasil**.

## Comandos

- `npm run dev`: servidor local
- `npm test`: testes (Vitest) da regra de negócio
- `npm run typecheck` / `npm run lint`
- `npm run db:preparar` / `npm run db:demo`: cria as tabelas / recarrega os dados de exemplo no banco de `DATABASE_URL`

Rode `npm test && npm run typecheck && npm run lint` antes de cada commit.

## Arquitetura

- `src/lib/`: **toda** a regra de negócio, pura e testada. Importe sempre de `@/lib`.
  - A interface **nunca** reimplementa regra: disponibilidade, preço, categoria por ano, validação de telefone, mensagens de WhatsApp e Pix vêm de `@/lib`.
  - Dados editáveis (horários, preços, textos, conquistas) ficam em `src/lib/dados/`. Não espalhe esses valores por componentes.
  - Dinheiro sempre em **centavos** (`number`); exiba com `formatarMoeda`.
  - Datas são strings `"AAAA-MM-DD"` e horários são minutos do dia; use `formatarData`, `formatarHora` e `formatarHoraCurta`.
- `src/server/`: código só de servidor.
  - `contexto.ts`: `obterContexto()` devolve repositório + `ServicoReservas`. Com `DATABASE_URL` usa o Postgres (Neon); sem ela, usa memória com dados de exemplo (dá para desenvolver a interface sem configurar nada).
  - `db/`: estrutura das tabelas (`schema.ts`) e `RepositorioPostgres`. Uma exclusion constraint impede, no banco, horários sobrepostos.
  - `demo.ts`: dados de exemplo da demonstração.
  - `acoes/publico.ts` e `acoes/painel.ts`: **Server Actions que a interface chama** (ver abaixo).
  - `painel/acesso.ts`: `protegerPagina()` e `estaNoPainel()` para as páginas privadas.
- `src/app/`: páginas (App Router). `src/app/api/cron` roda as tarefas diárias.

### Server Actions para a interface

Podem ser chamadas direto de componentes cliente (`"use client"`), como funções assíncronas.

Site público (`@/server/acoes/publico`):
- `buscarHorarios(recursoId, data, duracao)` → horários livres com preço
- `pedirReserva(entrada)` → `{ ok, reserva, pixCopiaECola?, whatsapp }` ou `{ ok: false, erros }`
- `pedirAulaExperimental(entrada)` → `{ ok, lead, whatsapp }` ou `{ ok: false, erros }`
- `consultarReserva(codigo)` → situação da reserva pelo código (ex.: `PB-7K3Q`)

Painel (`@/server/acoes/painel`), todas respondem `{ ok: true, dados } | { ok: false, erro, mensagem }` e exigem login:
- Sessão: `entrarNoPainel(senha)`, `sairDoPainel()`, `infoDoSistema()`
- Agenda: `agendaDoDia(data)`, `reservasDoPeriodo(de, ate)`, `pendentesDeSinal()`
- Reservas: `lancarReserva`, `confirmarSinal`, `registrarPagamento`, `cancelarReserva`, `marcarComparecimento`, `linkDeLembrete`
- Bloqueios: `bloquearHorario`, `desbloquearHorario`, `listarBloqueios`
- Mensalistas: `listarMensalistas`, `criarMensalista`, `encerrarMensalista`
- Contatos: `listarContatos`, `mudarStatusContato`
- Relatórios: `resumoDoPeriodo(de, ate)`, `ocupacaoDaSemana()`
- Demo: `resetarDemo()`

Páginas do painel: no topo do Server Component, `await protegerPagina()` (redireciona para `/painel/entrar`).
Mensagens de erro: mapeie os códigos (`conflito`, `antecedencia_minima`, `telefone_invalido`…) para textos amigáveis em português.

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
2. **Escolinha:** busca por ano de nascimento (`categoriaPorAnoNascimento`), cards de categoria com turmas (`resumoHorarios`) e formulário de aula experimental: valide no navegador com **`validarAulaExperimental()`** (erros por campo + link do WhatsApp, sem banco) e envie com a action `pedirAulaExperimental`.
3. **O projeto:** história e filosofia de base (`CLUBE.historia`, `CLUBE.missao`, `CLUBE.citacao`) e o técnico **Pietro Bettin**, fundador, cujas iniciais dão nome ao time (`CLUBE.tecnico`: `sobre`, `formacao` com UEM, pós e licenças CBFS C e B, `fotos`, `instagram`). A formação é argumento de confiança para os pais e merece destaque visual.
4. **Conquistas:** resumo em números (`CLUBE.conquistas`) + linha do tempo com **`historicoPublico()`** (já omite ano/categoria pendentes) e `torneiosPublicos()`.
5. **Arena:** fluxo de reserva (`buscarHorarios` → `pedirReserva` → Pix + WhatsApp), com a opção do combo churrasqueira. Para dúvidas gerais sobre locação, use `linkWhatsApp(mensagens.interesseArena({...}))`.
6. **Patrocinadores:** **`patrocinadoresPublicos()`** (só os confirmados) + "Sua marca dentro da Arena PB Team" (`CLUBE.anuncie`, botão com `mensagens.anuncie`).
7. **Painel (privado):** grade do dia (`grade`), confirmar sinal, cancelar, mensalistas, bloqueios, contatos e resumo.

## Fotos e vídeo

- Catálogo em `src/lib/dados/galeria.ts` (`FOTOS`, `VIDEOS`, `fotoPorId`, `fotosPorTipo`). Cada foto traz dimensões, `alt`, `foco` (object-position) e `usoSugerido`.
- Use `next/image` com `width`/`height` do catálogo. Ao adicionar foto: converter para WebP (máx. 1920px) em `public/fotos/` e registrar no catálogo. O teste `conteudo.test.ts` confere arquivo e dimensões.

## Cuidados

- Muitas fotos têm atletas **menores de idade** (`temMenores`). Use só imagens do clube e confirme a autorização de uso de imagem antes de publicar.
- Não use fotos do Google Maps nem de terceiros no site final.
- Itens pendentes não aparecem como fato: use `historicoPublico()`, `torneiosPublicos()` e `patrocinadoresPublicos()`. `pendenciasDeConteudo()` lista o que perguntar ao clube.
