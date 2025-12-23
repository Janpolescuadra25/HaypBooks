import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import BusinessStepComponent from '../components/Onboarding/BusinessStep'

describe('BusinessStepComponent', () => {
  it('shows validation when company name is empty', () => {
    const onSave = jest.fn()
    render(<BusinessStepComponent onSave={onSave} />)
    const btn = screen.getByRole('button', { name: /save step/i })
    fireEvent.click(btn)
    expect(screen.getByText(/company name is required/i)).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('calls onSave when company name is valid', () => {
    const onSave = jest.fn()
    render(<BusinessStepComponent onSave={onSave} />)
    const input = screen.getByLabelText(/company name/i)
    fireEvent.change(input, { target: { value: 'ACME Co' } })
    const btn = screen.getByRole('button', { name: /save step/i })
    fireEvent.click(btn)
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ companyName: 'ACME Co' }))
  })
})