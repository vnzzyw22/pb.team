import type { Bloqueio, Lead, Reserva, Serie } from "./modelos";
import type { DataISO } from "./tempo";

/**
 * Persistência. A regra de negócio só conhece esta interface; hoje existe a
 * implementação em memória (testes e protótipo) e depois entra a do banco.
 *
 * Ao implementar com banco: a checagem de conflito + gravação precisa ser
 * atômica (no Postgres, uma exclusion constraint em (recurso, tstzrange)
 * resolve dois clientes clicando no mesmo horário ao mesmo tempo).
 */
export interface Repositorio {
  reservasEntre(de: DataISO, ate: DataISO): Promise<Reserva[]>;
  reservaPorId(id: string): Promise<Reserva | undefined>;
  reservaPorCodigo(codigo: string): Promise<Reserva | undefined>;
  salvarReserva(r: Reserva): Promise<void>;
  /** Pré-reservas cujo prazo de sinal já venceu. */
  pendentesVencidas(agoraMs: number): Promise<Reserva[]>;

  bloqueiosEntre(de: DataISO, ate: DataISO): Promise<Bloqueio[]>;
  salvarBloqueio(b: Bloqueio): Promise<void>;
  removerBloqueio(id: string): Promise<void>;

  series(): Promise<Serie[]>;
  seriePorId(id: string): Promise<Serie | undefined>;
  salvarSerie(s: Serie): Promise<void>;

  leads(): Promise<Lead[]>;
  leadPorId(id: string): Promise<Lead | undefined>;
  salvarLead(l: Lead): Promise<void>;
}

/**
 * Lançado por `salvarReserva` quando o banco recusa a gravação porque o
 * horário já está ocupado (corrida entre dois servidores).
 */
export class ConflitoDeHorario extends Error {
  constructor() {
    super("Horário já ocupado");
    this.name = "ConflitoDeHorario";
  }
}

const copia = <T>(v: T): T => structuredClone(v);

export class RepositorioMemoria implements Repositorio {
  private reservas = new Map<string, Reserva>();
  private bloqueios = new Map<string, Bloqueio>();
  private _series = new Map<string, Serie>();
  private _leads = new Map<string, Lead>();

  async reservasEntre(de: DataISO, ate: DataISO) {
    return [...this.reservas.values()].filter((r) => r.data >= de && r.data <= ate).map(copia);
  }
  async reservaPorId(id: string) {
    const r = this.reservas.get(id);
    return r && copia(r);
  }
  async reservaPorCodigo(codigo: string) {
    const r = [...this.reservas.values()].find((x) => x.codigo === codigo.toUpperCase());
    return r && copia(r);
  }
  async salvarReserva(r: Reserva) {
    this.reservas.set(r.id, copia(r));
  }
  async pendentesVencidas(agoraMs: number) {
    return [...this.reservas.values()]
      .filter((r) => r.status === "aguardando_sinal" && r.expiraEm !== undefined && r.expiraEm <= agoraMs)
      .map(copia);
  }

  async bloqueiosEntre(de: DataISO, ate: DataISO) {
    return [...this.bloqueios.values()].filter((b) => b.data >= de && b.data <= ate).map(copia);
  }
  async salvarBloqueio(b: Bloqueio) {
    this.bloqueios.set(b.id, copia(b));
  }
  async removerBloqueio(id: string) {
    this.bloqueios.delete(id);
  }

  async series() {
    return [...this._series.values()].map(copia);
  }
  async seriePorId(id: string) {
    const s = this._series.get(id);
    return s && copia(s);
  }
  async salvarSerie(s: Serie) {
    this._series.set(s.id, copia(s));
  }

  async leads() {
    return [...this._leads.values()].map(copia);
  }
  async leadPorId(id: string) {
    const l = this._leads.get(id);
    return l && copia(l);
  }
  async salvarLead(l: Lead) {
    this._leads.set(l.id, copia(l));
  }
}
