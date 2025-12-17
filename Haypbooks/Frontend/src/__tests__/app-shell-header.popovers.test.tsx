import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock navigation and profile helpers used by header
jest.mock('next/navigation', () => ({ usePathname: () => '/' }))
jest.mock('@/lib/profile-cache', () => ({ getProfileCached: jest.fn().mockResolvedValue({ permissions: ['accountant:tools'], features: { payments: true } }) }))

// Avoid rendering complex children (NewMenu/UserMenu/RoleSwitcher) — keep header focused
jest.mock('@/components/NewMenu', () => () => <div data-testid="newmenu" />)
jest.mock('@/components/UserMenu', () => () => <div data-testid="usermenu" />)
jest.mock('@/components/RoleSwitcher', () => ({ RoleSwitcher: () => <div data-testid="roleswitcher" /> }))

import AppShellHeader from '@/components/AppShellHeader'

describe('AppShellHeader popovers (apps/help/more) close on scroll and blur trigger', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('closes & blurs apps menu when window scrolls', async () => {
    // Mock periods fetch used by header
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ closedThrough: '2025-12-31' }) } as any)

    render(<AppShellHeader />)

    // open the apps menu via the apps button
    const appsBtn = await screen.findByRole('button', { name: /open apps/i }) as HTMLButtonElement
    fireEvent.click(appsBtn)

    // ensure a menu item appears
    expect(await screen.findByRole('menuitem', { name: /App hub/i })).toBeInTheDocument()
    // Our new item should be present
    expect(await screen.findByRole('menuitem', { name: /Companies & Clients/i })).toBeInTheDocument()

    // scroll should close the menu and blur the trigger
    fireEvent.scroll(window)

    await waitFor(() => expect(screen.queryByRole('menuitem', { name: /App hub/i })).not.toBeInTheDocument())
    expect(document.activeElement).not.toBe(appsBtn)
  })

  it('closes & blurs help menu when window scrolls', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ closedThrough: '2025-12-31' }) } as any)

    render(<AppShellHeader />)
    const helpBtn = await screen.findByRole('button', { name: /open help/i }) as HTMLButtonElement
    fireEvent.click(helpBtn)
    expect(await screen.findByRole('menuitem', { name: /Help center/i })).toBeInTheDocument()

    fireEvent.scroll(window)

    await waitFor(() => expect(screen.queryByRole('menuitem', { name: /Help center/i })).not.toBeInTheDocument())
    expect(document.activeElement).not.toBe(helpBtn)
  })
})
