import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { ContactsService } from '../../contacts/contacts.service'
import { ContactsRepository } from '../../contacts/contacts.repository'
import { CreateCustomerDto } from '../../contacts/dto/create-customer.dto'
import { UpdateCustomerDto } from '../../contacts/dto/update-customer.dto'
import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'

describe('ContactsService', () => {
  let mockRepo: any
  let mockPrisma: any
  let service: ContactsService

  beforeEach(() => {
    mockRepo = {
      findCustomers: jest.fn(),
      findCustomerById: jest.fn(),
      createCustomer: jest.fn(),
      updateCustomer: jest.fn(),
      softDeleteCustomer: jest.fn(),
    }

    mockPrisma = {
      workspaceUser: { findFirst: jest.fn().mockResolvedValue({ id: 'wsu1' }) },
      company: { findUnique: jest.fn().mockResolvedValue({ workspaceId: 'w1' }) },
      customer: { findFirst: jest.fn(), update: jest.fn() },
    }

    service = new ContactsService(mockRepo as any, mockPrisma as any)
  })

  test('findCustomers returns paginated results with correct shape', async () => {
    const items = Array.from({ length: 5 }, (_, i) => ({ id: `c${i + 1}`, displayName: `Customer ${i + 1}` }))
    mockRepo.findCustomers.mockResolvedValue({ items, pagination: { page: 1, limit: 10, total: 5, totalPages: 1 } })

    const result = await service.findCustomers('u1', 'c1', { search: 'test', page: 1, limit: 10 })

    expect(result.items).toHaveLength(5)
    expect(result.pagination).toEqual({ page: 1, limit: 10, total: 5, totalPages: 1 })
    expect(mockPrisma.workspaceUser.findFirst).toHaveBeenCalled()
    expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({ where: { id: 'c1' }, select: { workspaceId: true } })
    expect(mockRepo.findCustomers).toHaveBeenCalledWith('w1', { search: 'test', page: 1, limit: 10 })
  })

  test('findCustomers includes status field (Active/Inactive)', async () => {
    const rawItems = [
      { id: 'c1', deletedAt: null, status: 'Active' },
      { id: 'c2', deletedAt: new Date(), status: 'Inactive' },
    ]
    mockRepo.findCustomers.mockResolvedValue({ items: rawItems, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } })

    const result = await service.findCustomers('u1', 'c1', { search: 'test', page: 1, limit: 10 })

    expect(result.items[0].status).toBe('Active')
    expect(result.items[1].status).toBe('Inactive')
  })

  test('createCustomer uses DTO validation', async () => {
    const validDto: CreateCustomerDto = { displayName: 'Valid Corp' }
    mockRepo.createCustomer.mockResolvedValue({ id: 'c1', displayName: 'Valid Corp' })

    const createResult = await service.createCustomer('u1', 'c1', validDto)
    expect(createResult).toEqual({ id: 'c1', displayName: 'Valid Corp' })

    const invalidDto = plainToInstance(CreateCustomerDto, { email: 'invalid' })
    const violations = validateSync(invalidDto)
    expect(violations.length).toBeGreaterThan(0)

    const emptyDto = plainToInstance(CreateCustomerDto, {})
    const emptyViolations = validateSync(emptyDto)
    expect(emptyViolations.length).toBeGreaterThan(0)
  })

  test('updateCustomer uses DTO validation', async () => {
    const validDto: UpdateCustomerDto = { displayName: 'Updated Corp' }
    mockRepo.updateCustomer.mockResolvedValue({ id: 'c1', displayName: 'Updated Corp' })

    const updateResult = await service.updateCustomer('u1', 'c1', 'c1', validDto)
    expect(updateResult).toEqual({ id: 'c1', displayName: 'Updated Corp' })

    const invalidDto = plainToInstance(UpdateCustomerDto, { email: 'invalid' })
    const invalidViolations = validateSync(invalidDto)
    expect(invalidViolations.length).toBeGreaterThan(0)
  })

  test('softDeleteCustomer sets deletedAt and deletedBy', async () => {
    mockRepo.softDeleteCustomer.mockResolvedValue(true)

    await service.softDeleteCustomer('u1', 'c1', 'c1')

    expect(mockRepo.softDeleteCustomer).toHaveBeenCalledWith('w1', 'c1', 'u1')
  })

  test('assertCompanyAccess blocks unauthorized user', async () => {
    mockPrisma.workspaceUser.findFirst.mockResolvedValue(null)
    await expect(service.findCustomers('u1', 'c1', {} as any)).rejects.toThrow(ForbiddenException)
  })
})
