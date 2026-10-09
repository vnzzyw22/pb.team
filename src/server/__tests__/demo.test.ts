import { describe, expect, it } from "vitest";
import { RepositorioMemoria, ServicoReservas, agoraEmMaringa, somarDias } from "@/lib";
import { RepositorioPostgres } from "../db/repositorio-postgres";
import { limparTudo } from "../db/schema";
import { semearDemo } from "../demo";
import { bancoDeTeste } from "./pglite";

/** Uma data de cada dia da semana (12/10/2026 é segunda), de manhã e tarde da noite. */
const instantes = [0, 1, 2, 3, 4, 5, 6].flatMap((d) => [
  new Date(`${somarDias("2026-10-12", d)}T09:00:00-03:00`),
  new Date(`${somarDias("2026-10-12", d)}T23:30:00-03:00`),
]);

describe("dados da demo", () => {
  it.each(instantes.map((i) => [i.toISOString(), i]))("funcionam começando em %s", async (_, instante) => {
    const repo = new RepositorioMemoria();
    await semearDemo(repo, instante as Date);
    const hoje = agoraEmMaringa(instante as Date).data;
    const reservas = await repo.reservasEntre(somarDias(hoje, -21), somarDias(hoje, 60));

    expect(reservas.filter((r) => r.status === "aguardando_sinal")).toHaveLength(1);
    expect(reservas.filter((r) => r.status === "nao_compareceu")).toHaveLength(1);
    expect(reservas.filter((r) => r.itens.some((i) => i.recursoId === "churrasqueira")).length).toBeGreaterThanOrEqual(3);
    expect(reservas.filter((r) => r.origem === "mensalista" && r.data > hoje).length).toBeGreaterThan(10);
    expect(await repo.series()).toHaveLength(3);
    expect(await repo.leads()).toHaveLength(5);

    // nada se sobrepõe na agenda
    for (const recurso of ["quadra", "churrasqueira"] as const) {
      const porDia = new Map<string, [number, number][]>();
      for (const r of reservas) {
        if (["cancelada", "expirada"].includes(r.status)) continue;
        for (const i of r.itens) if (i.recursoId === recurso) porDia.set(r.data, [...(porDia.get(r.data) ?? []), [i.intervalo.inicio, i.intervalo.fim]]);
      }
      for (const [dia, faixas] of porDia) {
        faixas.sort((a, b) => a[0] - b[0]);
        for (let k = 1; k < faixas.length; k++) expect(faixas[k][0], `${recurso} ${dia}`).toBeGreaterThanOrEqual(faixas[k - 1][1]);
      }
    }

    // o resumo financeiro do período tem números
    const servico = new ServicoReservas(repo, () => instante as Date);
    const resumo = await servico.resumo(somarDias(hoje, -14), hoje);
    expect(resumo.horasVendidas).toBeGreaterThan(5);
    expect(resumo.recebido).toBeGreaterThan(0);
  });

  it("grava no Postgres sem conflitos e pode ser refeita", async () => {
    const db = await bancoDeTeste();
    const repo = new RepositorioPostgres(db);
    const instante = new Date("2026-10-14T10:00:00-03:00");
    await semearDemo(repo, instante);
    await limparTudo(db);
    await semearDemo(repo, instante);
    expect(await repo.leads()).toHaveLength(5);
  });
});
