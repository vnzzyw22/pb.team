"use client";

import { useRef, useState } from "react";
import { CLUBE, linkWhatsApp, mensagens } from "@/lib";
import { abrirWhatsApp } from "@/components/ui/abaWhatsApp";
import { Campo, descritoPor } from "@/components/ui/Campo";

/** Formulário curto: empresa, responsável e formato. Abre o WhatsApp do clube. */
export function FormAnuncie() {
  const [empresa, setEmpresa] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [formato, setFormato] = useState("");
  const [erro, setErro] = useState<string | undefined>();
  const campoEmpresa = useRef<HTMLInputElement>(null);

  const validar = (valor = empresa) => (valor.trim().length < 2 ? "Escreva o nome da empresa." : undefined);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const problema = validar();
    setErro(problema);
    if (problema) {
      campoEmpresa.current?.focus();
      return;
    }
    const texto = mensagens.anuncie({
      empresa: empresa.trim(),
      responsavel: responsavel.trim() || undefined,
      formato: formato || undefined,
    });
    abrirWhatsApp(linkWhatsApp(texto, CLUBE.anuncie.contato.whatsapp));
  }

  return (
    <form noValidate onSubmit={enviar} className="grid gap-6">
      <Campo id="anuncie-empresa" rotulo="Empresa" erro={erro}>
        <input
          ref={campoEmpresa}
          id="anuncie-empresa"
          className="entrada"
          autoComplete="organization"
          value={empresa}
          onChange={(e) => {
            setEmpresa(e.target.value);
            if (erro) setErro(validar(e.target.value));
          }}
          onBlur={() => empresa && setErro(validar())}
          aria-invalid={erro ? true : undefined}
          aria-describedby={descritoPor("anuncie-empresa", erro)}
        />
      </Campo>
      <Campo id="anuncie-responsavel" rotulo="Seu nome" opcional>
        <input
          id="anuncie-responsavel"
          className="entrada"
          autoComplete="name"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
        />
      </Campo>
      <Campo id="anuncie-formato" rotulo="Formato de interesse" opcional>
        <select id="anuncie-formato" className="entrada" value={formato} onChange={(e) => setFormato(e.target.value)}>
          <option value="">Quero conhecer as opções</option>
          {CLUBE.anuncie.formatos.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </Campo>
      <div>
        <button type="submit" className="btn btn-claro w-full sm:w-auto">
          Enviar pelo WhatsApp
        </button>
        <p className="ajuda">Você conversa direto com {CLUBE.anuncie.contato.nome}.</p>
      </div>
    </form>
  );
}
