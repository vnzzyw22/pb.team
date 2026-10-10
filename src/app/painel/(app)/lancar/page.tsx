import type { Metadata } from "next";
import { agoraEmMaringa } from "@/lib";
import { protegerPagina } from "@/server/painel/acesso";
import { FormLancar } from "@/components/painel/FormLancar";

export const metadata: Metadata = { title: "Lançar reserva" };

export default async function PaginaLancar() {
  await protegerPagina();
  return (
    <div>
      <h1 className="titulo t-2">Lançar reserva</h1>
      <p className="mt-3 max-w-[56ch] text-giz">Para reservas feitas por telefone ou no balcão. Treinos, bloqueios e outras reservas continuam valendo.</p>
      <div className="mt-8">
        <FormLancar hoje={agoraEmMaringa().data} />
      </div>
    </div>
  );
}
