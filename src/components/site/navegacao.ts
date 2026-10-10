import { CLUBE, linkWhatsApp, mensagens } from "@/lib";

/** Seções do menu principal, na ordem do cabeçalho. */
export const ITENS_MENU = [
  { href: "/escolinha", rotulo: "Escolinha" },
  { href: "/o-projeto", rotulo: "O projeto" },
  { href: "/conquistas", rotulo: "Conquistas" },
  { href: "/arena", rotulo: "Arena" },
  { href: "/patrocinadores", rotulo: "Patrocinadores" },
] as const;

/** Páginas legais, no rodapé e no sitemap. */
export const LINKS_LEGAIS = [
  { href: "/termos", rotulo: "Termos de uso" },
  { href: "/privacidade", rotulo: "Privacidade" },
  { href: "/cookies", rotulo: "Cookies" },
] as const;

export const ANCORA_AULA = "/escolinha#aula-experimental";
export const ANCORA_RESERVA = "/arena#reservar";

export function urlInstagram(usuario: string): string {
  return `https://www.instagram.com/${usuario}/`;
}

/** Conversa com o clube sem texto pronto (contato geral). */
export function whatsappDoClube(): string {
  return linkWhatsApp("", CLUBE.contato.whatsapp);
}

/** Conversa sobre a locação da Arena. */
export function whatsappDaArena(): string {
  return linkWhatsApp(mensagens.interesseArena());
}
