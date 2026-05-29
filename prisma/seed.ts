import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create WhatsApp platform
  const whatsapp = await prisma.platform.create({
    data: {
      name: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
    },
  })

  // Create Instagram platform
  await prisma.platform.create({
    data: {
      name: 'Instagram',
      icon: '📸',
      color: '#E1306C',
    },
  })

  // Create sample account
  const account = await prisma.account.create({
    data: {
      platformId: whatsapp.id,
      name: 'Conta Principal',
      username: '+55 11 99999-0001',
      status: 'warming',
      totalDays: 7,
    },
  })

  // Generate days
  const dayTemplates = [
    {
      title: 'Dia 1 – Configuração inicial',
      tasks: ['Adicionar foto de perfil', 'Alterar nome de exibição', 'Configurar status'],
    },
    {
      title: 'Dia 2 – Primeiros contatos',
      tasks: ['Enviar mensagem para 3 contatos', 'Entrar em 1 grupo'],
    },
    {
      title: 'Dia 3 – Engajamento',
      tasks: ['Conversar com 5 contatos', 'Enviar áudio'],
    },
    { title: 'Dia 4', tasks: ['Entrar em mais grupos', 'Reagir a mensagens'] },
    { title: 'Dia 5', tasks: ['Compartilhar status', 'Responder mensagens'] },
    { title: 'Dia 6', tasks: ['Aumentar atividade'] },
    { title: 'Dia 7 – Conclusão', tasks: ['Verificar saúde da conta', 'Documentar resultado'] },
  ]

  for (let i = 0; i < dayTemplates.length; i++) {
    const tmpl = dayTemplates[i]
    const day = await prisma.scheduleDay.create({
      data: {
        accountId: account.id,
        dayNumber: i + 1,
        title: tmpl.title,
        status: i === 0 ? 'completed' : i === 1 ? 'in_progress' : 'not_started',
        order: i + 1,
      },
    })

    for (let j = 0; j < tmpl.tasks.length; j++) {
      await prisma.task.create({
        data: {
          dayId: day.id,
          title: tmpl.tasks[j],
          completed: i === 0,
          order: j,
        },
      })
    }
  }

  console.log('✅ Seed concluído!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
