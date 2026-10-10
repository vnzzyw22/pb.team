import { forwardRef } from "react";

interface CampoProps {
  id: string;
  rotulo: string;
  erro?: string;
  ajuda?: React.ReactNode;
  opcional?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Rótulo sempre visível, ajuda e erro ligados ao campo por aria-describedby. */
export function Campo({ id, rotulo, erro, ajuda, opcional, children, className = "" }: CampoProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="rotulo block">
        {rotulo}
        {opcional && <span className="font-normal text-giz"> (opcional)</span>}
      </label>
      <div className="mt-2">{children}</div>
      {ajuda && !erro && (
        <p id={`${id}-ajuda`} className="ajuda">
          {ajuda}
        </p>
      )}
      {erro && (
        <p id={`${id}-erro`} className="erro-campo">
          <IconeErro />
          {erro}
        </p>
      )}
    </div>
  );
}

/** Valor de aria-describedby para o campo `id`. */
export function descritoPor(id: string, erro?: string, temAjuda?: boolean): string | undefined {
  if (erro) return `${id}-erro`;
  return temAjuda ? `${id}-ajuda` : undefined;
}

function IconeErro() {
  return (
    <svg viewBox="0 0 16 16" className="mt-[0.2em] h-4 w-4 shrink-0" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.5V9M8 11v.5" strokeLinecap="round" />
    </svg>
  );
}

interface ResumoErrosProps {
  titulo?: string;
  itens: { campo: string; texto: string }[];
}

/** Resumo que recebe o foco depois de um envio com erro; cada item leva ao campo. */
export const ResumoErros = forwardRef<HTMLDivElement, ResumoErrosProps>(function ResumoErros(
  { titulo = "Confira os campos abaixo", itens },
  ref,
) {
  if (!itens.length) return null;
  return (
    <div ref={ref} tabIndex={-1} role="alert" aria-labelledby="resumo-erros-titulo" className="aviso aviso-erro outline-none">
      <p id="resumo-erros-titulo" className="font-semibold text-alerta">
        {titulo}
      </p>
      <ul className="mt-2 grid gap-1">
        {itens.map((i) => (
          <li key={i.campo}>
            <a href={`#${i.campo}`} className="underline decoration-dashed underline-offset-4">
              {i.texto}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});
