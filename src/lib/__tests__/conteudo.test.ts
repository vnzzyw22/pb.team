import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CLUBE, FOTOS, VIDEOS, fotoPorId, fotosPorTipo, mensagens } from "..";

const publico = (src: string) => path.join(__dirname, "../../../public", src);

/** Lê largura × altura do cabeçalho de um WebP (VP8, VP8L ou VP8X). */
function dimensoesWebp(arquivo: string): [number, number] {
  const b = readFileSync(arquivo);
  const tipo = b.toString("ascii", 12, 16);
  if (tipo === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (tipo === "VP8L") {
    const bits = b.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
}

describe("galeria", () => {
  it("toda foto existe, tem as dimensões declaradas e texto alternativo", () => {
    for (const f of FOTOS) {
      expect(existsSync(publico(f.src)), f.src).toBe(true);
      expect(dimensoesWebp(publico(f.src)), f.src).toEqual([f.largura, f.altura]);
      expect(f.alt.length, f.id).toBeGreaterThan(20);
    }
  });

  it("ids são únicos", () => {
    expect(new Set(FOTOS.map((f) => f.id)).size).toBe(FOTOS.length);
  });

  it("vídeos e pôsteres existem", () => {
    for (const v of VIDEOS) {
      expect(existsSync(publico(v.src)), v.src).toBe(true);
      expect(existsSync(publico(v.poster)), v.poster).toBe(true);
    }
  });

  it("filtra por tipo", () => {
    expect(fotosPorTipo("tecnico").map((f) => f.id)).toEqual(["pietro-bettin-trofeu-paranaense-2022", "pietro-bettin-banco"]);
  });
});

describe("conteúdo do clube", () => {
  it("fotos citadas pelo técnico e pelo histórico existem", () => {
    for (const id of CLUBE.tecnico.fotos) expect(fotoPorId(id), id).toBeDefined();
    for (const r of CLUBE.historico) if ("fotoId" in r && r.fotoId) expect(fotoPorId(r.fotoId), r.fotoId).toBeDefined();
  });

  it("histórico está do mais recente para o mais antigo (sem ano no fim)", () => {
    const anos = CLUBE.historico.map((r) => ("ano" in r ? r.ano : undefined));
    const comAno = anos.filter((a): a is number => a !== undefined);
    expect(comAno).toEqual([...comAno].sort((a, b) => b - a));
    expect(anos.indexOf(undefined)).toBe(comAno.length);
  });

  it("gera a mensagem de interesse em anunciar", () => {
    const m = mensagens.anuncie({ empresa: "Padaria do Bairro", formato: "Banners na arena" });
    expect(m).toContain("Olá, Pietro!");
    expect(m).toContain("Empresa: Padaria do Bairro");
    expect(m).not.toContain("Responsável");
  });
});

describe("conteúdo publicável", () => {
  it("histórico público omite campos pendentes", async () => {
    const { historicoPublico } = await import("..");
    const pub = historicoPublico();
    const paranaense2025 = pub.find((r) => r.competicao === "Campeonato Paranaense de Futsal")!;
    expect(paranaense2025.ano).toBeUndefined(); // ano pendente
    expect(paranaense2025.categoria).toBe("Sub-9");
    const ingá = pub.find((r) => r.competicao === "Copa Ingá de Futsal")!;
    expect(ingá).toMatchObject({ categoria: "Sub-9 Federados", colocacao: "Campeão" });
    expect(ingá.ano).toBeUndefined();
    expect(pub.find((r) => r.ano === 2024)).toMatchObject({ categoria: "Sub-10 masculino", fotoId: "paranaense-2024-sub10-8-lugar" });
    for (const r of pub) expect(r).not.toHaveProperty("confirmar");
  });

  it("resultado com colocação pendente fica de fora", async () => {
    const { historicoPublico } = await import("..");
    const pub = historicoPublico([
      { competicao: "Copa X", colocacao: "Campeão", titulo: true, confirmar: ["colocacao"] },
      { competicao: "Copa Y", colocacao: "Vice", titulo: true, ano: 2023 },
    ]);
    expect(pub.map((r) => r.competicao)).toEqual(["Copa Y"]);
  });

  it("Super Copa América é título tanto no resumo quanto no histórico", async () => {
    const { historicoPublico } = await import("..");
    expect(CLUBE.conquistas.some((c) => c.titulo.startsWith("Super Copa América"))).toBe(true);
    expect(historicoPublico().find((r) => r.competicao.startsWith("Super Copa América"))).toMatchObject({ colocacao: "Campeão", titulo: true });
  });

  it("torneios, patrocinadores e lista de pendências", async () => {
    const { torneiosPublicos, patrocinadoresPublicos, pendenciasDeConteudo } = await import("..");
    expect(torneiosPublicos()).not.toContain("Copa do Mundo");
    expect(patrocinadoresPublicos().every((p) => p.confirmado)).toBe(true);
    const pendencias = pendenciasDeConteudo();
    expect(pendencias).toContain("Copa MBB (Francisco Beltrão): ano e categoria");
    expect(pendencias.some((p) => p.includes("Thermotech"))).toBe(true);
  });
});

describe("mensagens", () => {
  it("aula experimental sem 'nascido em' (vale para meninos e meninas)", () => {
    const m = mensagens.aulaExperimental({ responsavel: "Maria", atleta: "Helena", anoNascimento: 2019 });
    expect(m).not.toMatch(/nascid/);
    expect(m).toContain("Ano de nascimento: 2019");
  });

  it("interesse na Arena, com e sem detalhes", () => {
    expect(mensagens.interesseArena()).toBe("Olá! Quero saber sobre a locação da Arena PB Team.");
    const m = mensagens.interesseArena({ nome: "Carlos", data: "2026-10-16", periodo: "noite", comChurrasqueira: true });
    expect(m).toContain("Data desejada: Sexta-feira, 16/10/2026");
    expect(m).toContain("Período: noite");
    expect(m).toContain("Com churrasqueira");
  });
});

describe("validação da aula experimental sem banco", () => {
  it("normaliza, encontra a categoria e gera o WhatsApp sem gravar nada", async () => {
    const { validarAulaExperimental } = await import("..");
    const v = validarAulaExperimental(
      { responsavel: "  Maria   Souza ", telefone: "(44) 98888-7777", atleta: "Pedro", anoNascimento: 2017, turmaId: "sub9" },
      { temporada: 2026 },
    );
    if (!v.ok) throw new Error(v.erros.join());
    expect(v.dados).toMatchObject({ responsavel: "Maria Souza", telefone: "5544988887777", categoriaNome: "Sub-9", turmaNome: "Turma única" });
    expect(v.whatsapp).toContain("wa.me/5544999448422");
  });

  it("aponta todos os erros de uma vez", async () => {
    const { validarAulaExperimental } = await import("..");
    const v = validarAulaExperimental({ responsavel: "M", telefone: "123", atleta: "", anoNascimento: 2025 }, { temporada: 2026 });
    expect(v.ok || v.erros).toEqual(["responsavel_invalido", "atleta_invalido", "telefone_invalido", "fora_das_categorias"]);
  });
});
