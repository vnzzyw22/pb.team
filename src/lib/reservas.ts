import { gradeDoDia, horariosDisponiveis, validarHorario, type ContextoDia, type ErroHorario, type Ocupacao } from "./agenda";
import { PIX, POLITICA, RECURSOS, type RecursoId } from "./dados/arena";
import { ocupaHorario, type Bloqueio, type Cliente, type Reserva, type Serie } from "./modelos";
import { gerarPixCopiaECola } from "./pix";
import { calcularSinal, orcar, type ItemReserva, type Orcamento } from "./precos";
import { ConflitoDeHorario, type Repositorio } from "./repositorio";
import {
  agoraEmMaringa,
  diaDaSemana,
  hora,
  minutosAte,
  somarDias,
  validarData,
  type Agora,
  type DataISO,
  type DiaSemana,
} from "./tempo";
import { linkWhatsApp, mensagens, normalizarTelefone } from "./whatsapp";

export type ErroSolicitacao =
  | ErroHorario
  | "data_invalida"
  | "horario_invalido"
  | "nome_invalido"
  | "telefone_invalido"
  | "combo_indisponivel";

export interface EntradaReserva {
  data: DataISO;
  recursoId: RecursoId;
  /** "HH:MM" */
  inicio: string;
  /** minutos */
  duracao: number;
  /** Quadra + churrasqueira no mesmo horário de início. */
  comChurrasqueira?: boolean;
  cliente: { nome: string; telefone: string };
  observacoes?: string;
}

export type ResultadoSolicitacao =
  | {
      ok: true;
      reserva: Reserva;
      /** Pix copia e cola do sinal (ausente enquanto a chave não estiver configurada). */
      pixCopiaECola?: string;
      /** Link que abre o WhatsApp do clube com o resumo da pré-reserva. */
      whatsapp: string;
    }
  | { ok: false; erros: ErroSolicitacao[]; conflitos: Ocupacao[] };

export interface EntradaSerie {
  cliente: { nome: string; telefone: string };
  recursoId: RecursoId;
  diaSemana: DiaSemana;
  inicio: string;
  duracao: number;
  dataInicio: DataISO;
  dataFim?: DataISO;
  /** centavos; sobrescreve a tabela (preço de mensalista) */
  valorPorOcorrencia?: number;
}

export interface ResumoPeriodo {
  reservas: number;
  horasVendidas: number;
  faturamentoPrevisto: number;
  recebido: number;
  aReceber: number;
  naoCompareceu: number;
  canceladas: number;
}

const ALFABETO_CODIGO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export class ErroReserva extends Error {
  constructor(
    public codigo:
      | "nao_encontrada"
      | "status_invalido"
      | "horario_ocupado"
      | "valor_invalido"
      | "serie_nao_encontrada"
      | "entrada_invalida",
    mensagem: string,
  ) {
    super(mensagem);
  }
}

export class ServicoReservas {
  /** Serializa operações de escrita no mesmo processo (checa conflito → grava). */
  private fila: Promise<unknown> = Promise.resolve();

  constructor(
    private repo: Repositorio,
    private relogio: () => Date = () => new Date(),
    private gerarId: () => string = () => crypto.randomUUID(),
  ) {}

  private agora(): Agora {
    return agoraEmMaringa(this.relogio());
  }

  private exclusivo<T>(fn: () => Promise<T>): Promise<T> {
    const proxima = this.fila.then(fn, fn);
    this.fila = proxima.catch(() => undefined);
    return proxima;
  }

  private async contexto(data: DataISO, agora = this.agora()): Promise<ContextoDia> {
    const [reservas, bloqueios] = await Promise.all([
      this.repo.reservasEntre(data, data),
      this.repo.bloqueiosEntre(data, data),
    ]);
    return { data, reservas, bloqueios, agora };
  }

