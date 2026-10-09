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
