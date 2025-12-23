import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'

const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: mockReplace }) }))

import StoryHero from '@/components/landing/StoryHero'

describe('StoryHero CTA', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    localStorage.clear()
    // Make requestIdleCallback synchronous so state updates happen deterministically inside the test
    ;(window as any).requestIdleCallback = (cb: any) => { try { cb() } catch (e) {} ; return 0 }
    const mockObserver = { observe: () => {}, disconnect: () => {}, unobserve: () => {} }
    ;(window as any).IntersectionObserver = jest.fn((cb: any) => {
      // Call the callback synchronously so updates occur inside act-wrapped render
      try { cb([{ isIntersecting: true, target: {} }]) } catch (e) {}
      return mockObserver as any
    })
  
  })

  it('navigates to /signup?showSignup=1&role=business and sets hasSeenIntro when Start Your Journey Free is clicked', async () => {
    const user = userEvent.setup()

    render(<StoryHero />)

    // Wait for the CTA button to appear (handles render timing reliably)
    const button = await screen.findByRole('button', { name: /Start Your Journey Free/i })

    await user.click(button)

    // Wait for side-effects (requestIdleCallback scheduled work) to complete
    await waitFor(() => expect(localStorage.getItem('hasSeenIntro')).toBe('true'))
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/signup?showSignup=1&role=business'))
  })
})