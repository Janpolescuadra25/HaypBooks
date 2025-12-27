import { render, screen } from '@testing-library/react'
import HubSelectionPage from '@/app/hub/selection/page'
import * as profile from '@/lib/profile-cache'

jest.mock('@/lib/profile-cache', () => ({ getProfileCached: jest.fn() }))

describe('HubSelectionPage', () => {
  it('renders two hub cards and headings', async () => {
    ;(profile.getProfileCached as jest.Mock).mockResolvedValue({ name: 'Alex', companies: ['A','B','C'], practiceName: 'Rivera CPA', clients: [1,2,3] })
    render(<HubSelectionPage />)
    expect(await screen.findByText(/Choose how.*HaypBooks today/)).toBeInTheDocument()
    expect(screen.getByText(/My Companies/)).toBeInTheDocument()
    expect(screen.getByText(/My Practice/)).toBeInTheDocument()
  })
})