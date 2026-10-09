/**
 * Informações institucionais do PB Team.
 *
 * Fontes: bio, destaques e posts do Instagram @pbteamfutsal e entrevista do
 * Pietro Bettin. Campos marcados com `CONFIRMAR` ainda precisam ser
 * validados com o clube antes de ir ao ar.
 */

/** Resumo de conquistas exibido em destaque (como na bio do Instagram). */
export interface Conquista {
  titulo: string;
  /** Quantidade de vezes, quando aplicável (ex.: 4x Estadual). */
  vezes?: number;
  detalhe?: string;
}

/** Campos de um resultado que ainda dependem de confirmação do clube. */
export type CampoAConfirmar = "ano" | "categoria" | "colocacao";

/** Um resultado específico, para a linha do tempo de conquistas. */
export interface Resultado {
  ano?: number;
  competicao: string;
  categoria?: string;
  /** "Campeão", "8º lugar", "Fase final"… */
  colocacao: string;
  /** Títulos e pódios ganham destaque visual. */
  titulo: boolean;
  /** id em FOTOS (dados/galeria.ts) */
  fotoId?: string;
  /**
   * Campos que faltam ou estão incertos. No site, use `historicoPublico()`:
   * campos pendentes são omitidos e, se a colocação for pendente, o resultado
   * inteiro fica de fora.
   */
  confirmar?: CampoAConfirmar[];
}

export interface Torneio {
  nome: string;
  /** false = nome incompleto ou incerto; não exibir. */
  confirmado: boolean;
}

export interface Patrocinador {
  nome: string;
  /** caminho em /public ou URL */
  logo?: string;
  site?: string;
  /** Onde a marca aparece: camisa, banner na arena… */
  onde?: string;
  /** false = visto em material do clube, mas falta confirmar o vínculo */
  confirmado: boolean;
}

const WHATSAPP_PIETRO = "5544999448422";

