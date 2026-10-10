import { CLUBE } from "@/lib";

export default function Home() {
  return (
    <section className="recipiente pb-24 pt-32">
      <h1 className="titulo t-1">
        Formando atletas em {CLUBE.cidade} desde {CLUBE.fundacao}
      </h1>
    </section>
  );
}
