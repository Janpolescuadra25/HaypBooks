import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock next/navigation with mutable pathname
jest.mock('next/navigation', () => {
  let pathname = '/hub/companies'
  return {
    usePathname: () => pathname,
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
    __setPath: (p: string) => { pathname = p },
  }
})

// Mock app chrome components so we can detect presence/absence
jest.mock('@/components/AppShellHeader', () => () => <div data-testid="app-shell-header">App Shell</div>)
jest.mock('@/components/Sidebar', () => () => <div data-testid="sidebar">Sidebar</div>)

import ClientRoot from '@/app/client-root'

describe('ClientRoot public path behavior', () => {
  afterEach(() => {
    // reset to hub path
    const nav = require('next/navigation')
    nav.__setPath('/hub/companies')
  })

  it('does not render app chrome for /hub paths', () => {
    render(<ClientRoot><div>hub content</div></ClientRoot>)

    expect(screen.getByText('hub content')).toBeInTheDocument()
    expect(screen.queryByTestId('app-shell-header')).toBeNull()
    expect(screen.queryByTestId('sidebar')).toBeNull()
  })

  it('does not render app chrome for /get-started paths', () => {
    const nav = require('next/navigation')
    nav.__setPath('/get-started/plans')

    render(<ClientRoot><div>get-started content</div></ClientRoot>)

    expect(screen.getByText('get-started content')).toBeInTheDocument()
    expect(screen.queryByTestId('app-shell-header')).toBeNull()
    expect(screen.queryByTestId('sidebar')).toBeNull()
  })

  it('renders app chrome for non-public paths', () => {
    const nav = require('next/navigation')
    nav.__setPath('/dashboard')

    render(<ClientRoot><div>dashboard content</div></ClientRoot>)

    expect(screen.getByText('dashboard content')).toBeInTheDocument()
    expect(screen.getByTestId('app-shell-header')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('does not render app chrome for /verification', () => {
    const nav = require('next/navigation')
    nav.__setPath('/verification')

    render(<ClientRoot><div>verification content</div></ClientRoot>)

    expect(screen.getByText('verification content')).toBeInTheDocument()
    expect(screen.queryByTestId('app-shell-header')).toBeNull()
    expect(screen.queryByTestId('sidebar')).toBeNull()
  })
})
