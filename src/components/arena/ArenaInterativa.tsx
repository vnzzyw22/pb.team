"use client";

import { useState } from "react";
import { POLITICA } from "@/lib";
import { AcompanharReserva } from "./AcompanharReserva";
import { ReservaArena } from "./ReservaArena";

/** Reserva em passos e consulta pelo código, ligadas: o código novo já vai para a consulta. */
export function ArenaInterativa() {
  const [codigo, setCodigo] = useState<string | undefined>();

  return (
    <>
      <section id="reservar" aria-labelledby="titulo-reservar" className="scroll-mt-16 border-t border-linha lg:scroll-mt-20">
        <div className="recipiente secao">
          <h2 id="titulo-reservar" className="titulo t-2">
            Reserve a quadra
          </h2>
          <p className="lead medida mt-5 text-giz">
            Escolha o dia, a duração e o horário livre. A reserva fica segurada por {POLITICA.prazoSinalMin} minutos enquanto você paga
            o sinal de {POLITICA.sinalPercentual}% pelo Pix.
          </p>
          <div className="mt-12">
            <ReservaArena onReservada={setCodigo} />
          </div>
        </div>
      </section>

      <section id="acompanhar" aria-labelledby="titulo-acompanhar" className="scroll-mt-16 border-t border-linha lg:scroll-mt-20">
        <div className="recipiente py-16 lg:py-24">
          <h2 id="titulo-acompanhar" className="titulo t-2">
            Acompanhe sua reserva
          </h2>
          <div className="mt-8">
            <AcompanharReserva codigoInicial={codigo} />
          </div>
        </div>
      </section>
    </>
  );
}
