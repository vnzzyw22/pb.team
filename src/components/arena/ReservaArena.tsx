"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  formatarHora,
  formatarMoeda,
  normalizarTelefone,
  orcar,
  POLITICA,
  RECURSOS,
  type DataISO,
  type ErroSolicitacao,
  type HorarioLivre,
  type ItemReserva,
  type Orcamento,
  type Reserva,
} from "@/lib";
import { buscarHorarios, pedirReserva } from "@/server/acoes/publico";
import { Carregando } from "@/components/grafismos";
import { Campo, descritoPor } from "@/components/ui/Campo";
import {
  dataPorExtenso,
  formatarDuracao,
  MENSAGENS_ERRO_RESERVA,
  proximosDias,
  type DiaReservavel,
} from "./formatos";
import { formatarContagem, useContagem } from "./useContagem";

const ERROS_DE_HORARIO: ErroSolicitacao[] = [
  "conflito",
  "antecedencia_minima",
  "no_passado",
  "inicio_fora_da_grade",
  "fora_do_expediente",
  "fechado",
  "alem_da_janela",
  "duracao_invalida",
  "data_invalida",
  "horario_invalido",
  "recurso_inativo",
];

const CHIP =
  "relative flex cursor-pointer select-none flex-col items-center justify-center border border-linha-forte text-center transition-colors " +
  "has-[:checked]:border-neon has-[:checked]:bg-neon has-[:checked]:text-preto " +
  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neon " +
  "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-35";

interface Confirmacao {
  reserva: Reserva;
  pix?: string;
  whatsapp: string;
}

