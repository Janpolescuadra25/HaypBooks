import { render, screen } from '@testing-library/react'
import TopBar from '../components/TopBar'

jest.mock('../hooks/useViewportZoom', () => ({
  __esModule: true,
  default: () => ({ isCompact: false, isWide: true }),
}))

test('TopBar removes rounded corners when wide', () => {
  render(<TopBar companyCount={3} searchValue="" onSearchChange={() => {}} onRegister={() => {}} />)
  const inner = document.querySelector('header div > div')
  expect(inner).toBeTruthy()
  // when wide we still retain rounded corners on the white container
  expect((inner as HTMLElement).className.includes('rounded-3xl')).toBe(true)
})
