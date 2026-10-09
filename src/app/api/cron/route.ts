import { agoraEmMaringa, somarDias } from "@/lib";
import { obterContexto } from "@/server/contexto";

/**
 * Tarefas diárias (Vercel Cron, ver vercel.json): expira pré-reservas sem
 * sinal e lança as próximas semanas dos mensalistas.
 * Protegida por CRON_SECRET (a Vercel envia "Authorization: Bearer <segredo>").
 */
export async function GET(req: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || req.headers.get("authorization") !== `Bearer ${segredo}`) {
    return new Response("Não autorizado", { status: 401 });
  }
  const { servico } = await obterContexto();
  const expiradas = await servico.expirarPendentes();
  const series = await servico.estenderSeries(somarDias(agoraEmMaringa().data, 8 * 7));
  return Response.json({ expiradas, ...series });
}
