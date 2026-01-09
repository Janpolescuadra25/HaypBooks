import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EntityCard from '../../components/cards/EntityCard'

test('footer "Open Dashboard" button calls onLaunch', async () => {
  const onLaunch = jest.fn()
  render(<EntityCard id="c1" name="ACME" subtitle="Free" members={3} onLaunch={onLaunch} />)

  const btn = screen.getByRole('button', { name: /open dashboard/i })
  await userEvent.click(btn)
  expect(onLaunch).toHaveBeenCalledTimes(1)
})

test('pressing Enter on the card activates onLaunch', async () => {
  const onLaunch = jest.fn()
  render(<EntityCard id="c2" name="Beta Co" subtitle="Pro" onLaunch={onLaunch} />)

  const card = screen.getByRole('button', { name: /open beta co dashboard/i })
  card.focus()
  await userEvent.keyboard('{Enter}')
  expect(onLaunch).toHaveBeenCalledTimes(1)
})
