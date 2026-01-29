import { render, screen, waitFor } from '@testing-library/react'
import HubSelectionPage from '@/app/hub/selection/page'
import * as profile from '@/lib/profile-cache'

jest.mock('@/lib/profile-cache', () => ({ getProfileCached: jest.fn() }))

describe('HubSelectionPage', () => {
  it('renders consolidated CTA and links to Dashboard', async () => {
    ;(profile.getProfileCached as jest.Mock).mockResolvedValue({ name: 'Alex', companies: ['A','B','C'], practiceName: 'Rivera CPA', clients: [1,2,3] })
    render(<HubSelectionPage />)
    expect(await screen.findByText(/HaypBooks Hubs consolidated/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue to Dashboard/i })).toBeInTheDocument()
  })


})