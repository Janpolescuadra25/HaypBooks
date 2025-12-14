/** @jest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import NewCustomerPage from '@/app/customers/new/page'
import NewVendorPage from '@/app/vendors/new/page'

// Minimal router mock
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }), useSearchParams: () => new URLSearchParams('') }))

describe('Customer/Vendor new form validations', () => {
  test('Customer rejects empty name and invalid email/phone', async () => {
    render(<NewCustomerPage />)
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()

    // Fill invalid email
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Acme' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText(/email is invalid/i)).toBeInTheDocument()

    // Invalid phone
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ok@example.com' } })
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: 'xx' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText(/phone looks invalid/i)).toBeInTheDocument()
  })

  test('Vendor rejects empty/long name and invalid terms', async () => {
    render(<NewVendorPage />)
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()

    // Long name
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'x'.repeat(101) } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByText(/too long/i)).toBeInTheDocument()

    // Invalid terms by setting select to custom value via DOM
    const select = screen.getByLabelText(/terms/i) as HTMLSelectElement
    // Append a bogus option and select it
    const opt = document.createElement('option')
    opt.value = 'Bogus'
    opt.text = 'Bogus'
    select.appendChild(opt)
    fireEvent.change(select, { target: { value: 'Bogus' } })

    // Provide a valid name then attempt save
  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Valid Vendor' } })
  fireEvent.click(screen.getByRole('button', { name: /save/i }))
  expect(await screen.findByText(/terms selection is invalid|invalid enum value/i)).toBeInTheDocument()
  })
})
