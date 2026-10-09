import { describe, expect, it } from "vitest";
import {
  agoraEmMaringa,
  anosDeNascimento,
  calcularSinal,
  categoriaPorAnoNascimento,
  categoriaPorId,
  conflitosNaGrade,
  crc16,
  diaDaSemana,
  formatarHora,
  formatarHoraCurta,
  formatarMoeda,
  formatarTelefone,
  gerarPixCopiaECola,
  hora,
  linkWhatsApp,
  normalizarTelefone,
  ocupacaoSemanal,
  orcar,
  resumoHorarios,
  somarDias,
  turmaPorId,
  validarData,
} from "..";

describe("tempo", () => {
  it("converte horários", () => {
    expect(hora("14:30")).toBe(870);
    expect(hora("24:00")).toBe(1440);
    expect(formatarHora(870)).toBe("14:30");
    expect(formatarHoraCurta(1140)).toBe("19h");
    expect(formatarHoraCurta(930)).toBe("15h30");
    expect(() => hora("25:00")).toThrow();
  });

  it("valida datas e dias da semana", () => {
    expect(validarData("2026-02-30")).toBe(false);
    expect(diaDaSemana("2026-10-12")).toBe(1); // segunda
    expect(somarDias("2026-12-30", 3)).toBe("2027-01-02");
  });

  it("calcula o 'agora' no fuso de Maringá, inclusive perto da meia-noite", () => {
    expect(agoraEmMaringa(new Date("2026-10-12T12:00:00Z"))).toMatchObject({ data: "2026-10-12", minutos: 540 });
    expect(agoraEmMaringa(new Date("2026-10-13T02:30:00Z"))).toMatchObject({ data: "2026-10-12", minutos: 1410 });
  });
});

describe("categorias", () => {
  const cat = (ano: number) => {
    const r = categoriaPorAnoNascimento(ano, 2026);
    return r.ok ? r.categoria.id : r.motivo;
  };

  it("encontra a categoria pelo ano de nascimento", () => {
    expect(cat(2022)).toBe("baby");
    expect(cat(2020)).toBe("baby");
    expect(cat(2019)).toBe("sub7");
    expect(cat(2018)).toBe("sub9"); // sem Sub-8: sobe para a seguinte
    expect(cat(2016)).toBe("sub10");
    expect(cat(2012)).toBe("sub15"); // sem Sub-14
    expect(cat(2009)).toBe("sub17");
  });

  it("trata quem está fora das faixas", () => {
    expect(cat(2023)).toBe("muito_novo");
    expect(cat(2008)).toBe("muito_velho");
    expect(cat(2030)).toBe("ano_invalido");
  });

  it("toda idade de 4 a 17 anos tem exatamente uma categoria", () => {
    for (let idade = 4; idade <= 17; idade++) {
      expect(categoriaPorAnoNascimento(2026 - idade, 2026).ok).toBe(true);
    }
  });

  it("lista os anos atendidos por categoria", () => {
    expect(anosDeNascimento(categoriaPorId("sub9")!, 2026)).toEqual([2018, 2017]);
  });

  it("grade de treinos não tem dois treinos ao mesmo tempo na quadra", () => {
    expect(conflitosNaGrade()).toEqual([]);
  });

  it("resume os horários das turmas como nas artes do clube", () => {
    expect(resumoHorarios(turmaPorId("sub11-tarde")!.turma)).toEqual(["Ter, Qui e Sex · 15h30"]);
    expect(resumoHorarios(turmaPorId("sub10-tarde")!.turma)).toEqual(["Seg e Qua · 14h30"]);
  });
});

describe("preços", () => {
  it("cobra por faixa quando o horário atravessa diurno e noturno", () => {
    const o = orcar("2026-10-12", [{ recursoId: "quadra", intervalo: { inicio: hora("16:00"), fim: hora("18:00") } }]);
    expect(o.itens.map((i) => i.valor)).toEqual([12000, 16000]);
    expect(o.total).toBe(28000);
  });

  it("aplica desconto no combo quadra + churrasqueira", () => {
    const o = orcar("2026-10-17", [
      { recursoId: "quadra", intervalo: { inicio: hora("10:00"), fim: hora("11:00") } },
      { recursoId: "churrasqueira", intervalo: { inicio: hora("10:00"), fim: hora("14:00") } },
    ]);
    expect(o.subtotal).toBe(30000);
    expect(o.desconto).toBe(3000);
    expect(o.total).toBe(27000);
    expect(o.sinal).toBe(13500);
  });

  it("arredonda o sinal para reais inteiros", () => {
    expect(calcularSinal(16000)).toBe(8000);
    expect(calcularSinal(16500)).toBe(8300);
  });

  it("formata moeda", () => {
    expect(formatarMoeda(16000)).toBe("R$ 160,00");
  });
});

describe("whatsapp", () => {
  it("normaliza telefones brasileiros", () => {
    expect(normalizarTelefone("(44) 99944-8422")).toBe("5544999448422");
    expect(normalizarTelefone("+55 44 99944-8422")).toBe("5544999448422");
    expect(normalizarTelefone("044 3025-1234")).toBe("554430251234");
    expect(normalizarTelefone("12345")).toBeNull();
    expect(normalizarTelefone("44 89944-8422")).toBeNull();
  });

  it("formata e gera links", () => {
    expect(formatarTelefone("5544999448422")).toBe("(44) 99944-8422");
    expect(linkWhatsApp("Olá, tudo bem?")).toBe("https://wa.me/5544999448422?text=Ol%C3%A1%2C%20tudo%20bem%3F");
  });
});

describe("pix", () => {
  it("reproduz o exemplo do manual do Banco Central", () => {
    const codigo = gerarPixCopiaECola({
      chave: "123e4567-e12b-12d1-a456-426655440000",
      recebedor: "Fulano de Tal",
      cidade: "BRASILIA",
    });
    expect(codigo).toBe(
      "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D",
    );
  });

  it("embute valor e código da reserva, com CRC válido", () => {
    const codigo = gerarPixCopiaECola({ chave: "pb@exemplo.com", recebedor: "PB Team Futsal", cidade: "Maringá", valor: 8000, txid: "PB-7K3Q" });
    expect(codigo).toContain("540580.00");
    expect(codigo).toContain("62100506PB7K3Q");
    expect(codigo).toContain("6007Maringa");
    expect(crc16(codigo.slice(0, -4))).toBe(codigo.slice(-4));
  });
});

describe("ocupação semanal", () => {
  it("soma treinos e horas livres da quadra", () => {
    const s = ocupacaoSemanal();
    expect(s.horasTreino).toBe(27);
    expect(s.horasAbertas).toBe(102);
    expect(s.horasLivres).toBe(75);
    expect(s.dias[0].nome).toBe("Segunda-feira");
    // sexta: só o Sub-11 às 15h30 — a noite inteira livre
    const sexta = s.dias.find((d) => d.dia === 5)!;
    expect(sexta.minutosLivresNobres).toBe(5 * 60);
  });
});
