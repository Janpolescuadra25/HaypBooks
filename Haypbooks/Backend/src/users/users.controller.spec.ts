import { UsersController } from './users.controller'
import { UsersService } from './users.service'

describe('UsersController', () => {
  it('updateProfile passes sanitized data to service and returns result (firmName only)', async () => {
    const mockSvc: any = { updateProfile: jest.fn().mockResolvedValue({ id: 'u1', firmName: 'F' }) }
    const controller = new UsersController(mockSvc as unknown as UsersService)
    const req: any = { user: { userId: 'u1' } }
    const body = { companyName: ' C ', firmName: 'F' }
    const res = await controller.updateProfile(req, body as any)
    expect(mockSvc.updateProfile).toHaveBeenCalledWith('u1', { firmName: 'F' })
    expect(res.firmName).toBe('F')
  })
})