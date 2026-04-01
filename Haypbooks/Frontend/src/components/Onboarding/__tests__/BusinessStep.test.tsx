import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import BusinessStepComponent from '../BusinessStep'

describe('BusinessStepComponent', () => {
  it('exposes getData via ref and includes changes', () => {
    const ref: any = React.createRef()
    render(<BusinessStepComponent ref={ref} />)
    const input = screen.getByPlaceholderText(/e.g. Technology, Retail, Manufacturing/i)
    fireEvent.change(input, { target: { value: 'Retail' } })
    expect(ref.current.getData()).toEqual(expect.objectContaining({ industry: 'Retail' }))
  })

  it('getData contains defaults when nothing changed', () => {
    const ref: any = React.createRef()
    render(<BusinessStepComponent ref={ref} />)
    expect(ref.current.getData()).toEqual(expect.objectContaining({ companyName: '' }))
  })
})
