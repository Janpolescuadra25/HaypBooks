import React from 'react'
import { render, screen } from '@testing-library/react'

import HubLayout from '@/app/hub/layout'

describe('HubLayout', () => {
  it('renders Hub header and children', () => {
    render(<HubLayout><div>hub body</div></HubLayout>)
    expect(screen.getByText('Central Hub')).toBeInTheDocument()
    expect(screen.getByText('hub body')).toBeInTheDocument()
  })
})
