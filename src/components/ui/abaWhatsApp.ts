/**
 * Abre um link de WhatsApp que só fica pronto depois de uma ação assíncrona,
 * sem cair no bloqueador de pop-up. Chame no clique, antes do `await`.
 *
 * No celular, o link abre o app na mesma aba. No computador, a aba é aberta já
 * no clique e recebe o endereço quando ele chegar.
 */
export function prepararAbaWhatsApp(): { abrir: (url: string) => void; cancelar: () => void } {
  const toque = window.matchMedia("(pointer: coarse)").matches;
  const aba = toque ? null : window.open("", "_blank");
  if (aba) aba.opener = null;
  return {
    abrir(url) {
      if (aba && !aba.closed) aba.location.href = url;
      else window.location.assign(url);
    },
    cancelar() {
      if (aba && !aba.closed) aba.close();
    },
  };
}

/** Abre um link de WhatsApp já pronto, numa aba nova. */
export function abrirWhatsApp(url: string): void {
  const aba = window.open(url, "_blank");
  if (aba) aba.opener = null;
  else window.location.assign(url);
}
