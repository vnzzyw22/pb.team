/**
 * Pix "copia e cola" estático (BR Code), conforme o Manual de Padrões para
 * Iniciação do Pix do Banco Central. Não depende de banco nem de API: o valor
 * e o identificador da reserva vão embutidos no código, e a confirmação do
 * pagamento é feita manualmente no painel.
 */

function campo(id: string, valor: string): string {
  return `${id}${String(valor.length).padStart(2, "0")}${valor}`;
}

/** Remove acentos e caracteres fora do conjunto aceito pelo BR Code. */
function limpar(texto: string, max: number): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 .\-*@/]/g, "")
    .trim()
    .slice(0, max);
}

/** CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF). */
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export interface DadosPix {
  chave: string;
  recebedor: string;
  cidade: string;
  /** centavos; omitido = o pagador digita o valor */
  valor?: number;
  /** Identificador da transação (até 25 caracteres alfanuméricos). */
  txid?: string;
  descricao?: string;
}

export function gerarPixCopiaECola(d: DadosPix): string {
  if (!d.chave) throw new Error("Chave Pix não configurada");
  const conta =
    campo("00", "br.gov.bcb.pix") + campo("01", d.chave) + (d.descricao ? campo("02", limpar(d.descricao, 40)) : "");
  const txid = d.txid ? d.txid.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***" : "***";

  const semCrc =
    campo("00", "01") +
    campo("26", conta) +
    campo("52", "0000") +
    campo("53", "986") +
    (d.valor !== undefined ? campo("54", (d.valor / 100).toFixed(2)) : "") +
    campo("58", "BR") +
    campo("59", limpar(d.recebedor, 25)) +
    campo("60", limpar(d.cidade, 15)) +
    campo("62", campo("05", txid)) +
    "6304";

  return semCrc + crc16(semCrc);
}
