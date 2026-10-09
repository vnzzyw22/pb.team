/**
 * Informações institucionais do PB Team.
 *
 * Campos marcados com `CONFIRMAR` ainda são suposições ou placeholders e
 * devem ser validados com o clube antes de ir ao ar.
 */

export interface Conquista {
  titulo: string;
  /** Quantidade de vezes, quando aplicável (ex.: 4x Estadual). */
  vezes?: number;
  detalhe?: string;
}

export interface Patrocinador {
  nome: string;
  /** caminho em /public ou URL */
  logo?: string;
  site?: string;
}

export const CLUBE = {
  nome: "PB Team",
  nomeCompleto: "PB Team Futsal",
  fundacao: 2019,
  cidade: "Maringá",
  estado: "PR",
  fundador: {
    nome: "Pietro Bettin",
    papel: "Professor e técnico",
  },

  /** Objetivo declarado pelo técnico em entrevista. */
  missao:
    "Se consolidar em Maringá e região e implantar uma filosofia de base na cidade, " +
    "para que daqui a cinco, dez anos a equipe adulta tenha até sete atletas formados " +
    "nas próprias categorias de base.",

  historia:
    "A escolinha de futsal PB Team surgiu em 2019, mas antes disso vários alunos que " +
    "hoje treinam e atuam no projeto já disputavam competições em duas categorias. " +
    "Em constante crescimento, novas categorias foram sendo abertas para atender " +
    "crianças e jovens que queriam praticar o esporte.",

  arena: {
    nome: "Arena PB Team",
    descricao: "Quadra coberta com piso esportivo",
    // CONFIRMAR: endereço completo e link do Google Maps.
    endereco: "",
    mapsUrl: "",
  },

  contato: {
    // Número do link de WhatsApp da bio do Instagram. CONFIRMAR se é o mesmo
    // para matrículas e para locação.
    whatsapp: "5544999448422",
    instagram: "pbteamfutsal",
  },

  conquistas: [
    { titulo: "Campeonato Estadual", vezes: 4 },
    { titulo: "Super Copa América BC" },
    { titulo: "Sul-Brasileiro de Futsal", vezes: 6, detalhe: "fase final" },
    { titulo: "Taça Brasil de Clubes", detalhe: "3º lugar" },
    { titulo: "Copa Paraná", vezes: 3 },
  ] satisfies Conquista[],

  // CONFIRMAR lista e logos com o clube.
  patrocinadores: [
    { nome: "Lavup" },
    { nome: "Thermotech" },
    { nome: "Guaiapó Brindes Personalizados" },
    { nome: "LV Esportes" },
    { nome: "VS Viagens" },
  ] satisfies Patrocinador[],
} as const;
