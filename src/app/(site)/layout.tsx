import { BotaoWhatsApp } from "@/components/site/BotaoWhatsApp";
import { Cabecalho } from "@/components/site/Cabecalho";
import { Rodape } from "@/components/site/Rodape";

export default function LayoutDoSite({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a href="#conteudo" className="pular">
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Rodape />
      <BotaoWhatsApp />
    </>
  );
}
