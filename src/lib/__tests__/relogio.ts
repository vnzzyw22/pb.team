/** Relógio controlável para testes. Horários em Maringá (UTC-3). */
export function relogioFixo(dataHoraLocal: string) {
  let atual = new Date(`${dataHoraLocal}:00-03:00`);
  return {
    agora: () => new Date(atual),
    avancarMinutos(min: number) {
      atual = new Date(atual.getTime() + min * 60_000);
    },
  };
}

export function ids() {
  let n = 0;
  return () => `id-${++n}`;
}
