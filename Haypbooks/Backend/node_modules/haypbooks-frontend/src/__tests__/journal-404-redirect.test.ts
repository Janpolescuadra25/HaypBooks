describe('Journal detail 404 redirect', () => {
  test('redirects to /journal with notice when API returns 404', async () => {
    let redirected = ''
    const origFetch = global.fetch
    jest.resetModules()
    jest.doMock('next/navigation', () => ({ redirect: (p: string) => { redirected = p; throw new Error('REDIRECT') } }))
    jest.doMock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))
    ;(global as any).fetch = jest.fn().mockResolvedValue(new Response('', { status: 404 }))
    const mod = await import('@/app/journal/[id]/page')
    const Page = mod.default as any
    await expect(Page({ params: { id: 'je_x' } })).rejects.toThrow('REDIRECT')
    expect(redirected.startsWith('/journal?notice=')).toBe(true)
    ;(global as any).fetch = origFetch
  })
})
