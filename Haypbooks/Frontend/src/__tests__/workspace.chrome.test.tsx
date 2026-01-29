import React from 'react'
import { render, screen } from '@testing-library/react'
import ClientRoot from '@/app/client-root'

// Mock next/navigation's usePathname to simulate /workspace
jest.mock('next/navigation', () => ({ usePathname: () => '/workspace' }))

describe('Workspace chrome visibility', () => {
  test('hides topbar and sidebar on /workspace', async () => {
    render(
      <ClientRoot>
        <div>Workspace content</div>
      </ClientRoot>
    )

    // AppShellHeader renders .glass-topbar; Sidebar renders .glass-sidebar
    // Both should not be present when pathname is in PUBLIC_PATH_PREFIXES
    expect(document.querySelector('.glass-topbar')).toBeNull()
    expect(document.querySelector('.glass-sidebar')).toBeNull()

    // The workspace content should still be rendered
    expect(screen.getByText('Workspace content')).toBeInTheDocument()
  })
})
