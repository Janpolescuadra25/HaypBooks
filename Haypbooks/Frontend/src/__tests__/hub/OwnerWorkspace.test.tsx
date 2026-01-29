import { jest } from '@jest/globals'
import React from 'react'
import { act } from 'react'

// Page now redirects to /dashboard — ensure redirect is invoked
jest.mock('next/navigation', () => ({ redirect: jest.fn() }))
import Page from '@/app/hub/companies/page'

describe('Owner Workspace page (deprecated)', () => {
  it('redirects into /dashboard', async () => {
    const { redirect } = await import('next/navigation') as any
    await act(async () => { Page() as any })
    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })
})
