import { UsersService } from './users.service'
import { NotFoundException } from '@nestjs/common'

describe('UsersService', () => {
  let usersService: UsersService
  const mockUserRepo: any = {
    findById: jest.fn(),
    update: jest.fn(),
    findByEmail: jest.fn(),
  }

  beforeEach(() => {
    jest.resetAllMocks()
    usersService = new UsersService(mockUserRepo)
  })

  test('setPreferredHub updates and returns user without password', async () => {
    mockUserRepo.update.mockResolvedValue({ id: 'u1', email: 'a@b.com', preferredHub: 'ACCOUNTANT', password: 'x' })
    const res = await usersService.setPreferredHub('u1', 'ACCOUNTANT')
    expect(mockUserRepo.update).toHaveBeenCalledWith('u1', { preferredHub: 'ACCOUNTANT' })
    expect(res.preferredHub).toBe('ACCOUNTANT')
    expect((res as any).password).toBeUndefined()
  })
})