import { prisma } from '../src/database/client'

const SAO_PAULO_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

const demoCategories = [
  { nomeCategoria: 'Reunião', corHex: '#C96442' },
  { nomeCategoria: 'Comercial', corHex: '#3C7A6B' },
  { nomeCategoria: 'Acompanhamento', corHex: '#6C77C9' },
]

const demoClients = [
  {
    razaoSocialNome: 'Mercado Aurora (demonstração)',
    telefoneWhatsapp: '+5511999990001',
    email: 'contato@mercado-aurora.example',
    ramoAtuacao: 'Comércio varejista',
    origemContato: 'Demonstração',
    observacoes: 'Dados fictícios para apresentação acadêmica. Não contatar.',
  },
  {
    razaoSocialNome: 'Estúdio Horizonte (demonstração)',
    telefoneWhatsapp: '+5511999990002',
    email: 'contato@estudio-horizonte.example',
    ramoAtuacao: 'Serviços',
    origemContato: 'Demonstração',
    observacoes: 'Dados fictícios para apresentação acadêmica. Não contatar.',
  },
  {
    razaoSocialNome: 'Oficina Modelo (demonstração)',
    telefoneWhatsapp: '+5511999990003',
    email: 'contato@oficina-modelo.example',
    ramoAtuacao: 'Automotivo',
    origemContato: 'Demonstração',
    observacoes: 'Dados fictícios para apresentação acadêmica. Não contatar.',
  },
  {
    razaoSocialNome: 'Grupo Ipê (demonstração)',
    telefoneWhatsapp: '+5511999990004',
    email: 'contato@grupo-ipe.example',
    ramoAtuacao: 'Consultoria',
    origemContato: 'Demonstração',
    observacoes: 'Dados fictícios para apresentação acadêmica. Não contatar.',
  },
]

function getDatePart(
  parts: Intl.DateTimeFormatPart[],
  type: string,
): number {
  const part = parts.find((item) => item.type === type)
  if (!part) {
    throw new Error(`Parte de data ausente: ${type}`)
  }
  return Number(part.value)
}

function dateInSaoPaulo(daysFromToday: number, hour: number, minute = 0) {
  const todayParts = SAO_PAULO_DATE_FORMATTER.formatToParts(new Date())
  const year = getDatePart(todayParts, 'year')
  const month = getDatePart(todayParts, 'month')
  const day = getDatePart(todayParts, 'day')
  const targetAsUtc = Date.UTC(year, month - 1, day + daysFromToday, hour, minute)
  let timestamp = targetAsUtc

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const localParts = SAO_PAULO_DATE_FORMATTER.formatToParts(
      new Date(timestamp),
    )
    const localAsUtc = Date.UTC(
      getDatePart(localParts, 'year'),
      getDatePart(localParts, 'month') - 1,
      getDatePart(localParts, 'day'),
      getDatePart(localParts, 'hour'),
      getDatePart(localParts, 'minute'),
      getDatePart(localParts, 'second'),
    )
    const nextTimestamp = timestamp + targetAsUtc - localAsUtc

    if (nextTimestamp === timestamp) {
      break
    }

    timestamp = nextTimestamp
  }

  return new Date(timestamp)
}

async function seedDemoData() {
  const counts = await prisma.$transaction(async (transaction) => {
    const administrators = await transaction.administrador.findMany({
      select: { idAdministrador: true },
    })

    if (administrators.length !== 1) {
      throw new Error(
        `A carga exige exatamente um administrador existente; encontrados: ${administrators.length}. Nenhum dado foi alterado.`,
      )
    }

    const administrator = administrators[0]

    await transaction.compromisso.deleteMany()
    await transaction.pushSubscription.deleteMany()
    await transaction.cliente.deleteMany()
    await transaction.categoriaCompromisso.deleteMany()

    const categories = await Promise.all(
      demoCategories.map((data) =>
        transaction.categoriaCompromisso.create({ data }),
      ),
    )
    const clients = await Promise.all(
      demoClients.map((data) => transaction.cliente.create({ data })),
    )

    const appointments = [
      {
        titulo: 'Reunião de apresentação — Mercado Aurora',
        descricao: 'Apresentação inicial e levantamento de necessidades.',
        daysFromToday: 1,
        hour: 9,
        category: categories[0],
        client: clients[0],
        reminderMinutes: 1440,
      },
      {
        titulo: 'Apresentação de proposta — Estúdio Horizonte',
        descricao: 'Revisão da proposta comercial e próximos passos.',
        daysFromToday: 1,
        hour: 14,
        category: categories[1],
        client: clients[1],
        reminderMinutes: 60,
      },
      {
        titulo: 'Acompanhamento — Oficina Modelo',
        descricao: 'Retorno sobre o atendimento e alinhamento de pendências.',
        daysFromToday: 2,
        hour: 10,
        category: categories[2],
        client: clients[2],
        reminderMinutes: null,
      },
      {
        titulo: 'Revisão de cronograma — Grupo Ipê',
        descricao: 'Conferência das etapas e datas previstas.',
        daysFromToday: 3,
        hour: 15,
        category: categories[0],
        client: clients[3],
        reminderMinutes: 30,
      },
      {
        titulo: 'Retorno sobre proposta — Mercado Aurora',
        descricao: 'Esclarecimento de dúvidas e registro da decisão.',
        daysFromToday: 5,
        hour: 11,
        category: categories[1],
        client: clients[0],
        reminderMinutes: 1440,
      },
      {
        titulo: 'Acompanhamento mensal — Estúdio Horizonte',
        descricao: 'Reunião de acompanhamento periódico.',
        daysFromToday: 7,
        hour: 9,
        category: categories[2],
        client: clients[1],
        reminderMinutes: 60,
      },
      {
        titulo: 'Reunião concluída — Oficina Modelo',
        descricao: 'Registro de exemplo de um compromisso concluído.',
        daysFromToday: -7,
        hour: 10,
        category: categories[0],
        client: clients[2],
        reminderMinutes: null,
        concluido: true,
      },
    ]

    for (const appointment of appointments) {
      const dataHoraInicio = dateInSaoPaulo(
        appointment.daysFromToday,
        appointment.hour,
      )

      await transaction.compromisso.create({
        data: {
          titulo: appointment.titulo,
          descricao: appointment.descricao,
          dataHoraInicio,
          dataHoraFim: new Date(dataHoraInicio.getTime() + 60 * 60 * 1000),
          concluido: appointment.concluido ?? false,
          antecedenciaAlertaMinutos: appointment.reminderMinutes,
          idCategoria: appointment.category.idCategoria,
          idCliente: appointment.client.idCliente,
          idAdministrador: administrator.idAdministrador,
        },
      })
    }

    return {
      categories: categories.length,
      clients: clients.length,
      appointments: appointments.length,
    }
  })

  console.log(
    `Dados de demonstração carregados: ${counts.categories} categorias, ${counts.clients} clientes e ${counts.appointments} compromissos. O administrador existente foi preservado.`,
  )
}

void seedDemoData()
  .catch((error: unknown) => {
    console.error(
      'Falha ao carregar os dados de demonstração:',
      error instanceof Error ? error.message : error,
    )
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