export const CLUBE = {
  nome: "PB Team",
  nomeCompleto: "PB Team Futsal",
  fundacao: 2019,
  cidade: "Maringá",
  estado: "PR",

  tecnico: {
    nome: "Pietro Bettin",
    papel: "Fundador, proprietário e técnico",
    /** O nome do time vem das iniciais dele. */
    sobre:
      "Professor que dá nome à escolinha, Pietro Bettin é formado em Educação Física pela UEM, " +
      "pós-graduado em futsal e treinamento desportivo e tem as licenças C e B da CBFS. " +
      "Comanda o PB Team desde a fundação, em 2019, e conduziu as equipes a títulos estaduais " +
      "e a fases finais do Sul-Brasileiro.",
    /** Bio do Instagram @pietro_bettin. */
    formacao: [
      "Graduado em Educação Física pela UEM",
      "Pós-graduado em Futsal e Treinamento Desportivo",
      "Licenças C e B da CBFS",
    ],
    fotos: ["pietro-bettin-trofeu-paranaense-2022", "pietro-bettin-banco"],
    whatsapp: WHATSAPP_PIETRO,
    instagram: "pietro_bettin",
  },

  /** Objetivo declarado pelo técnico em entrevista. */
  missao:
    "Se consolidar em Maringá e região e implantar uma filosofia de base na cidade, " +
    "para que daqui a cinco, dez anos a equipe adulta tenha até sete atletas formados " +
    "nas próprias categorias de base.",

  /** Citação para a página "O projeto". */
  citacao: {
    texto:
      "O principal objetivo da PB Team é se consolidar em Maringá e região e começar a implantar " +
      "uma filosofia de base na cidade para que daqui a cinco, dez anos a gente possa ter uma " +
      "equipe adulta com até sete atletas da nossa própria categoria de base.",
    autor: "Pietro Bettin",
  },

  historia:
    "A escolinha de futsal PB Team surgiu em 2019, mas antes disso vários alunos que " +
    "hoje treinam e atuam no projeto já disputavam competições em duas categorias. " +
    "Em constante crescimento, novas categorias foram sendo abertas para atender " +
    "crianças e jovens que queriam praticar o esporte. A ideia de levar a base até o " +
    "time adulto incentiva os jovens jogadores a não precisarem parar de jogar.",

  matriculas: {
    abertas: true,
    // Texto do post fixado no Instagram.
    chamada:
      "O PB Team está crescendo e estamos iniciando um novo capítulo. " +
      "Vem fazer parte dessa história você também.",
  },

  arena: {
    nome: "Arena PB Team",
    descricao: "Quadra coberta com piso esportivo",
    // CONFIRMAR: endereço completo e link do Google Maps.
    endereco: "",
    mapsUrl: "",
  },

  contato: {
    // Número da bio e dos posts do Instagram (Pietro Bettin).
    whatsapp: WHATSAPP_PIETRO,
    instagram: "pbteamfutsal",
  },

  /** Bio do Instagram. */
  conquistas: [
    { titulo: "Campeonato Estadual", vezes: 4 },
    { titulo: "Super Copa América BC" },
    { titulo: "Sul-Brasileiro de Futsal", vezes: 6, detalhe: "fase final" },
    { titulo: "Taça Brasil de Clubes", detalhe: "3º lugar" },
    { titulo: "Copa Paraná", vezes: 3 },
  ] satisfies Conquista[],

  /** Resultados identificados nas fotos e destaques do Instagram (mais recentes primeiro). */
  historico: [
    {
      ano: 2025,
      competicao: "Campeonato Paranaense de Futsal",
      categoria: "Sub-9",
      colocacao: "Fase final: entre as 8 melhores equipes do Paraná",
      titulo: false,
      // o ano vem do destaque "Paranaense Futsal 2025"; a arte não traz o ano
      confirmar: ["ano"],
    },
    {
      ano: 2024,
      competicao: "Campeonato Paranaense de Base FPFS",
      categoria: "Sub-10 masculino",
      colocacao: "8º lugar",
      titulo: false,
      fotoId: "paranaense-2024-sub10-8-lugar",
    },
    {
      ano: 2022,
      competicao: "Campeonato Paranaense de Base FPFS",
      colocacao: "Campeão",
      titulo: true,
      fotoId: "pietro-bettin-trofeu-paranaense-2022",
      confirmar: ["categoria"],
    },
    {
      competicao: "Copa Ingá de Futsal",
      categoria: "Sub-9 Federados",
      colocacao: "Campeão",
      titulo: true,
      confirmar: ["ano"],
    },
    {
      competicao: "Copa MBB (Francisco Beltrão)",
      colocacao: "Campeão",
      titulo: true,
      confirmar: ["ano", "categoria"],
    },
    {
      competicao: "Taça Brasil de Clubes",
      colocacao: "3º lugar",
      titulo: true,
      confirmar: ["ano", "categoria"],
    },
    {
      // A bio do Instagram lista a "SUPER COPA América BC" entre os títulos (🏆),
      // então o histórico segue o próprio clube: campeão.
      competicao: "Super Copa América (Balneário Camboriú)",
      colocacao: "Campeão",
      titulo: true,
      confirmar: ["ano", "categoria"],
    },
  ] satisfies Resultado[],

  /** Torneios que aparecem nos destaques do Instagram, sem resultado identificado. */
  torneiosDisputados: [
    { nome: "Sul-Brasileiro de Futsal", confirmado: true },
    { nome: "Londrina Cup", confirmado: true },
    { nome: "Copa Colégio Paraná", confirmado: true },
    // destaque "Copa mundo…" cortado no Instagram: falta o nome completo
    { nome: "Copa do Mundo", confirmado: false },
  ] satisfies Torneio[],

  patrocinadores: [
    { nome: "VS Viagens", onde: "Camisa de jogo e banner na Arena", confirmado: true },
    { nome: "GRP Construtora", onde: "Camisa de jogo", confirmado: true },
    { nome: "Lavup", onde: "Camisa de jogo", confirmado: true },
    { nome: "Conceito Esporte", onde: "Uniforme da comissão técnica", confirmado: true },
    // Aparecem na arte da Copa Ingá: CONFIRMAR se patrocinam o PB Team ou o torneio.
    { nome: "Thermotech", confirmado: false },
    { nome: "LV Esportes", confirmado: false },
    { nome: "Guaiapó Brindes Personalizados", confirmado: false },
  ] satisfies Patrocinador[],

  /** Post fixado "Sua marca dentro da Arena PB Team". */
  anuncie: {
    titulo: "Sua marca dentro da Arena PB Team",
    chamada: "Coloque sua empresa em um espaço de esporte, famílias e grande visibilidade.",
    formatos: [
      "Placas publicitárias",
      "Banners na arena",
      "Pintura com a sua marca",
      "Espaços exclusivos",
      "Associe sua marca ao esporte",
    ],
    contato: { nome: "Pietro Bettin", whatsapp: WHATSAPP_PIETRO },
  },
} as const;
