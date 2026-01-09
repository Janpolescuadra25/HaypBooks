import React from 'react'
import { render, screen } from '../test-utils'
import BusinessStep from '@/components/Onboarding/BusinessStep'

describe('BusinessStep compact layout', () => {
  test('shows basic fields and contact fields, but not an editable company name', async () => {
    render(<BusinessStep initial={{ companyName: 'ACME Corp' }} onSave={() => {}} />)
    // heading includes the company name
    expect(await screen.findByText(/Basic Information/i)).toBeInTheDocument()
    // No editable company name input
    expect(screen.queryByPlaceholderText(/ACME Corporation/i)).toBeNull()
    // New fields: start date, country, and legal business name
    expect(screen.getByLabelText(/Business start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument()

  })
})