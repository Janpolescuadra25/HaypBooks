import { UsersController } from './users.controller'
import { UsersService } from './users.service'

describe('UsersController', () => {
  it('updateProfile calls service and returns result', async () => {
    const mockSvc: any = { updateProfile: jest.fn().mockResolvedValue({ id: 'u1' }) }
    const controller = new UsersController(mockSvc as unknown as UsersService)
    const req: any = { user: { userId: 'u1' } }
    const body = { companyName: ' C ' }
    const res = await controller.updateProfile(req, body as any)
    expect(mockSvc.updateProfile).toHaveBeenCalledWith('u1', {})
    expect(res.id).toBe('u1')
  })
})