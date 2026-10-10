"use client";

import { useEffect, useState } from "react";

/** Milissegundos que faltam até `ate` (epoch ms), atualizados a cada segundo. */
export function useContagem(ate?: number): number | null {
  const [agora, setAgora] = useState<number | null>(null);
  useEffect(() => {
    if (ate === undefined) return;
    setAgora(Date.now());
    const id = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [ate]);
  if (ate === undefined || agora === null) return null;
  return Math.max(0, ate - agora);
}

/** 754000 → "12:34" */
export function formatarContagem(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const min = Math.floor(total / 60);
  const seg = total % 60;
  return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
}
