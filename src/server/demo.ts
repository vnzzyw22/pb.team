import {
  agoraEmMaringa,
  categoriaPorAnoNascimento,
  diaDaSemana,
  hora,
  normalizarTelefone,
  orcar,
  ServicoReservas,
  somarDias,
  type DataISO,
  type DiaSemana,
  type ItemReserva,
  type Lead,
  type Repositorio,
  type Reserva,
  type StatusLead,
  type StatusReserva,
} from "@/lib";

/**
 * Dados de exemplo para a demonstração: a agenda abre "viva", como se o
 * sistema estivesse em uso há algumas semanas. Datas relativas a hoje.
 */

function proximo(hoje: DataISO, dia: DiaSemana, depoisDe = 0): DataISO {
  let d = somarDias(hoje, 1 + depoisDe);
  while (diaDaSemana(d) !== dia) d = somarDias(d, 1);
  return d;
}

function anterior(hoje: DataISO, dia: DiaSemana, semanasAtras = 0): DataISO {
  let d = somarDias(hoje, -1);
  while (diaDaSemana(d) !== dia) d = somarDias(d, -1);
  return somarDias(d, -7 * semanasAtras);
}

const tel = (n: string) => normalizarTelefone(n)!;

export async function semearDemo(
  repo: Repositorio,
  instante: Date = new Date(),
  gerarId: () => string = () => crypto.randomUUID(),
): Promise<void> {
  const agora = agoraEmMaringa(instante);
  const hoje = agora.data;
  const servico = new ServicoReservas(repo, () => instante, gerarId);
  let seq = 0;

  // -------------------------------------------- histórico (últimas 2 semanas)
  const passada = async (
    data: DataISO,
    inicio: string,
    duracao: number,
    nome: string,
    telefone: string,
    status: StatusReserva,
    opcoes: { churrasqueira?: boolean; serieId?: string; valor?: number } = {},
  ) => {
    const ini = hora(inicio);
    const itens: ItemReserva[] = [{ recursoId: "quadra", intervalo: { inicio: ini, fim: ini + duracao } }];
    if (opcoes.churrasqueira) itens.push({ recursoId: "churrasqueira", intervalo: { inicio: ini, fim: ini + 240 } });
    const orcamento =
      opcoes.valor !== undefined
        ? { itens: [{ rotulo: "Mensalista", minutos: duracao, valor: opcoes.valor }], subtotal: opcoes.valor, desconto: 0, total: opcoes.valor, sinal: opcoes.valor / 2 }
        : orcar(data, itens);
    const r: Reserva = {
      id: gerarId(),
      codigo: `PB-D${String(++seq).padStart(3, "0")}`,
      data,
      itens,
      cliente: { nome, telefone: tel(telefone) },
      status,
      origem: opcoes.serieId ? "mensalista" : "site",
      orcamento,
      valorPago: status === "concluida" ? orcamento.total : orcamento.sinal,
      serieId: opcoes.serieId,
      criadaEm: instante.getTime() - 20 * 86_400_000,
      atualizadaEm: instante.getTime(),
    };
    await repo.salvarReserva(r);
  };

  // ------------------------------------------------------------ mensalistas
  const turmaDoZe = await servico.criarSerie(
    { cliente: { nome: "Turma do Zé", telefone: "44 99812-3344" }, recursoId: "quadra", diaSemana: 2, inicio: "22:00", duracao: 60, dataInicio: anterior(hoje, 2, 1), valorPorOcorrencia: 14000 },
    6,
  );
  const amigosDaQuinta = await servico.criarSerie(
    { cliente: { nome: "Amigos da Quinta", telefone: "44 99733-1020" }, recursoId: "quadra", diaSemana: 4, inicio: "18:00", duracao: 60, dataInicio: anterior(hoje, 4, 1) },
    6,
  );
  const medicos = await servico.criarSerie(
    { cliente: { nome: "Pelada dos Médicos", telefone: "44 99155-8800" }, recursoId: "quadra", diaSemana: 5, inicio: "20:00", duracao: 90, dataInicio: anterior(hoje, 5, 1), valorPorOcorrencia: 20000 },
    6,
  );

  for (const semanas of [0, 1]) {
    await passada(anterior(hoje, 2, semanas), "22:00", 60, "Turma do Zé", "44 99812-3344", "concluida", { serieId: turmaDoZe.serie.id, valor: 14000 });
    await passada(anterior(hoje, 4, semanas), "18:00", 60, "Amigos da Quinta", "44 99733-1020", semanas === 0 ? "nao_compareceu" : "concluida", { serieId: amigosDaQuinta.serie.id });
    await passada(anterior(hoje, 5, semanas), "20:00", 90, "Pelada dos Médicos", "44 99155-8800", "concluida", { serieId: medicos.serie.id, valor: 20000 });
  }
  await passada(anterior(hoje, 6), "10:00", 60, "Aniversário do Lucas", "44 99620-4411", "concluida", { churrasqueira: true });
  await passada(anterior(hoje, 0), "16:00", 120, "Resenha FC", "44 99901-2233", "concluida");
  await passada(anterior(hoje, 6, 1), "15:00", 90, "Empresa Alfa — confraternização", "44 3026-5500", "concluida", { churrasqueira: true });

  // ---------------------------------------------------------------- futuras
  const sabado = proximo(hoje, 6);
  const domingo = proximo(hoje, 0);

  const combo = await servico.solicitar({
    data: sabado,
    recursoId: "quadra",
    inicio: "10:00",
    duracao: 60,
    comChurrasqueira: true,
    cliente: { nome: "Família Oliveira", telefone: "44 99877-6655" },
  });
  if (combo.ok) await servico.confirmarSinal(combo.reserva.id);

  await servico.criarPeloPainel({
    data: domingo,
    recursoId: "quadra",
    inicio: "16:00",
    duracao: 120,
    cliente: { nome: "Resenha FC", telefone: "44 99901-2233" },
    valorPago: 15000,
  });

  // aguardando o Pix: aparece em destaque no painel. Na demo o prazo é
  // estendido para não expirar no meio da apresentação.
  const pendente = await servico.solicitar({
    data: sabado,
    recursoId: "quadra",
    inicio: "18:00",
    duracao: 90,
    cliente: { nome: "Galera do Condomínio", telefone: "44 99444-1212" },
  });
  if (pendente.ok) {
    await repo.salvarReserva({ ...pendente.reserva, expiraEm: instante.getTime() + 3 * 86_400_000 });
  }

  await servico.criarBloqueio({
    recursoId: "todos",
    data: proximo(hoje, 6, 7),
    inicio: "13:00",
    fim: "18:00",
    motivo: "Jogo do Campeonato Paranaense",
  });

  // ------------------------------------------------- aula experimental (leads)
  const temporada = Number(hoje.slice(0, 4));
  const contatos: [string, string, string, number, StatusLead, number][] = [
    ["Mariana Costa", "44 99871-0001", "Davi", temporada - 8, "novo", 0],
    ["Roberto Lima", "44 99871-0002", "Enzo", temporada - 11, "novo", 1],
    ["Fernanda Alves", "44 99871-0003", "Helena", temporada - 5, "contatado", 2],
    ["Carlos Pereira", "44 99871-0004", "Miguel", temporada - 13, "aula_agendada", 4],
    ["Juliana Rocha", "44 99871-0005", "Theo", temporada - 10, "matriculado", 9],
  ];
  for (const [responsavel, telefone, atleta, anoNascimento, status, diasAtras] of contatos) {
    const cat = categoriaPorAnoNascimento(anoNascimento, temporada);
    const lead: Lead = {
      id: gerarId(),
      responsavel,
      telefone: tel(telefone),
      atleta,
      anoNascimento,
      categoriaId: cat.ok ? cat.categoria.id : undefined,
      turmaId: cat.ok ? cat.categoria.turmas[0].id : undefined,
      status,
      criadoEm: instante.getTime() - diasAtras * 86_400_000,
    };
    await repo.salvarLead(lead);
  }
}
