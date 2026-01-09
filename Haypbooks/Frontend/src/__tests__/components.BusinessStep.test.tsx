import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import BusinessStepComponent from '../components/Onboarding/BusinessStep'

describe('BusinessStepComponent', () => {
  it('exposes current data via ref.getData()', () => {
    const onSave = jest.fn()
    const ref: any = React.createRef()
    render(<BusinessStepComponent ref={ref} onSave={onSave} />)
    const input = screen.getByPlaceholderText(/e.g. Technology, Retail, Manufacturing/i)
    fireEvent.change(input, { target: { value: 'Technology' } })
    expect(ref.current).toBeTruthy()
    expect(typeof ref.current.getData).toBe('function')
    expect(ref.current.getData()).toEqual(expect.objectContaining({ industry: 'Technology' }))
  })

  it('returns defaults when no changes made', () => {
    const ref: any = React.createRef()
    render(<BusinessStepComponent ref={ref} />)
    expect(ref.current.getData()).toEqual(expect.objectContaining({ companyName: '', industry: '' }))
  })
})