/** @jest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import NewCustomerPage from '@/app/customers/new/page'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }), useSearchParams: () => new URLSearchParams('name=Gamma') }))

describe('New customer prefill', () => {
  it('prefills the name input from ?name=', () => {
    render(<NewCustomerPage />)
    const name = screen.getByLabelText(/name/i) as HTMLInputElement
    expect(name).toBeInTheDocument()
    expect(name.value).toBe('Gamma')
  })
})
