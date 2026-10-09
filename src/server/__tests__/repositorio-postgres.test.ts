import { beforeEach, describe, expect, it } from "vitest";
import { ConflitoDeHorario, ServicoReservas, registrarAulaExperimental, type Reserva } from "@/lib";
import { ids, relogioFixo } from "@/lib/__tests__/relogio";
import type { Executor } from "../db/executor";
import { RepositorioPostgres } from "../db/repositorio-postgres";
import { limparTudo, migrar } from "../db/schema";
import { bancoDeTeste } from "./pglite";

// Segunda-feira, 12/10/2026, 09:00 em Maringá.
const cliente = { nome: "João da Pelada", telefone: "(44) 99876-5432" };
const pedido = { data: "2026-10-16", recursoId: "quadra" as const, inicio: "20:00", duracao: 90, cliente };

let db: Executor;
let repo: RepositorioPostgres;
let relogio: ReturnType<typeof relogioFixo>;
let servico: ServicoReservas;

beforeEach(async () => {
  db ??= await bancoDeTeste();
  await limparTudo(db);
  repo = new RepositorioPostgres(db);
  relogio = relogioFixo("2026-10-12T09:00");
  servico = new ServicoReservas(repo, relogio.agora, ids());
});

describe("estrutura", () => {
  it("migrar é idempotente", async () => {
    await migrar(db);
    await migrar(db);
  });
});

describe("RepositorioPostgres", () => {
  it("grava e lê a reserva inteira", async () => {
    const r = await servico.solicitar(pedido);
    if (!r.ok) throw new Error(r.erros.join());
    expect(await repo.reservaPorId(r.reserva.id)).toEqual(r.reserva);
    expect(await repo.reservaPorCodigo(r.reserva.codigo.toLowerCase())).toEqual(r.reserva);
    expect(await repo.reservasEntre("2026-10-12", "2026-10-18")).toHaveLength(1);
    expect(await repo.reservasEntre("2026-10-17", "2026-10-18")).toHaveLength(0);
  });

  it("o banco recusa horários sobrepostos mesmo sem passar pelo serviço", async () => {
    const r = await servico.solicitar(pedido);
    if (!r.ok) throw new Error();
    const invasora: Reserva = {
      ...r.reserva,
      id: "outra",
      codigo: "PB-ZZZZ",
      itens: [{ recursoId: "quadra", intervalo: { inicio: 20 * 60 + 30, fim: 21 * 60 + 30 } }],
    };
    await expect(repo.salvarReserva(invasora)).rejects.toBeInstanceOf(ConflitoDeHorario);
    // a transação foi desfeita: nada da reserva invasora ficou gravado
    expect(await repo.reservaPorId("outra")).toBeUndefined();
  });

  it("cancelar libera o horário no banco", async () => {
    const r = await servico.solicitar(pedido);
    if (!r.ok) throw new Error();
    await servico.cancelar(r.reserva.id);
    const nova = await servico.solicitar({ ...pedido, cliente: { nome: "Outro Time", telefone: "44 99111-2222" } });
    expect(nova.ok).toBe(true);
  });

  it("dois servidores pedindo o mesmo horário ao mesmo tempo: só um consegue", async () => {
    const servidorB = new ServicoReservas(repo, relogio.agora, () => `b-${Math.random()}`);
    const [a, b] = await Promise.all([
      servico.solicitar(pedido),
      servidorB.solicitar({ ...pedido, cliente: { nome: "Outro Time", telefone: "44 99111-2222" } }),
    ]);
    expect([a.ok, b.ok].sort()).toEqual([false, true]);
    const perdedor = a.ok ? b : a;
    expect(perdedor.ok || perdedor.erros).toEqual(["conflito"]);
  });

  it("pré-reserva vencida não trava novas reservas", async () => {
    await servico.solicitar(pedido);
    relogio.avancarMinutos(31);
    const nova = await servico.solicitar({ ...pedido, cliente: { nome: "Outro Time", telefone: "44 99111-2222" } });
    expect(nova.ok).toBe(true);
    const todas = await repo.reservasEntre("2026-10-16", "2026-10-16");
    expect(todas.map((r) => r.status).sort()).toEqual(["aguardando_sinal", "expirada"]);
  });

  it("bloqueios, mensalistas e contatos", async () => {
    await servico.criarBloqueio({ recursoId: "quadra", data: "2026-10-20", inicio: "22:00", fim: "23:00", motivo: "Manutenção" });
    expect(await repo.bloqueiosEntre("2026-10-20", "2026-10-20")).toEqual([
      expect.objectContaining({ recursoId: "quadra", intervalo: { inicio: 1320, fim: 1380 }, motivo: "Manutenção" }),
    ]);

    const { serie, criadas, conflitos } = await servico.criarSerie(
      { cliente: { nome: "Turma do Zé", telefone: "44 99999-0000" }, recursoId: "quadra", diaSemana: 2, inicio: "22:00", duracao: 60, dataInicio: "2026-10-12" },
      4,
    );
    expect(criadas).toHaveLength(3);
    expect(conflitos).toEqual(["2026-10-20"]);
    expect(await repo.seriePorId(serie.id)).toEqual(serie);
    expect(await servico.encerrarSerie(serie.id, "2026-10-27")).toBe(2);
    expect((await repo.seriePorId(serie.id))?.ativa).toBe(false);

    const lead = await registrarAulaExperimental(
      repo,
      { responsavel: "Maria Souza", telefone: "44 98888-7777", atleta: "Pedro", anoNascimento: 2017 },
      { temporada: 2026 },
    );
    if (!lead.ok) throw new Error();
    expect(await repo.leads()).toEqual([lead.lead]);
  });
});
