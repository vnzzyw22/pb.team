"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconeWhatsApp } from "@/components/grafismos";
import { whatsappDaArena, whatsappDoClube } from "./navegacao";

/**
 * Atalho flutuante para o WhatsApp do clube. Aparece só depois da primeira
 * dobra, para não cobrir os botões da primeira tela no celular.
 */
export function BotaoWhatsApp() {
  const pathname = usePathname();
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > window.innerHeight * 0.6);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  const naArena = pathname.startsWith("/arena");

  return (
    <a
      href={naArena ? whatsappDaArena() : whatsappDoClube()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={naArena ? "Tirar dúvidas sobre a locação no WhatsApp" : "Conversar com o clube no WhatsApp"}
      tabIndex={visivel ? 0 : -1}
      aria-hidden={!visivel}
      className={`fixed right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-neon text-preto shadow-[0_8px_24px_rgb(0_0_0/0.55)] transition-[opacity,transform] duration-300 lg:right-8 ${
        visivel ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <IconeWhatsApp className="h-7 w-7" />
    </a>
  );
}
