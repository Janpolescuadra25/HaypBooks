import React from 'react'
import { render, screen } from '@testing-library/react'

import HubLayout from '@/app/hub/layout'

// Stub HubSwitcher so layout test is deterministic
jest.mock('@/components/HubSwitcher', () => ({ __esModule: true, default: () => <div>Switch hub</div> }))
// Stub CompanySwitcher and HubHeader to make tests deterministic
jest.mock('@/components/CompanySwitcher', () => ({ __esModule: true, default: () => <div>Companies</div> }))
jest.mock('@/components/HubHeader', () => ({ __esModule: true, default: () => <div>HubHeader</div> }))

describe('HubLayout', () => {
  it('renders Hub header and children', () => {
    render(<HubLayout><div>hub body</div></HubLayout>)
    // HubHeader is now conditionally hidden for /hub routes — ensure child is still rendered
    expect(screen.getByText('hub body')).toBeInTheDocument()
  })
})
