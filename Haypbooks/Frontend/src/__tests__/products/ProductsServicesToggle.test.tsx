import React from 'react'
import { render, screen, act } from '@testing-library/react'
import ProductsServicesPage from '../../components/CompanySetup/ProductsServicesPage'

test('toggles are switches and update aria-checked', () => {
  render(<ProductsServicesPage />)

  const sellProducts = screen.getByRole('switch', { name: /Sell Products/i }) as HTMLInputElement
  const sellServices = screen.getByRole('switch', { name: /Sell Services/i }) as HTMLInputElement

  expect(sellProducts.getAttribute('aria-checked')).toBe('false')
  expect(sellServices.getAttribute('aria-checked')).toBe('true')

  act(() => { sellProducts.click() })
  expect(sellProducts.getAttribute('aria-checked')).toBe('true')

  act(() => { sellServices.click() })
  expect(sellServices.getAttribute('aria-checked')).toBe('false')
})