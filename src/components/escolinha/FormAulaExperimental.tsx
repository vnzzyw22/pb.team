"use client";

import { useEffect, useRef, useState } from "react";
import {
  categoriaPorAnoNascimento,
  CLUBE,
  resumoHorarios,
  validarAulaExperimental,
  type EntradaAulaExperimental,
  type ErroLead,
} from "@/lib";
import { pedirAulaExperimental } from "@/server/acoes/publico";
import { Carregando } from "@/components/grafismos";
import { prepararAbaWhatsApp } from "@/components/ui/abaWhatsApp";
import { Campo, descritoPor, ResumoErros } from "@/components/ui/Campo";

/** Pedido vindo da busca ou do quadro: `n` muda a cada clique. */
export interface PedidoDeAgendamento {
  ano?: number;
  n: number;
}

type NomeCampo = "responsavel" | "telefone" | "atleta" | "ano" | "turma";

const ERROS: Record<ErroLead, { campo: NomeCampo; texto: string }> = {
  responsavel_invalido: { campo: "responsavel", texto: "Escreva o nome completo do responsável." },
  telefone_invalido: { campo: "telefone", texto: "Confira o WhatsApp com DDD, por exemplo (44) 99999-9999." },
  atleta_invalido: { campo: "atleta", texto: "Escreva o nome do atleta." },
  fora_das_categorias: { campo: "ano", texto: "Não há turma para esse ano de nascimento. Confira o ano." },
  turma_invalida: { campo: "turma", texto: "Essa turma não é da categoria do atleta. Escolha outra." },
};

const ORDEM: NomeCampo[] = ["responsavel", "telefone", "atleta", "ano", "turma"];
const VAZIO = { responsavel: "", telefone: "", atleta: "", ano: "", turmaId: "", observacoes: "" };

