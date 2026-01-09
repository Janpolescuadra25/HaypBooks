import React from 'react'
import { render, screen } from '@testing-library/react'
import ProductsServicesPage from '../../components/CompanySetup/ProductsServicesPage'

test('page heading updated to What do you sell?', () => {
  render(<ProductsServicesPage />)
  expect(screen.getByRole('heading', { level: 2, name: /What do you sell\?/i })).toBeInTheDocument()
})