export function ReservaArena({ onReservada }: { onReservada?: (codigo: string) => void }) {
  const churrasqueira = RECURSOS.churrasqueira;
  const [dias, setDias] = useState<DiaReservavel[]>([]);
  const [data, setData] = useState<DataISO | null>(null);
  const [duracao, setDuracao] = useState<number | null>(null);
  const [horarios, setHorarios] = useState<HorarioLivre[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [falhaBusca, setFalhaBusca] = useState(false);
  const [recarga, setRecarga] = useState(0);
  const [horario, setHorario] = useState<HorarioLivre | null>(null);
  const [combo, setCombo] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [erros, setErros] = useState<ErroSolicitacao[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [falhaEnvio, setFalhaEnvio] = useState<string | null>(null);
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null);
  const pedidoAtual = useRef(0);
  const topo = useRef<HTMLDivElement>(null);
  const avisoHorario = useRef<HTMLDivElement>(null);

  // Datas calculadas no navegador, no fuso de Maringá.
  useEffect(() => setDias(proximosDias(30)), []);

  useEffect(() => {
    if (!data || !duracao) return;
    const id = ++pedidoAtual.current;
    setCarregando(true);
    setFalhaBusca(false);
    setHorario(null);
    buscarHorarios("quadra", data, duracao)
      .then((lista) => id === pedidoAtual.current && setHorarios(lista))
      .catch(() => {
        if (id !== pedidoAtual.current) return;
        setHorarios(null);
        setFalhaBusca(true);
      })
      .finally(() => id === pedidoAtual.current && setCarregando(false));
  }, [data, duracao, recarga]);

  const itens: ItemReserva[] | null =
    data && horario
      ? [
          { recursoId: "quadra", intervalo: { inicio: horario.inicio, fim: horario.fim } },
          ...(combo
            ? [{ recursoId: "churrasqueira" as const, intervalo: { inicio: horario.inicio, fim: horario.inicio + churrasqueira.duracoes[0] } }]
            : []),
        ]
      : null;
  let orcamento: Orcamento | null = null;
  try {
    orcamento = data && itens ? orcar(data, itens) : null;
  } catch {
    orcamento = null;
  }

  const errosDeHorario = erros.filter((e) => ERROS_DE_HORARIO.includes(e));
  const erroNome = erros.includes("nome_invalido") ? MENSAGENS_ERRO_RESERVA.nome_invalido : undefined;
  const erroTelefone = erros.includes("telefone_invalido") ? MENSAGENS_ERRO_RESERVA.telefone_invalido : undefined;
  const erroCombo = erros.includes("combo_indisponivel") ? MENSAGENS_ERRO_RESERVA.combo_indisponivel : undefined;

  async function reservar(e: React.FormEvent) {
    e.preventDefault();
    if (!data || !duracao || !horario) return;
    const locais: ErroSolicitacao[] = [];
    if (!nome.trim()) locais.push("nome_invalido");
    if (!normalizarTelefone(telefone)) locais.push("telefone_invalido");
    setErros(locais);
    setFalhaEnvio(null);
    if (locais.length) {
      document.getElementById(locais[0] === "nome_invalido" ? "reserva-nome" : "reserva-telefone")?.focus();
      return;
    }
    setEnviando(true);
    try {
      const r = await pedirReserva({
        data,
        recursoId: "quadra",
        inicio: formatarHora(horario.inicio),
        duracao,
        comChurrasqueira: combo,
        cliente: { nome, telefone },
        observacoes: observacoes || undefined,
      });
      if (r.ok) {
        setConfirmacao({ reserva: r.reserva, pix: r.pixCopiaECola, whatsapp: r.whatsapp });
        setErros([]);
        onReservada?.(r.reserva.codigo);
        requestAnimationFrame(() => topo.current?.scrollIntoView({ block: "start" }));
      } else {
        setErros(r.erros);
        if (r.erros.some((x) => ERROS_DE_HORARIO.includes(x))) {
          setRecarga((n) => n + 1);
          requestAnimationFrame(() => avisoHorario.current?.focus());
        }
      }
    } catch {
      setFalhaEnvio("Não foi possível concluir a reserva agora. Tente de novo em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  function recomecar() {
    setConfirmacao(null);
    setHorario(null);
    setCombo(false);
    setErros([]);
    setRecarga((n) => n + 1);
    requestAnimationFrame(() => topo.current?.scrollIntoView({ block: "start" }));
  }

  if (confirmacao) {
    return (
      <div ref={topo} className="scroll-mt-24">
        <ConfirmacaoReserva confirmacao={confirmacao} onNova={recomecar} />
      </div>
    );
  }

  const nEtapaDados = churrasqueira.ativo ? 5 : 4;

  return (
    <div ref={topo} className="scroll-mt-24">
      <form noValidate onSubmit={reservar} className="grid gap-12">
        <Etapa n={1} titulo="Escolha o dia">
          {dias.length === 0 ? (
            <div className="flex gap-2" aria-hidden>
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className="h-[4.25rem] w-[4.5rem] shrink-0 animate-pulse bg-friso" />
              ))}
            </div>
          ) : (
            <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 lg:flex-wrap">
              {dias.map((d) => (
                <label key={d.data} className={`${CHIP} h-[4.25rem] w-[4.5rem] shrink-0 snap-start`}>
                  <input
                    type="radio"
                    name="dia"
                    value={d.data}
                    className="sr-only"
                    checked={data === d.data}
                    disabled={!d.aberto}
                    onChange={() => {
                      setData(d.data);
                      setErros([]);
                    }}
                    aria-label={d.nomeCompleto}
                  />
                  <span className="text-[0.8125rem] font-semibold">{d.rotuloCurto}</span>
                  <span className="dado mt-0.5 text-lg">{d.diaMes}</span>
                </label>
              ))}
            </div>
          )}
        </Etapa>

        {data && (
          <Etapa n={2} titulo="Quanto tempo de jogo?">
            <div className="flex flex-wrap gap-2">
              {RECURSOS.quadra.duracoes.map((m) => (
                <label key={m} className={`${CHIP} h-14 min-w-[5.5rem] px-4`}>
                  <input
                    type="radio"
                    name="duracao"
                    value={m}
                    className="sr-only"
                    checked={duracao === m}
                    onChange={() => {
                      setDuracao(m);
                      setErros([]);
                    }}
                  />
                  <span className="dado text-xl">{formatarDuracao(m)}</span>
                </label>
              ))}
            </div>
          </Etapa>
        )}

        {data && duracao && (
          <Etapa n={3} titulo="Escolha o horário" detalhe={dataPorExtenso(data)}>
            {errosDeHorario.length > 0 && (
              <div ref={avisoHorario} tabIndex={-1} role="alert" className="aviso aviso-erro mb-5 outline-none">
                {errosDeHorario.map((e) => (
                  <p key={e}>{MENSAGENS_ERRO_RESERVA[e]}</p>
                ))}
              </div>
            )}
            <div aria-live="polite" aria-busy={carregando}>
              {carregando && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6" aria-hidden>
                  {Array.from({ length: 12 }, (_, i) => (
                    <span key={i} className="h-[4.75rem] animate-pulse bg-friso" />
                  ))}
                </div>
              )}
              {carregando && <p className="sr-only">Carregando horários livres…</p>}
              {!carregando && falhaBusca && (
                <div className="aviso aviso-erro">
                  <p>Não foi possível carregar os horários.</p>
                  <button type="button" className="link-jogada mt-2 inline-flex min-h-11 items-center" onClick={() => setRecarga((n) => n + 1)}>
                    Tentar de novo
                  </button>
                </div>
              )}
              {!carregando && !falhaBusca && horarios && horarios.length === 0 && (
                <div className="aviso">
                  <p className="font-semibold">Nenhum horário livre nesse dia para {formatarDuracao(duracao)}.</p>
                  <p className="mt-1 text-giz">Tente outra duração ou outro dia. Os horários de treino da escolinha já ficam de fora.</p>
                </div>
              )}
              {!carregando && !falhaBusca && horarios && horarios.length > 0 && (
                <fieldset>
                  <legend className="sr-only">Horários livres</legend>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                    {horarios.map((h) => (
                      <label key={h.inicio} className={`${CHIP} group min-h-[4.75rem] px-2 py-2`}>
                        <input
                          type="radio"
                          name="horario"
                          value={h.inicio}
                          className="sr-only"
                          checked={horario?.inicio === h.inicio}
                          onChange={() => {
                            setHorario(h);
                            setErros([]);
                          }}
                          aria-label={`${h.rotulo} às ${formatarHora(h.fim)}, ${formatarMoeda(h.preco)}`}
                        />
                        <span className="dado text-xl text-neon group-has-[:checked]:text-preto">{h.rotulo}</span>
                        <span className="text-xs text-giz group-has-[:checked]:text-preto">até {formatarHora(h.fim)}</span>
                        <span className="dado mt-0.5 text-sm group-has-[:checked]:text-preto">{formatarMoeda(h.preco)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
            </div>
          </Etapa>
        )}

        {horario && churrasqueira.ativo && (
          <Etapa n={4} titulo="Quer a churrasqueira junto?">
            <label className="quadro flex cursor-pointer items-start gap-4 p-4 has-[:checked]:border-neon has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neon sm:p-5">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0"
                checked={combo}
                onChange={(e) => {
                  setCombo(e.target.checked);
                  setErros((x) => x.filter((y) => y !== "combo_indisponivel"));
                }}
                aria-describedby={erroCombo ? "reserva-combo-erro" : undefined}
              />
              <span>
                <span className="block font-semibold">
                  {RECURSOS.quadra.nome} + {churrasqueira.nome.toLowerCase()}
                </span>
                <span className="mt-1 block text-giz">
                  {churrasqueira.descricao} {churrasqueira.preco.tipo === "fixo" && `${churrasqueira.preco.rotulo}: ${formatarMoeda(churrasqueira.preco.valor)}.`}{" "}
                  {POLITICA.descontoComboPercentual}% de desconto no total do combo.
                </span>
              </span>
            </label>
            {erroCombo && (
              <p id="reserva-combo-erro" role="alert" className="erro-campo">
                {erroCombo}
              </p>
            )}
          </Etapa>
        )}

        {horario && (
          <Etapa n={nEtapaDados} titulo="Seus dados">
            <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:gap-12">
              <div className="grid content-start gap-6">
                <Campo id="reserva-nome" rotulo="Nome completo" erro={erroNome}>
                  <input
                    id="reserva-nome"
                    className="entrada"
                    autoComplete="name"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    aria-invalid={erroNome ? true : undefined}
                    aria-describedby={descritoPor("reserva-nome", erroNome)}
                  />
                </Campo>
                <Campo id="reserva-telefone" rotulo="WhatsApp" erro={erroTelefone} ajuda="Com DDD. É por ele que o clube confirma a reserva.">
                  <input
                    id="reserva-telefone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className="entrada dado"
                    placeholder="(44) 99999-9999"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    aria-invalid={erroTelefone ? true : undefined}
                    aria-describedby={descritoPor("reserva-telefone", erroTelefone, true)}
                  />
                </Campo>
                <Campo id="reserva-obs" rotulo="Observações" opcional>
                  <textarea
                    id="reserva-obs"
                    className="entrada"
                    rows={2}
                    maxLength={500}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                  />
                </Campo>
              </div>

              {orcamento && (
                <div className="quadro-cheio self-start p-5">
                  <p className="rotulo">Resumo</p>
                  <p className="mt-1 text-sm text-giz">
                    {dataPorExtenso(data!)}, {horario.rotulo} às {formatarHora(horario.fim)}
                  </p>
                  <dl className="mt-4 grid gap-2 text-[0.9375rem]">
                    {orcamento.itens.map((i, n) => (
                      <div key={`${i.rotulo}-${n}`} className="flex justify-between gap-4">
                        <dt className="text-giz">{i.rotulo}</dt>
                        <dd className="dado shrink-0">{formatarMoeda(i.valor)}</dd>
                      </div>
                    ))}
                    {orcamento.desconto > 0 && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-giz">Desconto do combo</dt>
                        <dd className="dado shrink-0">−{formatarMoeda(orcamento.desconto)}</dd>
                      </div>
                    )}
                    <div className="mt-2 flex justify-between gap-4 border-t border-linha pt-3 font-semibold">
                      <dt>Total</dt>
                      <dd className="dado shrink-0">{formatarMoeda(orcamento.total)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Sinal agora ({POLITICA.sinalPercentual}%)</dt>
                      <dd className="dado shrink-0 text-neon">{formatarMoeda(orcamento.sinal)}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>

            {falhaEnvio && (
              <p role="alert" className="aviso aviso-erro mt-6">
                {falhaEnvio}
              </p>
            )}
            <button type="submit" className="btn btn-neon mt-8 w-full sm:w-auto" disabled={enviando} aria-busy={enviando || undefined}>
              {enviando && <Carregando />}
              {enviando ? "Reservando…" : "Reservar e pagar o sinal"}
            </button>
            <p className="ajuda">
              O horário fica segurado por {POLITICA.prazoSinalMin} minutos enquanto você paga o sinal pelo Pix. Ao reservar, você
              concorda com os{" "}
              <Link href="/termos" className="underline decoration-dashed underline-offset-4 hover:text-branco">
                termos de uso
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" className="underline decoration-dashed underline-offset-4 hover:text-branco">
                política de privacidade
              </Link>
              .
            </p>
          </Etapa>
        )}
      </form>
    </div>
  );
}

function Etapa({ n, titulo, detalhe, children }: { n: number; titulo: string; detalhe?: string; children: React.ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="flex w-full items-baseline gap-4 border-t border-linha pt-5">
        <span className="numero text-[2rem] text-white/35" aria-hidden>
          {n}
        </span>
        <span className="titulo t-3">
          <span className="sr-only">Passo {n}: </span>
          {titulo}
        </span>
      </legend>
      {detalhe && <p className="mt-1 pl-[2.6rem] text-giz">{detalhe}</p>}
      <div className="mt-5">{children}</div>
    </fieldset>
  );
}

function ConfirmacaoReserva({ confirmacao, onNova }: { confirmacao: Confirmacao; onNova: () => void }) {
  const { reserva, pix, whatsapp } = confirmacao;
  const resta = useContagem(reserva.expiraEm);
  const expirou = resta === 0;
  const [copiado, setCopiado] = useState(false);
  const campoPix = useRef<HTMLTextAreaElement>(null);

  async function copiar() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix);
    } catch {
      campoPix.current?.select();
      document.execCommand("copy");
    }
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 4000);
  }

  return (
    <div className="quadro p-5 sm:p-8 lg:p-10">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-7">
          <h3 className="titulo t-2">Pré-reserva feita</h3>
          <p className="mt-6 text-giz">Código da reserva</p>
          <p className="titulo mt-1 text-[3.5rem] leading-none sm:text-[4.5rem]">{reserva.codigo}</p>

          <div role="status" aria-live="polite" className="mt-6">
            {expirou ? (
              <div className="aviso aviso-erro">
                <p className="font-semibold">O prazo do sinal acabou e o horário foi liberado.</p>
                <button type="button" onClick={onNova} className="link-jogada mt-2 inline-flex min-h-11 items-center">
                  Fazer uma nova reserva
                </button>
              </div>
            ) : (
              <p className="text-lg">
                O horário fica segurado por mais{" "}
                <span className="numero align-[-0.05em] text-[2.25rem] text-neon">{resta === null ? "--:--" : formatarContagem(resta)}</span>
              </p>
            )}
          </div>

          <dl className="mt-8 grid gap-3 border-t border-linha pt-6">
            <div className="flex flex-wrap justify-between gap-x-6">
              <dt className="text-giz">Data</dt>
              <dd className="font-semibold">{dataPorExtenso(reserva.data)}</dd>
            </div>
            {reserva.itens.map((i) => (
              <div key={i.recursoId} className="flex flex-wrap justify-between gap-x-6">
                <dt className="text-giz">{RECURSOS[i.recursoId].nome}</dt>
                <dd className="dado">
                  {formatarHora(i.intervalo.inicio)} às {formatarHora(i.intervalo.fim)}
                </dd>
              </div>
            ))}
            <div className="flex flex-wrap justify-between gap-x-6">
              <dt className="text-giz">Total</dt>
              <dd className="dado">{formatarMoeda(reserva.orcamento.total)}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-x-6 text-lg">
              <dt className="font-semibold">Sinal para confirmar</dt>
              <dd className="dado text-neon">{formatarMoeda(reserva.orcamento.sinal)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-10 lg:col-span-5 lg:mt-2">
          {pix ? (
            <div>
              <label htmlFor="pix-copia-cola" className="rotulo block">
                Pix copia e cola
              </label>
              <textarea
                ref={campoPix}
                id="pix-copia-cola"
                readOnly
                rows={4}
                value={pix}
                className="entrada dado mt-2 break-all text-sm"
                onFocus={(e) => e.currentTarget.select()}
              />
              <button type="button" onClick={copiar} className="btn btn-claro mt-3 w-full">
                {copiado ? "Código copiado" : "Copiar código Pix"}
              </button>
              <p className="sr-only" aria-live="polite">
                {copiado ? "Código Pix copiado." : ""}
              </p>
            </div>
          ) : (
            <div className="aviso">
              <p className="font-semibold">Pagamento do sinal</p>
              <p className="mt-1 text-giz">Envie a mensagem pelo WhatsApp para combinar o pagamento do sinal com o clube.</p>
            </div>
          )}

          <ol className="mt-8 grid gap-2 text-[0.9375rem] text-giz">
            <li>1. Pague o sinal de {formatarMoeda(reserva.orcamento.sinal)} pelo Pix.</li>
            <li>2. Envie o comprovante no WhatsApp com o código {reserva.codigo}.</li>
            <li>3. O clube confirma a reserva por lá.</li>
          </ol>

          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-neon mt-6 w-full">
            Enviar comprovante no WhatsApp
          </a>
          <button type="button" onClick={onNova} className="link-jogada mt-5 inline-flex min-h-11 items-center">
            Fazer outra reserva
          </button>
        </div>
      </div>
    </div>
  );
}