export function FormAulaExperimental({ pedido }: { pedido: PedidoDeAgendamento }) {
  const [valores, setValores] = useState(VAZIO);
  const [tocados, setTocados] = useState<Set<NomeCampo>>(new Set());
  const [tentou, setTentou] = useState(false);
  const [erros, setErros] = useState<ErroLead[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState<string | null>(null);
  const secao = useRef<HTMLElement>(null);
  const primeiroCampo = useRef<HTMLInputElement>(null);
  const resumo = useRef<HTMLDivElement>(null);

  // Clique em "Agendar aula" na busca ou no quadro: traz o ano e leva ao formulário.
  useEffect(() => {
    if (pedido.n === 0) return;
    if (pedido.ano) setValores((v) => ({ ...v, ano: String(pedido.ano), turmaId: "" }));
    setWhatsapp(null);
    secao.current?.scrollIntoView({ block: "start" });
    primeiroCampo.current?.focus({ preventScroll: true });
  }, [pedido]);

  const anoNumero = /^\d{4}$/.test(valores.ano) ? Number(valores.ano) : NaN;
  const categoria = Number.isNaN(anoNumero) ? null : categoriaPorAnoNascimento(anoNumero);
  const turmas = categoria?.ok ? categoria.categoria.turmas : [];

  const entrada = (v = valores): EntradaAulaExperimental => ({
    responsavel: v.responsavel,
    telefone: v.telefone,
    atleta: v.atleta,
    anoNascimento: /^\d{4}$/.test(v.ano) ? Number(v.ano) : NaN,
    turmaId: v.turmaId || undefined,
    observacoes: v.observacoes || undefined,
  });

  const validar = (v = valores) => {
    const r = validarAulaExperimental(entrada(v));
    return r.ok ? [] : r.erros;
  };

  const erroDe = (campo: NomeCampo): string | undefined => {
    if (!tentou && !tocados.has(campo)) return undefined;
    const e = erros.find((x) => ERROS[x].campo === campo);
    return e ? ERROS[e].texto : undefined;
  };

  const mudar = (campo: keyof typeof VAZIO, valor: string) => {
    const novo = { ...valores, [campo]: valor };
    if (campo === "ano") novo.turmaId = "";
    setValores(novo);
    if (tentou || tocados.size) setErros(validar(novo));
  };

  const sair = (campo: NomeCampo) => {
    setTocados((t) => new Set(t).add(campo));
    setErros(validar());
  };

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    setErroGeral(null);
    const atuais = validar();
    setErros(atuais);
    if (atuais.length) {
      requestAnimationFrame(() => resumo.current?.focus());
      return;
    }
    const aba = prepararAbaWhatsApp();
    setEnviando(true);
    try {
      const r = await pedirAulaExperimental(entrada());
      if (r.ok) {
        setWhatsapp(r.whatsapp);
        aba.abrir(r.whatsapp);
      } else {
        aba.cancelar();
        setErros(r.erros);
        requestAnimationFrame(() => resumo.current?.focus());
      }
    } catch {
      aba.cancelar();
      setErroGeral("Não foi possível enviar agora. Tente de novo em instantes ou fale direto com o clube pelo WhatsApp.");
    } finally {
      setEnviando(false);
    }
  }

  const itensResumo = tentou
    ? ORDEM.flatMap((campo) => {
        const e = erros.find((x) => ERROS[x].campo === campo);
        return e ? [{ campo: `aula-${campo}`, texto: ERROS[e].texto }] : [];
      })
    : [];

  return (
    <section
      ref={secao}
      id="aula-experimental"
      aria-labelledby="titulo-aula"
      className="scroll-mt-16 border-t border-linha lg:scroll-mt-20"
    >
      <div className="recipiente secao lg:grid lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-5">
          <h2 id="titulo-aula" className="titulo t-2">
            Aula experimental
          </h2>
          <p className="lead mt-6 max-w-[34ch] text-giz">
            Preencha os dados do atleta e continue a conversa com o {CLUBE.nome} no WhatsApp, com a mensagem já pronta.
          </p>
        </div>

        <div className="mt-10 lg:col-span-7 lg:mt-2">
          {whatsapp ? (
            <div role="status" className="aviso aviso-ok p-6">
              <p className="t-4 titulo">Pedido registrado</p>
              <p className="mt-3 text-giz">
                O WhatsApp abre com a mensagem pronta para o clube. Se ele não abriu, use o botão abaixo.
              </p>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-neon">
                  Abrir o WhatsApp
                </a>
                <button
                  type="button"
                  className="link-jogada inline-flex min-h-11 items-center self-start sm:self-auto"
                  onClick={() => {
                    setWhatsapp(null);
                    setValores(VAZIO);
                    setTocados(new Set());
                    setTentou(false);
                    setErros([]);
                  }}
                >
                  Fazer outro pedido
                </button>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={enviar} className="grid gap-6" aria-describedby="aula-obrigatorios">
              <p id="aula-obrigatorios" className="text-sm text-giz">
                Todos os campos são obrigatórios, menos turma e observações.
              </p>
              <ResumoErros ref={resumo} itens={itensResumo} />
              {erroGeral && (
                <p role="alert" className="aviso aviso-erro">
                  {erroGeral}
                </p>
              )}

              <Campo id="aula-responsavel" rotulo="Nome do responsável" erro={erroDe("responsavel")}>
                <input
                  ref={primeiroCampo}
                  id="aula-responsavel"
                  className="entrada"
                  autoComplete="name"
                  value={valores.responsavel}
                  onChange={(e) => mudar("responsavel", e.target.value)}
                  onBlur={() => sair("responsavel")}
                  aria-invalid={erroDe("responsavel") ? true : undefined}
                  aria-describedby={descritoPor("aula-responsavel", erroDe("responsavel"))}
                />
              </Campo>

              <Campo id="aula-telefone" rotulo="WhatsApp do responsável" erro={erroDe("telefone")} ajuda="Com DDD.">
                <input
                  id="aula-telefone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className="entrada dado"
                  placeholder="(44) 99999-9999"
                  value={valores.telefone}
                  onChange={(e) => mudar("telefone", e.target.value)}
                  onBlur={() => sair("telefone")}
                  aria-invalid={erroDe("telefone") ? true : undefined}
                  aria-describedby={descritoPor("aula-telefone", erroDe("telefone"), true)}
                />
              </Campo>

              <div className="grid gap-6 sm:grid-cols-[1fr_11rem]">
                <Campo id="aula-atleta" rotulo="Nome do atleta" erro={erroDe("atleta")}>
                  <input
                    id="aula-atleta"
                    className="entrada"
                    autoComplete="off"
                    value={valores.atleta}
                    onChange={(e) => mudar("atleta", e.target.value)}
                    onBlur={() => sair("atleta")}
                    aria-invalid={erroDe("atleta") ? true : undefined}
                    aria-describedby={descritoPor("aula-atleta", erroDe("atleta"))}
                  />
                </Campo>
                <Campo
                  id="aula-ano"
                  rotulo="Ano de nascimento"
                  erro={erroDe("ano")}
                  ajuda={categoria?.ok ? `Categoria ${categoria.categoria.nome}` : "Ex.: 2016"}
                >
                  <input
                    id="aula-ano"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={4}
                    className="entrada dado"
                    value={valores.ano}
                    onChange={(e) => mudar("ano", e.target.value.replace(/\D/g, "").slice(0, 4))}
                    onBlur={() => sair("ano")}
                    aria-invalid={erroDe("ano") ? true : undefined}
                    aria-describedby={descritoPor("aula-ano", erroDe("ano"), true)}
                  />
                </Campo>
              </div>

              <Campo
                id="aula-turma"
                rotulo="Turma"
                opcional
                erro={erroDe("turma")}
                ajuda={turmas.length ? "Se não escolher, o clube indica a melhor." : "Informe o ano de nascimento para ver as turmas."}
              >
                <select
                  id="aula-turma"
                  className="entrada"
                  value={valores.turmaId}
                  disabled={!turmas.length}
                  onChange={(e) => mudar("turmaId", e.target.value)}
                  onBlur={() => sair("turma")}
                  aria-invalid={erroDe("turma") ? true : undefined}
                  aria-describedby={descritoPor("aula-turma", erroDe("turma"), true)}
                >
                  <option value="">Sem preferência</option>
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}: {resumoHorarios(t).join(", ")}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo id="aula-observacoes" rotulo="Observações" opcional>
                <textarea
                  id="aula-observacoes"
                  className="entrada"
                  rows={3}
                  maxLength={500}
                  value={valores.observacoes}
                  onChange={(e) => mudar("observacoes", e.target.value)}
                />
              </Campo>

              <div>
                <button type="submit" className="btn btn-neon w-full sm:w-auto" disabled={enviando} aria-busy={enviando || undefined}>
                  {enviando && <Carregando />}
                  {enviando ? "Enviando…" : "Enviar e abrir o WhatsApp"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
