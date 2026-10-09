/**
 * Fotos e vídeos do site (arquivos em /public).
 *
 * Material reunido do Instagram do clube (@pbteamfutsal). Antes de publicar,
 * CONFIRMAR com o Pietro a autorização de uso de imagem, principalmente nas
 * fotos com atletas menores de idade (`temMenores`).
 */

export type TipoFoto = "jogo" | "equipe" | "tecnico" | "conquista" | "comunidade" | "arte";

export interface Foto {
  id: string;
  src: string;
  largura: number;
  altura: number;
  /** Texto alternativo (acessibilidade). */
  alt: string;
  legenda?: string;
  tipo: TipoFoto;
  temMenores: boolean;
  /** `object-position` sugerido para recortes (ex.: "50% 30%"). */
  foco?: string;
  /** Onde a foto funciona melhor no site. */
  usoSugerido: string[];
}

export const FOTOS: Foto[] = [
  {
    id: "atleta-uniforme-branco",
    src: "/fotos/atleta-uniforme-branco.webp",
    largura: 1350,
    altura: 1800,
    alt: "Atleta do PB Team com o uniforme branco dominando a bola na quadra",
    tipo: "jogo",
    temMenores: true,
    foco: "50% 40%",
    usoSugerido: ["home (destaque)", "escolinha"],
  },
  {
    id: "jogo-conducao-vs-viagens",
    src: "/fotos/jogo-conducao-vs-viagens.webp",
    largura: 1440,
    altura: 960,
    alt: "Atleta do PB Team de uniforme preto e rosa conduzindo a bola durante um jogo",
    tipo: "jogo",
    temMenores: true,
    foco: "50% 45%",
    usoSugerido: ["home", "escolinha", "patrocinadores (camisa com VS Viagens)"],
  },
  {
    id: "equipe-e-familias",
    src: "/fotos/equipe-e-familias.webp",
    largura: 1440,
    altura: 754,
    alt: "Atletas, comissão técnica e famílias do PB Team reunidos na quadra depois de um jogo",
    legenda: "Atletas, comissão e famílias: a base do projeto.",
    tipo: "comunidade",
    temMenores: true,
    foco: "50% 60%",
    usoSugerido: ["o projeto", "escolinha"],
  },
  {
    id: "premiacao-equipe-rosa",
    src: "/fotos/premiacao-equipe-rosa.webp",
    largura: 1440,
    altura: 959,
    alt: "Equipe do PB Team com uniforme rosa recebendo medalhas no palco de premiação",
    // CONFIRMAR: qual competição e categoria.
    legenda: "Equipe premiada no palco.",
    tipo: "conquista",
    temMenores: true,
    foco: "50% 45%",
    usoSugerido: ["conquistas"],
  },
  {
    id: "pietro-bettin-trofeu-paranaense-2022",
    src: "/fotos/pietro-bettin-trofeu-paranaense-2022.webp",
    largura: 1200,
    altura: 1500,
    alt: "O técnico Pietro Bettin com a medalha de ouro e a taça do Campeonato Paranaense de Base FPFS 2022",
    legenda: "Pietro Bettin com a taça do Campeonato Paranaense de Base FPFS 2022.",
    tipo: "tecnico",
    temMenores: false,
    foco: "50% 30%",
    usoSugerido: ["o projeto (destaque)", "conquistas"],
  },
  {
    id: "pietro-bettin-banco",
    src: "/fotos/pietro-bettin-banco.webp",
    largura: 1440,
    altura: 1440,
    alt: "O técnico Pietro Bettin concentrado no banco de reservas durante um jogo",
    tipo: "tecnico",
    temMenores: false,
    foco: "40% 50%",
    usoSugerido: ["o projeto"],
  },
  {
    id: "paranaense-2024-sub10-8-lugar",
    src: "/fotos/paranaense-2024-sub10-8-lugar.webp",
    largura: 1440,
    altura: 1440,
    alt: "Arte do PB Team Sub-10: 8º lugar no Campeonato Paranaense de Base FPFS 2024",
    tipo: "arte",
    temMenores: true,
    usoSugerido: ["conquistas (linha do tempo)"],
  },
];

export interface Video {
  id: string;
  src: string;
  poster: string;
  largura: number;
  altura: number;
  /** segundos */
  duracao: number;
  descricao: string;
  temMenores: boolean;
}

export const VIDEOS: Video[] = [
  {
    id: "hero-jogo",
    src: "/videos/hero-jogo.mp4",
    poster: "/videos/hero-jogo-poster.webp",
    largura: 720,
    altura: 1280,
    duracao: 17,
    // Vertical, sem áudio: ideal como fundo em loop da primeira tela no celular.
    descricao: "Atleta do PB Team conduzindo a bola em jogo oficial",
    temMenores: true,
  },
];

export function fotoPorId(id: string): Foto | undefined {
  return FOTOS.find((f) => f.id === id);
}

export function fotosPorTipo(...tipos: TipoFoto[]): Foto[] {
  return FOTOS.filter((f) => tipos.includes(f.tipo));
}
