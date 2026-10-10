interface QuadraProps {
  className?: string;
  /** Vertical acompanha a tela do celular; horizontal, a do computador. */
  orientacao?: "vertical" | "horizontal";
}

/**
 * Quadra de futsal vista de cima, nas medidas oficiais (40 × 20 m, 1 m = 10
 * unidades): linha do meio, círculo central de 3 m, áreas de 6 m formadas por
 * dois quartos de círculo ligados por uma reta, marcas de pênalti a 6 m e de
 * tiro livre a 10 m, e as balizas de 3 m. O traço não engrossa com a escala.
 */
export function Quadra({ className, orientacao = "vertical" }: QuadraProps) {
  const horizontal = orientacao === "horizontal";
  return (
    <svg
      viewBox={horizontal ? "-14 -6 428 212" : "-6 -14 212 428"}
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform={horizontal ? "translate(400 0) rotate(90)" : undefined} vectorEffect="non-scaling-stroke">
        <rect x="0" y="0" width="200" height="400" vectorEffect="non-scaling-stroke" />
        <path d="M0 200H200" vectorEffect="non-scaling-stroke" />
        <circle cx="100" cy="200" r="30" vectorEffect="non-scaling-stroke" />
        <circle cx="100" cy="200" r="1.6" fill="currentColor" stroke="none" />

        {/* Área e marcas do lado de cima */}
        <path d="M25 0A60 60 0 0 0 85 60H115A60 60 0 0 0 175 0" vectorEffect="non-scaling-stroke" />
        <circle cx="100" cy="60" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="100" cy="100" r="1.6" fill="currentColor" stroke="none" />
        <path d="M85 0V-10H115V0" vectorEffect="non-scaling-stroke" />

        {/* Área e marcas do lado de baixo */}
        <path d="M25 400A60 60 0 0 1 85 340H115A60 60 0 0 1 175 400" vectorEffect="non-scaling-stroke" />
        <circle cx="100" cy="340" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="100" cy="300" r="1.6" fill="currentColor" stroke="none" />
        <path d="M85 400V410H115V400" vectorEffect="non-scaling-stroke" />

        {/* Zonas de substituição, junto à linha lateral */}
        <path d="M-4 150H0M-4 100H0M-4 250H0M-4 300H0" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}
