import Image from "next/image";
import { fotoPorId } from "@/lib";

interface FotoClubeProps {
  id: string;
  /** Tamanho real na tela, para o next/image escolher o arquivo certo. */
  sizes: string;
  className?: string;
  priority?: boolean;
}

/**
 * Foto do catálogo `FOTOS`, com as dimensões, o texto alternativo e o ponto de
 * foco (`object-position`) definidos lá. Ocupa a caixa do pai em `object-cover`.
 */
export function FotoClube({ id, sizes, className = "", priority = false }: FotoClubeProps) {
  const foto = fotoPorId(id);
  if (!foto) return null;
  return (
    <Image
      src={foto.src}
      width={foto.largura}
      height={foto.altura}
      alt={foto.alt}
      sizes={sizes}
      priority={priority}
      className={`h-full w-full object-cover ${className}`}
      style={{ objectPosition: foto.foco ?? "50% 50%" }}
    />
  );
}
