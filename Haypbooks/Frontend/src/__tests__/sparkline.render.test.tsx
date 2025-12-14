import React from 'react'
import { render, screen } from '@testing-library/react'
import Sparkline from '../components/Sparkline'

describe('Sparkline', () => {
  it('renders an SVG path with provided values', () => {
    render(<Sparkline values={[0, 5, 10, 5, 0]} ariaLabel="Test sparkline" width={100} height={20} />)
  const svg = screen.getByRole('img', { name: 'Test sparkline' }) as unknown as SVGSVGElement
    expect(svg).toBeInTheDocument()
    const path = svg.querySelector('path') as SVGPathElement
    expect(path).toBeTruthy()
    const d = path.getAttribute('d')
    expect(d).toBeTruthy()
    expect(d!.startsWith('M')).toBe(true)
    expect(d).toContain('L')
  })
})
