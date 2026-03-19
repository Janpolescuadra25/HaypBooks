import { TenantsService } from './tenants.service'
import { ForbiddenException, BadRequestException } from '@nestjs/common'

describe('TenantsService', () => {
  function makeSut(overrides: any = {}) {
    const prisma: any = {
      workspaceUser: { findMany: jest.fn() },
      workspaceInvite: { findUnique: jest.fn(), create: jest.fn() },
      user: { findUnique: jest.fn() },
    }
    const mailer = { sendEmail: jest.fn().mockResolvedValue(undefined) }
    const svc = new TenantsService(prisma, mailer as any)
    return { svc, prisma, mailer }
  }

  it('creates an invite and sends email', async () => {
    const { svc, prisma, mailer } = makeSut()
    prisma.workspaceUser.findUnique.mockResolvedValue({ isOwner: true })
    prisma.workspaceInvite.findUnique.mockResolvedValue(null)
    prisma.user.findUnique.mockResolvedValue(null)
    prisma.workspaceInvite.create.mockResolvedValue({ id: 'inv1', workspace: { workspaceName: 'Foo' }, invitedByUser: { email: 'owner@x.com', name: 'Owner' } })

    const result = await svc.createInvite('tenant-123', 'joe@example.com', 'owner-id', 'role-1')
    expect(result.id).toBe('inv1')
    expect(mailer.sendEmail).toHaveBeenCalledWith(
      'joe@example.com',
      'You have been invited to Haypbooks',
      expect.any(String),
      expect.any(String),
    )
  })

  it('rejects if inviter is not owner', async () => {
    const { svc, prisma } = makeSut()
    prisma.workspaceUser.findUnique.mockResolvedValue({ isOwner: false })
    await expect(svc.createInvite('t', 'a@b', 'u')).rejects.toThrow(ForbiddenException)
  })
})
