describe('Legacy /transactions redirect', () => {
  test('redirects to /bank-transactions', async () => {
    let redirected = ''
    jest.isolateModules(() => {
      jest.doMock('next/navigation', () => ({ redirect: (p: string) => { redirected = p; throw new Error('REDIRECT') } }))
      try { require('@/app/transactions/page') } catch (e: any) { expect(e.message).toBe('REDIRECT') }
    })
    expect(redirected).toBe('/bank-transactions')
  })
})
