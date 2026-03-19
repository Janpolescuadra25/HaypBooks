import { ReminderService } from './reminder.service'

describe('ReminderService', () => {
  function makeSut() {
    const prisma: any = {
      task: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue(undefined),
      },
    }
    const mailer = { sendEmail: jest.fn().mockResolvedValue(undefined) }
    const svc = new ReminderService(prisma, mailer as any)
    return { svc, prisma, mailer }
  }

  it('marks task as sent and sends email when reminder due', async () => {
    const { svc, prisma, mailer } = makeSut()
    prisma.task.findMany.mockResolvedValue([{ id: 't1', title: 'Do thing', remindAt: new Date(), reminderSent: false, assignedToEmail: 'a@b.com' }])
    await svc.checkReminders()
    expect(mailer.sendEmail).toHaveBeenCalled()
    expect(prisma.task.update).toHaveBeenCalledWith({ where: { id: 't1' }, data: { reminderSent: true } })
  })
})
