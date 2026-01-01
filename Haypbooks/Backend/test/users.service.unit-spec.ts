import { UsersService } from '../src/users/users.service'

describe('UsersService updatePhone', () => {
  beforeEach(() => { process.env.DEFAULT_PHONE_COUNTRY = 'US' })
  afterEach(() => { delete process.env.DEFAULT_PHONE_COUNTRY })
  test('normalizes phone and stores phoneHmac when HMAC_KEY set', async () => {
    process.env.HMAC_KEY = 'testkey'
    let updatedCall: any = null
    const mockRepo: any = {
      update: jest.fn((id: string, data: any) => { updatedCall = { id, data }; return Promise.resolve({ id, ...data }) })
    }
    const svc = new UsersService(mockRepo)

    const res = await svc.updatePhone('u1', '1 (555) 000-1111')
    expect(updatedCall).not.toBeNull()
    expect(updatedCall.data.phone).toBe('+15550001111')
    expect(updatedCall.data.phoneHmac).toBeDefined()
    delete process.env.HMAC_KEY
  })
})