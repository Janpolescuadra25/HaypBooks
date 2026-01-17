import React from 'react'
import { render, screen } from '../test-utils'
import BusinessStep from '@/components/Onboarding/BusinessStep'

describe('BusinessStep compact layout', () => {
  test('shows basic fields and contact fields, with editable business name and legal name', async () => {
    render(<BusinessStep initial={{ companyName: 'ACME Corp' }} onSave={() => {}} />)
    // heading includes the company name
    expect(await screen.findByText(/Basic Information/i)).toBeInTheDocument()
    // Business name and legal business name inputs should be present
    expect(screen.getByPlaceholderText(/e.g. Acme Innovations/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Official Registered Name/i)).toBeInTheDocument()
    // Existing fields: country and address
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Address lines, City/i)).toBeInTheDocument()

  })
})