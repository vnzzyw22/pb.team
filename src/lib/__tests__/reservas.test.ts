import { beforeEach, describe, expect, it } from "vitest";
import { registrarAulaExperimental, atualizarStatusLead } from "../leads";
import { RepositorioMemoria } from "../repositorio";
import { ServicoReservas } from "../reservas";
import { ids, relogioFixo } from "./relogio";

// Segunda-feira, 12/10/2026, 09:00 em Maringá.
// Semana: 13 ter · 14 qua · 15 qui · 16 sex · 17 sáb · 18 dom
const cliente = { nome: "João da Pelada", telefone: "(44) 99876-5432" };

let repo: RepositorioMemoria;
let relogio: ReturnType<typeof relogioFixo>;
let servico: ServicoReservas;

beforeEach(() => {
  repo = new RepositorioMemoria();
  relogio = relogioFixo("2026-10-12T09:00");
  servico = new ServicoReservas(repo, relogio.agora, ids());
});

const rotulos = (lista: { rotulo: string }[]) => lista.map((h) => h.rotulo);

describe("disponibilidade", () => {
  it("desconta treinos e a antecedência mínima", async () => {
    // seg: treinos 10h, 14h30, 15h30, 17h, 18h, 19h, 20h; agora 9h + 2h de antecedência
    const livres = await servico.disponibilidade("quadra", "2026-10-12", 60);
    expect(rotulos(livres)).toEqual(["11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "21:00", "21:30", "22:00"]);
    expect(livres.at(-1)!.preco).toBe(16000);
  });

  it("sexta à noite fica toda livre", async () => {
    const livres = rotulos(await servico.disponibilidade("quadra", "2026-10-16", 60));
    expect(livres).not.toContain("15:30");
    expect(livres).not.toContain("15:00");
    expect(livres).toContain("16:30");
    expect(livres).toContain("22:00");
  });

  it("recusa duração fora das opções e datas inválidas", async () => {
    expect(await servico.disponibilidade("quadra", "2026-10-16", 45)).toEqual([]);
    expect(await servico.disponibilidade("quadra", "2026-13-01", 60)).toEqual([]);
  });

  it("monta a grade do dia para o painel", async () => {
    const grade = await servico.grade("quadra", "2026-10-16");
    expect(grade.map((s) => s.tipo)).toEqual(["livre", "treino", "livre"]);
    expect(grade[1]).toMatchObject({ rotulo: "Treino Sub-11" });
  });
});

describe("pré-reserva e sinal", () => {
  const pedido = { data: "2026-10-16", recursoId: "quadra" as const, inicio: "20:00", duracao: 90, cliente };

  it("segura o horário por 30 minutos e gera o link do WhatsApp", async () => {
    const r = await servico.solicitar(pedido);
    if (!r.ok) throw new Error(r.erros.join());
    expect(r.reserva.status).toBe("aguardando_sinal");
    expect(r.reserva.codigo).toMatch(/^PB-[A-Z2-9]{4}$/);
    expect(r.reserva.cliente.telefone).toBe("5544998765432");
    expect(r.reserva.orcamento.total).toBe(24000);
    expect(r.reserva.orcamento.sinal).toBe(12000);
    expect(r.whatsapp).toContain("https://wa.me/5544999448422?text=");
    expect(decodeURIComponent(r.whatsapp)).toContain(r.reserva.codigo);
    expect(r.pixCopiaECola).toBeUndefined(); // chave Pix ainda não configurada

    const livres = rotulos(await servico.disponibilidade("quadra", "2026-10-16", 60));
    expect(livres).not.toContain("20:00");
    expect(livres).not.toContain("21:00");
    expect(livres).toContain("21:30");
  });

  it("impede reserva sobreposta", async () => {
    await servico.solicitar(pedido);
    const r = await servico.solicitar({ ...pedido, inicio: "21:00", duracao: 60 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.erros).toEqual(["conflito"]);
      expect(r.conflitos[0]).toMatchObject({ tipo: "reserva", rotulo: "João da Pelada" });
    }
  });

  it("dois pedidos simultâneos no mesmo horário: só um passa", async () => {
    const [a, b] = await Promise.all([servico.solicitar(pedido), servico.solicitar(pedido)]);
    expect([a.ok, b.ok].sort()).toEqual([false, true]);
  });

  it("libera o horário se o sinal não chegar no prazo", async () => {
    await servico.solicitar(pedido);
    relogio.avancarMinutos(31);
    expect(rotulos(await servico.disponibilidade("quadra", "2026-10-16", 60))).toContain("20:00");
    expect(await servico.expirarPendentes()).toBe(1);
  });

  it("confirma o sinal e devolve a mensagem para o cliente", async () => {
    const r = await servico.solicitar(pedido);
    if (!r.ok) throw new Error();
    const { reserva, whatsapp } = await servico.confirmarSinal(r.reserva.id);
    expect(reserva.status).toBe("confirmada");
    expect(reserva.valorPago).toBe(12000);
    expect(reserva.expiraEm).toBeUndefined();
    expect(whatsapp).toContain("wa.me/5544998765432");
    expect(decodeURIComponent(whatsapp)).toContain("Restante a pagar no dia: R$ 120,00");

    // continua ocupado mesmo depois do prazo da pré-reserva
    relogio.avancarMinutos(60);
    expect(rotulos(await servico.disponibilidade("quadra", "2026-10-16", 60))).not.toContain("20:00");
  });

  it("aceita sinal atrasado se ninguém pegou o horário, recusa se pegaram", async () => {
    const a = await servico.solicitar(pedido);
    if (!a.ok) throw new Error();
    relogio.avancarMinutos(40);
    await servico.expirarPendentes();
    expect((await servico.confirmarSinal(a.reserva.id)).reserva.status).toBe("confirmada");

    const b = await servico.solicitar({ ...pedido, inicio: "18:00", duracao: 60 });
    if (!b.ok) throw new Error();
    relogio.avancarMinutos(40);
    await servico.solicitar({ ...pedido, inicio: "18:00", duracao: 60, cliente: { nome: "Outro Time", telefone: "44 99111-2222" } });
    await expect(servico.confirmarSinal(b.reserva.id)).rejects.toMatchObject({ codigo: "horario_ocupado" });
  });

  it("recusa horário de treino, dados inválidos e horários no passado", async () => {
    const treino = await servico.solicitar({ ...pedido, data: "2026-10-12", inicio: "18:00", duracao: 60 });
    expect(treino.ok || treino.erros).toEqual(["conflito"]);

    const dados = await servico.solicitar({ ...pedido, cliente: { nome: "J", telefone: "123" } });
    expect(dados.ok || dados.erros).toEqual(["nome_invalido", "telefone_invalido"]);

    const cedo = await servico.solicitar({ ...pedido, data: "2026-10-12", inicio: "10:00", duracao: 60 });
    expect(cedo.ok || cedo.erros).toEqual(expect.arrayContaining(["antecedencia_minima"]));

    const passado = await servico.solicitar({ ...pedido, data: "2026-10-11", inicio: "10:00", duracao: 60 });
    expect(passado.ok || passado.erros).toEqual(expect.arrayContaining(["no_passado"]));
  });
});

describe("combo quadra + churrasqueira", () => {
  it("reserva os dois recursos com desconto", async () => {
    const r = await servico.solicitar({
      data: "2026-10-17",
      recursoId: "quadra",
      inicio: "10:00",
      duracao: 60,
      comChurrasqueira: true,
      cliente,
    });
    if (!r.ok) throw new Error(r.erros.join());
    expect(r.reserva.itens.map((i) => i.recursoId)).toEqual(["quadra", "churrasqueira"]);
    expect(r.reserva.orcamento.desconto).toBe(3000);
    expect(await servico.disponibilidade("churrasqueira", "2026-10-17", 240)).not.toContainEqual(
      expect.objectContaining({ rotulo: "12:00" }),
    );
  });

  it("avisa quando a churrasqueira já está ocupada", async () => {
    await servico.solicitar({ data: "2026-10-17", recursoId: "churrasqueira", inicio: "09:00", duracao: 240, cliente });
    const r = await servico.solicitar({
      data: "2026-10-17",
      recursoId: "quadra",
      inicio: "10:00",
      duracao: 60,
      comChurrasqueira: true,
      cliente: { nome: "Outro Time", telefone: "44 99111-2222" },
    });
    expect(r.ok || r.erros).toEqual(["combo_indisponivel"]);
  });
});

describe("cancelamento, comparecimento e bloqueios", () => {
  it("devolve o sinal se cancelar com mais de 24h", async () => {
    const r = await servico.solicitar({ data: "2026-10-16", recursoId: "quadra", inicio: "20:00", duracao: 60, cliente });
    if (!r.ok) throw new Error();
    await servico.confirmarSinal(r.reserva.id);
    const { reserva, devolverSinal } = await servico.cancelar(r.reserva.id, "chuva de gente doente");
    expect(reserva.status).toBe("cancelada");
    expect(devolverSinal).toBe(true);
    expect(rotulos(await servico.disponibilidade("quadra", "2026-10-16", 60))).toContain("20:00");
  });

  it("não devolve o sinal em cima da hora", async () => {
    const r = await servico.solicitar({ data: "2026-10-13", recursoId: "quadra", inicio: "22:00", duracao: 60, cliente });
    if (!r.ok) throw new Error();
    await servico.confirmarSinal(r.reserva.id);
    relogio.avancarMinutos(14 * 60); // segunda 23:00 → faltam 23h para o jogo
    expect((await servico.cancelar(r.reserva.id)).devolverSinal).toBe(false);
  });

  it("registra pagamento restante e falta", async () => {
    const r = await servico.criarPeloPainel({ data: "2026-10-16", recursoId: "quadra", inicio: "21:00", duracao: 60, cliente });
    if (!r.ok) throw new Error(r.erros.join());
    expect(r.reserva.status).toBe("confirmada");
    await servico.registrarPagamento(r.reserva.id, 16000);
    const falta = await servico.marcarComparecimento(r.reserva.id, false);
    expect(falta.status).toBe("nao_compareceu");
    await expect(servico.marcarComparecimento(r.reserva.id, true)).rejects.toMatchObject({ codigo: "status_invalido" });
  });

  it("bloqueio tira o horário do site e aponta reservas afetadas", async () => {
    const r = await servico.criarPeloPainel({ data: "2026-10-17", recursoId: "quadra", inicio: "14:00", duracao: 60, cliente });
    if (!r.ok) throw new Error();
    const { reservasAfetadas } = await servico.criarBloqueio({
      recursoId: "todos",
      data: "2026-10-17",
      inicio: "13:00",
      fim: "18:00",
      motivo: "Jogo do Paranaense",
    });
    expect(reservasAfetadas.map((x) => x.id)).toEqual([r.reserva.id]);
    const livres = rotulos(await servico.disponibilidade("quadra", "2026-10-17", 60));
    expect(livres).not.toContain("15:00");
    expect(livres).toContain("18:00");
  });
});

describe("mensalistas", () => {
  const serie = {
    cliente: { nome: "Turma do Zé", telefone: "44 99999-0000" },
    recursoId: "quadra" as const,
    diaSemana: 2 as const, // terça
    inicio: "22:00",
    duracao: 60,
    dataInicio: "2026-10-12",
  };

  it("lança as próximas semanas e reporta conflitos", async () => {
    await servico.criarBloqueio({ recursoId: "quadra", data: "2026-10-20", inicio: "22:00", fim: "23:00", motivo: "Manutenção" });
    const { criadas, conflitos } = await servico.criarSerie(serie, 4);
    expect(criadas.map((r) => r.data)).toEqual(["2026-10-13", "2026-10-27", "2026-11-03"]);
    expect(conflitos).toEqual(["2026-10-20"]);
    expect(criadas.every((r) => r.status === "confirmada" && r.origem === "mensalista")).toBe(true);
  });

  it("usa o valor combinado e estende sem duplicar", async () => {
    const { serie: s } = await servico.criarSerie({ ...serie, valorPorOcorrencia: 13000 }, 2);
    const mais = await servico.estenderSeries("2026-11-10");
    expect(mais.criadas).toBe(3); // já tinha 13/10 e 20/10; agora 27/10, 03/11 e 10/11
    const todas = (await repo.reservasEntre("2026-10-01", "2026-12-31")).filter((r) => r.serieId === s.id);
    expect(todas).toHaveLength(5);
    expect(todas.every((r) => r.orcamento.total === 13000)).toBe(true);
  });

  it("encerrar cancela as ocorrências futuras", async () => {
    const { serie: s } = await servico.criarSerie(serie, 4);
    expect(await servico.encerrarSerie(s.id, "2026-10-27")).toBe(2);
    expect(rotulos(await servico.disponibilidade("quadra", "2026-10-27", 60))).toContain("22:00");
    expect((await servico.estenderSeries("2026-12-31")).criadas).toBe(0);
  });
});

describe("resumo do período", () => {
  it("soma horas vendidas, previsto, recebido e faltas", async () => {
    const a = await servico.criarPeloPainel({ data: "2026-10-16", recursoId: "quadra", inicio: "20:00", duracao: 120, cliente, valorPago: 10000 });
    const b = await servico.solicitar({ data: "2026-10-17", recursoId: "quadra", inicio: "10:00", duracao: 60, cliente });
    if (!a.ok || !b.ok) throw new Error();
    const resumo = await servico.resumo("2026-10-12", "2026-10-18");
    expect(resumo).toMatchObject({
      reservas: 1, // a pré-reserva sem sinal não conta
      horasVendidas: 2,
      faturamentoPrevisto: 32000,
      recebido: 10000,
      aReceber: 22000,
    });
  });
});

describe("aula experimental", () => {
  it("identifica a categoria e gera o WhatsApp", async () => {
    const r = await registrarAulaExperimental(
      repo,
      { responsavel: "Maria Souza", telefone: "44 98888-7777", atleta: "Pedro", anoNascimento: 2017, turmaId: "sub9" },
      { temporada: 2026 },
    );
    if (!r.ok) throw new Error(r.erros.join());
    expect(r.lead.categoriaId).toBe("sub9");
    expect(decodeURIComponent(r.whatsapp)).toContain("Categoria: Sub-9 · Turma única");
    const l = await atualizarStatusLead(repo, r.lead.id, "aula_agendada");
    expect(l.status).toBe("aula_agendada");
    await expect(atualizarStatusLead(repo, r.lead.id, "novo")).rejects.toThrow();
  });

  it("recusa turma de outra categoria", async () => {
    const r = await registrarAulaExperimental(
      repo,
      { responsavel: "Maria Souza", telefone: "44 98888-7777", atleta: "Pedro", anoNascimento: 2017, turmaId: "sub7-noite" },
      { temporada: 2026 },
    );
    expect(r.ok || r.erros).toEqual(["turma_invalida"]);
  });
});
