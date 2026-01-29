import { ReportingRepository } from '../reporting.repository.prisma'

const mockPrisma: any = {
  kpiDashboard: { create: jest.fn(), findUnique: jest.fn() },
}

describe('ReportingRepository', () => {
  let repo: ReportingRepository
  beforeEach(() => {
    jest.resetAllMocks()
    repo = new ReportingRepository(mockPrisma as any)
  })

  test('createDashboard creates dashboard with widgets', async () => {
    const created = { id: 'd1', name: 'Main', widgets: [{ id: 'w1', title: 'W' }] }
    mockPrisma.kpiDashboard.create.mockResolvedValueOnce(created)

    const res = await repo.createDashboard({ companyId: 'c1', workspaceId: 'w1', name: 'Main', ownerId: 'u1', widgets: [{ type: 'table', title: 'W', config: {}, position: 1, size: 'half' }] })

    expect(mockPrisma.kpiDashboard.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ name: 'Main' }), include: { widgets: true } }))
    expect(res).toEqual(created)
  })

  test('getDashboard returns dashboard with widgets', async () => {
    const found = { id: 'd1', name: 'Main', widgets: [] }
    mockPrisma.kpiDashboard.findUnique.mockResolvedValueOnce(found)

    const res = await repo.getDashboard('d1')
    expect(mockPrisma.kpiDashboard.findUnique).toHaveBeenCalledWith({ where: { id: 'd1' }, include: { widgets: true } })
    expect(res).toEqual(found)
  })
})