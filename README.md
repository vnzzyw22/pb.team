# PB Team Futsal — site e sistema de reservas

Site da escolinha de futsal **PB Team** (Maringá/PR, desde 2019) com:

- **Escolinha:** categorias, horários de treino e o campo "Em que ano seu filho nasceu?", que indica a categoria e a turma certas e leva para o pedido de aula experimental pelo WhatsApp.
- **Arena PB Team:** locação da quadra coberta (e da churrasqueira) com agenda real. Os horários de treino já ficam bloqueados automaticamente, e o cliente vê só o que está livre.
- **Painel do dono:** reservas, sinal via Pix, mensalistas, bloqueios, contatos de aula experimental e resumo financeiro.

Stack: **Next.js 15 (App Router) + TypeScript + Tailwind 4**, com testes em **Vitest**.

## Estado atual

| Parte | Situação |
|---|---|
| Regra de negócio (`src/lib`) | ✅ Pronta e testada (41 testes) |
| Interface (páginas, componentes, visual) | ⏳ A fazer |
| Banco de dados | ⏳ A fazer. Hoje existe só o repositório em memória. |
| Rotas de API / Server Actions | ⏳ A fazer, junto com o banco |
| Login do painel | ⏳ A fazer |

## Comandos

```bash
npm install
npm run dev        # site em http://localhost:3000
npm test           # testes da regra de negócio
npm run typecheck
npm run lint
```

## Estrutura da regra de negócio

Tudo é importado de `@/lib`.

```
src/lib/
├── dados/
│   ├── clube.ts        # nome, história, contato, conquistas, patrocinadores
│   ├── categorias.ts   # categorias, turmas e horários de treino
│   └── arena.ts        # recursos, expediente, preços, política de sinal e Pix
├── tempo.ts            # datas "AAAA-MM-DD", minutos do dia, fuso de Maringá
├── categorias.ts       # ano de nascimento → categoria; treinos por dia
├── precos.ts           # orçamento por faixa de horário, combo e sinal
├── agenda.ts           # disponibilidade, validação de horário, grade do dia
├── reservas.ts         # ServicoReservas: pré-reserva, sinal, cancelamento, mensalistas…
├── leads.ts            # pedido de aula experimental e funil de contatos
├── ocupacao.ts         # semana típica: horas de treino × horas livres
├── pix.ts              # Pix copia e cola (BR Code estático)
├── whatsapp.ts         # telefone, links wa.me e mensagens prontas
├── repositorio.ts      # interface de persistência + implementação em memória
└── modelos.ts          # tipos: Reserva, Bloqueio, Serie, Lead
```

### Como a reserva funciona

1. O cliente escolhe o dia e a duração, e `servico.disponibilidade()` mostra os horários livres (já sem treinos, reservas, bloqueios e horários com menos de 2h de antecedência).
2. `servico.solicitar()` cria a **pré-reserva** (`aguardando_sinal`), que segura o horário por 30 min. Ela devolve o Pix copia e cola do sinal e o link do WhatsApp com o resumo.
3. O dono confere o Pix e chama `servico.confirmarSinal()`. A reserva fica `confirmada` e ele recebe o link com a mensagem de confirmação para o cliente.
4. Se o sinal não chegar no prazo, o horário volta a ficar livre sozinho. `expirarPendentes()` só atualiza o status.
5. Depois do jogo: `marcarComparecimento()` (concluída ou não compareceu) e `registrarPagamento()` para o restante.

Os **mensalistas** (`criarSerie`) ocupam o mesmo horário toda semana. `estenderSeries()` lança as próximas semanas e deve rodar semanalmente, por cron. Datas em conflito são reportadas, e não sobrescritas.

## ⚠️ Dados a confirmar com o clube

Tudo o que está marcado com `CONFIRMAR` no código:

- **Duração dos treinos.** Hoje está assumido 1h.
- **Turmas.** Horários em turnos diferentes na mesma categoria foram tratados como turmas distintas (ex.: Sub-7 manhã × noite).
- **Anos sem categoria própria.** Os anos do Sub-8, Sub-14 e Sub-16 sobem para a categoria seguinte.
- **Locação.** Expediente, preços (os atuais são **fictícios**), percentual do sinal, prazo e política de cancelamento.
- **Churrasqueira.** Se existe, o que inclui e o preço.
- **Pix.** Chave, nome do recebedor e cidade. Sem a chave, o site não gera o Pix.
- **Contato.** O WhatsApp usado é o da bio do Instagram (5544999448422). Falta confirmar se ele serve também para a locação.
- **Endereço e Google Maps** da Arena.
- **Patrocinadores e logos.**

## Próximos passos

1. **Interface:** páginas públicas (Home, Escolinha/Categorias, Conquistas, Arena/Reservas, Patrocinadores) e o painel.
2. **Banco de dados:** implementar `Repositorio` com Postgres (Supabase ou Neon). Use uma *exclusion constraint* para garantir no banco que duas reservas nunca se sobreponham.
3. **API:** Server Actions ou route handlers chamando `ServicoReservas`.
4. **Login do painel** e **cron** (`expirarPendentes`, `estenderSeries`, lembretes da véspera).
5. **Fase 3 (opcional):** pagamento automático (Mercado Pago/Asaas) e área dos pais.
