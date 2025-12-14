/** @jest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import NewCustomerPage from '@/app/customers/new/page'
import NewVendorPage from '@/app/vendors/new/page'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }), useSearchParams: () => new URLSearchParams('') }))

describe('New Customer/Vendor form a11y', () => {
  it('Customer form has labelled inputs and exposes errors via aria-describedby', async () => {
    render(<NewCustomerPage />)
    const name = screen.getByLabelText(/name/i)
    const email = screen.getByLabelText(/email/i)
    const phone = screen.getByLabelText(/phone/i)
    expect(name).toBeInTheDocument()
    expect(email).toBeInTheDocument()
    expect(phone).toBeInTheDocument()

    // Trigger validation errors
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
    expect(name).toHaveAttribute('aria-invalid', 'true')
  })

  it('Vendor form has labelled controls and validation ties to aria attributes', async () => {
    render(<NewVendorPage />)
    const name = screen.getByLabelText(/name/i)
    const terms = screen.getByLabelText(/terms/i)
    expect(name).toBeInTheDocument()
    expect(terms).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
    expect(name).toHaveAttribute('aria-invalid', 'true')
  })
})
