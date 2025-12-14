import { render, screen } from '@testing-library/react'
import React from 'react'
import Page from '@/app/help/bank-imports/page'

describe('Help: Bank imports page', () => {
  test('renders supported formats and back link', () => {
    render(<Page />)
    expect(screen.getByRole('heading', { name: /Import bank statements/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Supported formats/i })).toBeInTheDocument()
    expect(screen.getAllByText(/CSV/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/OFX/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/QIF/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /Back to Bank Transactions/i })).toBeInTheDocument()
  })
})
