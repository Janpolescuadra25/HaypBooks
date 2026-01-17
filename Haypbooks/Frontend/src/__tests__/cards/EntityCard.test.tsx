import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EntityCard from '../../components/cards/EntityCard'

test('footer "Open Books" button calls onLaunch', async () => {
  const onLaunch = jest.fn()
  render(<EntityCard id="c1" name="ACME" subtitle="Free" members={3} onLaunch={onLaunch} />)

  const btn = screen.getByRole('button', { name: /open books/i })
  await userEvent.click(btn)
  expect(onLaunch).toHaveBeenCalledTimes(1)
})

test('card is not clickable; Open Books button triggers launch', async () => {
  const onLaunch = jest.fn()
  render(<EntityCard id="c2" name="Beta Co" subtitle="Pro" onLaunch={onLaunch} />)

  // Card should not be exposed as a clickable role=button
  expect(screen.queryByRole('button', { name: /open beta co dashboard/i })).toBeNull()

  const btn = screen.getByRole('button', { name: /open books/i })
  btn.focus()
  await userEvent.keyboard('{Enter}')
  expect(onLaunch).toHaveBeenCalledTimes(1)
})
