import { describe, expect, it } from "vitest";
import { criarToken, senhaConfere, senhaDoPainel, tokenValido } from "../painel/sessao";

const prod = { PAINEL_SENHA: "segredo-forte", DATABASE_URL: "postgres://x" };

describe("sessão do painel", () => {
  it("usa a senha configurada e confere sem vazar tempo", () => {
    expect(senhaConfere("segredo-forte", prod)).toBe(true);
    expect(senhaConfere("errada", prod)).toBe(false);
  });

  it("modo demo tem senha padrão; produção sem senha é erro", () => {
    expect(senhaDoPainel({})).toBe("pbteam2019");
    expect(senhaDoPainel({ DATABASE_URL: "x", DEMO: "true" })).toBe("pbteam2019");
    expect(() => senhaDoPainel({ DATABASE_URL: "x" })).toThrow();
  });

  it("token vale por 7 dias e não aceita adulteração", () => {
    const agora = Date.now();
    const token = criarToken(agora, prod);
    expect(tokenValido(token, agora, prod)).toBe(true);
    expect(tokenValido(token, agora + 8 * 86_400_000, prod)).toBe(false);
    const [exp, sig] = token.split(".");
    expect(tokenValido(`${Number(exp) + 1e9}.${sig}`, agora, prod)).toBe(false);
    expect(tokenValido(token, agora, { ...prod, PAINEL_SENHA: "outra" })).toBe(false);
    expect(tokenValido(undefined, agora, prod)).toBe(false);
    expect(tokenValido("lixo", agora, prod)).toBe(false);
  });
});
