import React from 'react'
import { render } from '@testing-library/react'
import { ToastProvider } from '@/components/ToastProvider'

// Minimal router substitute for tests (avoid adding react-router dependency)
const NoopRouter = ({ children }: { children: React.ReactNode }) => children as React.ReactElement

// Custom render to include providers commonly required by pages
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    ToastProvider,
    null,
    React.createElement(NoopRouter, null, children)
  )
}

const customRender = (ui: React.ReactElement, options = {}) => render(ui, { wrapper: AllProviders as any, ...options })

// re-export everything
export * from '@testing-library/react'
export { customRender as render }

// helper to mock window.location.replace in tests
export function mockReplace() {
  const replaceMock = jest.fn()
  const orig = window.location
  // @ts-ignore
  delete (window as any).location
  ;(window as any).location = { ...orig, replace: replaceMock }
  return () => { (window as any).location = orig }
}
