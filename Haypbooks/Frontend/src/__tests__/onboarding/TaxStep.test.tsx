import React from 'react'
import { render, screen, act } from '@testing-library/react'
import OnboardingPage from '@/app/onboarding/page'

// Render the TaxStep component in isolation to avoid navigating through onboarding which triggers network calls
import { TaxStep } from '@/app/onboarding/page'

// Validate presence by rendering the TaxStep component directly
test('Tax step renders Tax Setup and PH defaults work', async () => {
  render(<TaxStep />)

  // Now the Tax step heading should be visible
  expect(await screen.findByText(/Tax Setup/i)).toBeInTheDocument()

  // Check TIN field and helper note
  expect(screen.getByLabelText(/Tax Identification Number/i)).toBeInTheDocument()
  expect(screen.getByText(/Required for VAT-registered businesses/i)).toBeInTheDocument()

  // Filing frequency should default to quarterly when collecting VAT
  const freq = screen.getByLabelText(/Sales tax filing frequency/i) as HTMLSelectElement
  expect(freq).toBeInTheDocument()
  expect(freq.value).toBe('quarterly')

  // Recommended badge on collect toggle (span badge)
  const recBadge = screen.getByText(/Recommended/i, { selector: 'span' })
  expect(recBadge).toBeInTheDocument()

  // Tax inclusive checkbox shown when collecting tax
  expect(screen.getByLabelText(/Tax inclusive pricing/i)).toBeInTheDocument()

  // Check default VAT rate display
  expect(screen.getByText(/12%|12 %/)).toBeInTheDocument()

  // Check toggles
  expect(screen.getByLabelText(/Collect Sales Tax/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Tax Exempt Status/i)).toBeInTheDocument()
})