  private async novoCodigo(): Promise<string> {
    for (;;) {
      let s = "PB-";
      for (let i = 0; i < 4; i++) s += ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)];
      if (!(await this.repo.reservaPorCodigo(s))) return s;
    }
  }

  /** Marca como expiradas as pré-reservas vencidas (sem passar pela fila). */
  private async expirarVencidas(agora: Agora): Promise<number> {
    const vencidas = await this.repo.pendentesVencidas(agora.instante);
    for (const r of vencidas) {
      r.status = "expirada";
      r.atualizadaEm = agora.instante;
      await this.repo.salvarReserva(r);
    }
    return vencidas.length;
  }

  /** Grava; devolve false se o banco recusou por choque de horário. */
  private async gravar(r: Reserva): Promise<boolean> {
    try {
      await this.repo.salvarReserva(r);
      return true;
    } catch (e) {
      if (e instanceof ConflitoDeHorario) return false;
      throw e;
    }
  }

  private async buscar(id: string): Promise<Reserva> {
    const r = await this.repo.reservaPorId(id);
    if (!r) throw new ErroReserva("nao_encontrada", "Reserva não encontrada");
    return r;
  }

  // ---------------------------------------------------------------- consulta

  async disponibilidade(recursoId: RecursoId, data: DataISO, duracao: number) {
    if (!validarData(data)) return [];
    return horariosDisponiveis(recursoId, duracao, await this.contexto(data));
  }

  async grade(recursoId: RecursoId, data: DataISO) {
    return gradeDoDia(recursoId, await this.contexto(data));
  }

  // ------------------------------------------------------------- solicitação

  private montarItens(e: Pick<EntradaReserva, "recursoId" | "inicio" | "duracao" | "comChurrasqueira">): ItemReserva[] {
    const inicio = hora(e.inicio);
    const itens: ItemReserva[] = [{ recursoId: e.recursoId, intervalo: { inicio, fim: inicio + e.duracao } }];
    if (e.comChurrasqueira && e.recursoId === "quadra") {
      const duracaoChurrasqueira = RECURSOS.churrasqueira.duracoes[0];
      itens.push({ recursoId: "churrasqueira", intervalo: { inicio, fim: inicio + duracaoChurrasqueira } });
    }
    return itens;
  }

  private validarEntrada(e: EntradaReserva): { erros: ErroSolicitacao[]; cliente?: Cliente; itens?: ItemReserva[] } {
    const erros: ErroSolicitacao[] = [];
    if (!validarData(e.data)) erros.push("data_invalida");
    let itens: ItemReserva[] | undefined;
    try {
      itens = this.montarItens(e);
    } catch {
      erros.push("horario_invalido");
    }
    const nome = e.cliente.nome.trim().replace(/\s+/g, " ");
    if (nome.length < 3) erros.push("nome_invalido");
    const telefone = normalizarTelefone(e.cliente.telefone);
    if (!telefone) erros.push("telefone_invalido");
    return { erros, itens, cliente: telefone ? { nome, telefone } : undefined };
  }

  /** Cliente pede uma reserva pelo site: o horário fica segurado até o sinal. */
  solicitar(e: EntradaReserva): Promise<ResultadoSolicitacao> {
    return this.exclusivo(async () => {
      const { erros, itens, cliente } = this.validarEntrada(e);
      if (erros.length || !itens || !cliente) return { ok: false, erros, conflitos: [] };

      const agora = this.agora();
      await this.expirarVencidas(agora);
      const ctx = await this.contexto(e.data, agora);
      const conflitos: Ocupacao[] = [];
      for (const item of itens) {
        const v = validarHorario(item.recursoId, item.intervalo, ctx);
        for (const erro of v.erros) {
          const traduzido: ErroSolicitacao = item.recursoId === "churrasqueira" && e.comChurrasqueira ? "combo_indisponivel" : erro;
          if (!erros.includes(traduzido)) erros.push(traduzido);
        }
        conflitos.push(...v.conflitos);
      }
      if (erros.length) return { ok: false, erros, conflitos };

      const reserva: Reserva = {
        id: this.gerarId(),
        codigo: await this.novoCodigo(),
        data: e.data,
        itens,
        cliente,
        status: "aguardando_sinal",
        origem: "site",
        orcamento: orcar(e.data, itens),
        valorPago: 0,
        observacoes: e.observacoes?.trim() || undefined,
        criadaEm: agora.instante,
        atualizadaEm: agora.instante,
        expiraEm: agora.instante + POLITICA.prazoSinalMin * 60_000,
      };
      if (!(await this.gravar(reserva))) return { ok: false, erros: ["conflito"], conflitos: [] };

      return {
        ok: true,
        reserva,
        pixCopiaECola: PIX.chave
          ? gerarPixCopiaECola({ ...PIX, valor: reserva.orcamento.sinal, txid: reserva.codigo })
          : undefined,
        whatsapp: linkWhatsApp(mensagens.pedidoDeReserva(reserva)),
      };
    });
  }

  /** Reserva lançada pelo dono no painel (telefone/balcão): já entra confirmada. */
  criarPeloPainel(e: EntradaReserva & { valorPago?: number }): Promise<ResultadoSolicitacao> {
    return this.exclusivo(async () => {
      const { erros, itens, cliente } = this.validarEntrada(e);
      if (erros.length || !itens || !cliente) return { ok: false, erros, conflitos: [] };

      const agora = this.agora();
      await this.expirarVencidas(agora);
      const ctx = await this.contexto(e.data, agora);
      const validacoes = itens.map((i) => validarHorario(i.recursoId, i.intervalo, ctx, { peloPainel: true }));
      const errosHorario = [...new Set(validacoes.flatMap((v) => v.erros))];
      if (errosHorario.length) {
        return { ok: false, erros: errosHorario, conflitos: validacoes.flatMap((v) => v.conflitos) };
      }

      const reserva: Reserva = {
        id: this.gerarId(),
        codigo: await this.novoCodigo(),
        data: e.data,
        itens,
        cliente,
        status: "confirmada",
        origem: "admin",
        orcamento: orcar(e.data, itens),
        valorPago: e.valorPago ?? 0,
        observacoes: e.observacoes?.trim() || undefined,
        criadaEm: agora.instante,
        atualizadaEm: agora.instante,
      };
      if (!(await this.gravar(reserva))) return { ok: false, erros: ["conflito"], conflitos: [] };
      return { ok: true, reserva, whatsapp: linkWhatsApp(mensagens.confirmacao(reserva), reserva.cliente.telefone) };
    });
  }

  // ------------------------------------------------------------ ciclo de vida

  /** Dono confirmou o Pix do sinal. Retorna o link de confirmação para o cliente. */
  confirmarSinal(id: string, valor?: number): Promise<{ reserva: Reserva; whatsapp: string }> {
    return this.exclusivo(async () => {
      const r = await this.buscar(id);
      if (r.status !== "aguardando_sinal" && r.status !== "expirada") {
        throw new ErroReserva("status_invalido", `Reserva está "${r.status}"`);
      }
      const agora = this.agora();
      // se o prazo venceu, só confirma se ninguém pegou o horário nesse meio-tempo
      const ctx = await this.contexto(r.data, agora);
      const ocupado = r.itens.some(
        (i) => validarHorario(i.recursoId, i.intervalo, ctx, { peloPainel: true, ignorarReservaId: r.id }).erros.includes("conflito"),
      );
      if (ocupado) throw new ErroReserva("horario_ocupado", "O horário foi ocupado depois que a pré-reserva expirou");

      const pago = valor ?? r.orcamento.sinal;
      if (pago <= 0) throw new ErroReserva("valor_invalido", "Valor do sinal inválido");
      r.valorPago += pago;
      r.status = "confirmada";
      r.expiraEm = undefined;
      r.atualizadaEm = agora.instante;
      if (!(await this.gravar(r))) {
        throw new ErroReserva("horario_ocupado", "O horário foi ocupado depois que a pré-reserva expirou");
      }
      return { reserva: r, whatsapp: linkWhatsApp(mensagens.confirmacao(r), r.cliente.telefone) };
    });
  }

  registrarPagamento(id: string, valor: number): Promise<Reserva> {
    return this.exclusivo(async () => {
      const r = await this.buscar(id);
      if (!["confirmada", "concluida"].includes(r.status)) {
        throw new ErroReserva("status_invalido", `Reserva está "${r.status}"`);
      }
      if (!Number.isInteger(valor) || valor <= 0) throw new ErroReserva("valor_invalido", "Valor inválido");
      r.valorPago += valor;
      r.atualizadaEm = this.agora().instante;
      await this.repo.salvarReserva(r);
      return r;
    });
  }

  /** Cancela e informa se o sinal deve ser devolvido pela política. */
  cancelar(id: string, motivo = ""): Promise<{ reserva: Reserva; devolverSinal: boolean }> {
    return this.exclusivo(async () => {
      const r = await this.buscar(id);
      if (!["aguardando_sinal", "confirmada"].includes(r.status)) {
        throw new ErroReserva("status_invalido", `Reserva está "${r.status}"`);
      }
      const agora = this.agora();
      const inicio = Math.min(...r.itens.map((i) => i.intervalo.inicio));
      const antecedenciaMin = minutosAte(agora, r.data, inicio);
      const devolverSinal = r.valorPago > 0 && antecedenciaMin >= POLITICA.cancelamentoGratuitoHoras * 60;
      r.status = "cancelada";
      r.motivoCancelamento = motivo.trim() || undefined;
      r.expiraEm = undefined;
      r.atualizadaEm = agora.instante;
      await this.repo.salvarReserva(r);
      return { reserva: r, devolverSinal };
    });
  }

  marcarComparecimento(id: string, compareceu: boolean): Promise<Reserva> {
    return this.exclusivo(async () => {
      const r = await this.buscar(id);
      if (r.status !== "confirmada") throw new ErroReserva("status_invalido", `Reserva está "${r.status}"`);
      r.status = compareceu ? "concluida" : "nao_compareceu";
      r.atualizadaEm = this.agora().instante;
      await this.repo.salvarReserva(r);
      return r;
    });
  }

  /** Libera pré-reservas sem sinal. Rodar periodicamente (cron) ou antes de listar. */
  expirarPendentes(): Promise<number> {
    return this.exclusivo(() => this.expirarVencidas(this.agora()));
  }

  // ---------------------------------------------------------------- bloqueios

  /** Bloqueia um horário (manutenção, evento interno). Avisa sobre reservas afetadas. */
  async criarBloqueio(b: {
    recursoId: RecursoId | "todos";
    data: DataISO;
    inicio: string;
    fim: string;
    motivo: string;
  }): Promise<{ bloqueio: Bloqueio; reservasAfetadas: Reserva[] }> {
    return this.exclusivo(async () => {
      if (!validarData(b.data)) throw new ErroReserva("entrada_invalida", "Data inválida");
      const intervalo = { inicio: hora(b.inicio), fim: hora(b.fim) };
      if (intervalo.fim <= intervalo.inicio) throw new ErroReserva("entrada_invalida", "Intervalo inválido");
      const bloqueio: Bloqueio = { id: this.gerarId(), recursoId: b.recursoId, data: b.data, intervalo, motivo: b.motivo.trim() };
      await this.repo.salvarBloqueio(bloqueio);

      const agoraMs = this.agora().instante;
      const reservasAfetadas = (await this.repo.reservasEntre(b.data, b.data)).filter(
        (r) =>
          ocupaHorario(r, agoraMs) &&
          r.itens.some(
            (i) =>
              (b.recursoId === "todos" || i.recursoId === b.recursoId) &&
              i.intervalo.inicio < intervalo.fim &&
              intervalo.inicio < i.intervalo.fim,
          ),
      );
      return { bloqueio, reservasAfetadas };
    });
  }

  removerBloqueio(id: string): Promise<void> {
    return this.exclusivo(() => this.repo.removerBloqueio(id));
  }

  // --------------------------------------------------------------- mensalistas

  /** Cria uma turma fixa semanal e já lança as próximas ocorrências. */
  criarSerie(e: EntradaSerie, semanasAFrente = 8): Promise<{ serie: Serie; criadas: Reserva[]; conflitos: DataISO[] }> {
    return this.exclusivo(async () => {
      const telefone = normalizarTelefone(e.cliente.telefone);
      const nome = e.cliente.nome.trim();
      if (!telefone || nome.length < 3) throw new ErroReserva("entrada_invalida", "Nome ou telefone inválido");
      if (!validarData(e.dataInicio) || (e.dataFim && !validarData(e.dataFim))) {
        throw new ErroReserva("entrada_invalida", "Data inválida");
      }
      const inicio = hora(e.inicio);
      const serie: Serie = {
        id: this.gerarId(),
        cliente: { nome, telefone },
        recursoId: e.recursoId,
        diaSemana: e.diaSemana,
        intervalo: { inicio, fim: inicio + e.duracao },
        dataInicio: e.dataInicio,
        dataFim: e.dataFim,
        valorPorOcorrencia: e.valorPorOcorrencia,
        ativa: true,
        criadaEm: this.agora().instante,
      };
      await this.repo.salvarSerie(serie);
      const { criadas, conflitos } = await this.lancarOcorrencias(serie, somarDias(this.agora().data, semanasAFrente * 7));
      return { serie, criadas, conflitos };
    });
  }

  /**
   * Garante que todas as séries ativas tenham ocorrências lançadas até `ate`.
   * Rodar semanalmente (cron) para a agenda dos mensalistas nunca "acabar".
   */
  estenderSeries(ate: DataISO): Promise<{ criadas: number; conflitos: { serieId: string; data: DataISO }[] }> {
    return this.exclusivo(async () => {
      let criadas = 0;
      const conflitos: { serieId: string; data: DataISO }[] = [];
      for (const s of await this.repo.series()) {
        if (!s.ativa) continue;
        const r = await this.lancarOcorrencias(s, ate);
        criadas += r.criadas.length;
        conflitos.push(...r.conflitos.map((data) => ({ serieId: s.id, data })));
      }
      return { criadas, conflitos };
    });
  }

  /** Encerra a série e cancela as ocorrências a partir da data. */
  encerrarSerie(serieId: string, aPartirDe: DataISO): Promise<number> {
    return this.exclusivo(async () => {
      const s = await this.repo.seriePorId(serieId);
      if (!s) throw new ErroReserva("serie_nao_encontrada", "Série não encontrada");
      s.ativa = false;
      s.dataFim = somarDias(aPartirDe, -1);
      await this.repo.salvarSerie(s);
      const agoraMs = this.agora().instante;
      const futuras = (await this.repo.reservasEntre(aPartirDe, "9999-12-31")).filter(
        (r) => r.serieId === serieId && r.status === "confirmada",
      );
      for (const r of futuras) {
        r.status = "cancelada";
        r.motivoCancelamento = "Série encerrada";
        r.atualizadaEm = agoraMs;
        await this.repo.salvarReserva(r);
      }
      return futuras.length;
    });
  }

  /** Lança ocorrências faltantes (sem passar pela fila — chamado dentro dela). */
  private async lancarOcorrencias(s: Serie, ate: DataISO): Promise<{ criadas: Reserva[]; conflitos: DataISO[] }> {
    const agora = this.agora();
    await this.expirarVencidas(agora);
    const limite = s.dataFim && s.dataFim < ate ? s.dataFim : ate;
    let data = s.dataInicio < agora.data ? agora.data : s.dataInicio;
    while (diaDaSemana(data) !== s.diaSemana) data = somarDias(data, 1);

    const existentes = new Set(
      (await this.repo.reservasEntre(s.dataInicio, limite)).filter((r) => r.serieId === s.id).map((r) => r.data),
    );
    const criadas: Reserva[] = [];
    const conflitos: DataISO[] = [];

    for (; data <= limite; data = somarDias(data, 7)) {
      if (existentes.has(data)) continue;
      const ctx = await this.contexto(data, agora);
      const v = validarHorario(s.recursoId, s.intervalo, ctx, { peloPainel: true });
      if (!v.ok) {
        conflitos.push(data);
        continue;
      }
      const itens: ItemReserva[] = [{ recursoId: s.recursoId, intervalo: s.intervalo }];
      const orcamento: Orcamento =
        s.valorPorOcorrencia !== undefined
          ? {
              itens: [{ rotulo: "Mensalista", minutos: s.intervalo.fim - s.intervalo.inicio, valor: s.valorPorOcorrencia }],
              subtotal: s.valorPorOcorrencia,
              desconto: 0,
              total: s.valorPorOcorrencia,
              sinal: calcularSinal(s.valorPorOcorrencia),
            }
          : orcar(data, itens);
      const r: Reserva = {
        id: this.gerarId(),
        codigo: await this.novoCodigo(),
        data,
        itens,
        cliente: s.cliente,
        status: "confirmada",
        origem: "mensalista",
        orcamento,
        valorPago: 0,
        serieId: s.id,
        criadaEm: agora.instante,
        atualizadaEm: agora.instante,
      };
      if (await this.gravar(r)) criadas.push(r);
      else conflitos.push(data);
    }
    return { criadas, conflitos };
  }

  // ----------------------------------------------------------------- relatório

  async resumo(de: DataISO, ate: DataISO): Promise<ResumoPeriodo> {
    const reservas = await this.repo.reservasEntre(de, ate);
    const validas = reservas.filter((r) => ["confirmada", "concluida", "nao_compareceu"].includes(r.status));
    const minutosQuadra = validas
      .flatMap((r) => r.itens)
      .filter((i) => i.recursoId === "quadra")
      .reduce((s, i) => s + (i.intervalo.fim - i.intervalo.inicio), 0);
    const faturamentoPrevisto = validas.reduce((s, r) => s + r.orcamento.total, 0);
    const recebido = reservas.reduce((s, r) => s + r.valorPago, 0);
    return {
      reservas: validas.length,
      horasVendidas: minutosQuadra / 60,
      faturamentoPrevisto,
      recebido,
      aReceber: validas.reduce((s, r) => s + Math.max(0, r.orcamento.total - r.valorPago), 0),
      naoCompareceu: validas.filter((r) => r.status === "nao_compareceu").length,
      canceladas: reservas.filter((r) => r.status === "cancelada").length,
    };
  }
}
