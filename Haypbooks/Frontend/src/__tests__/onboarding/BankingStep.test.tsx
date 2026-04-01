import React from 'react'
import { render, screen } from '@testing-library/react'
import { BankingStep } from '@/app/onboarding/page'

test('Banking step renders connect, add manually, info bar, accounts list and automated feeds', async () => {
  const data = { accounts: [ { id: 1, name: 'BPI Business Checking', type: 'Checking', last4: '8821', live: true }, { id: 2, name: 'BPI Business Savings', type: 'Savings', last4: '8821', live: true } ] }
  render(<BankingStep data={data} onSave={()=>{}} />)

  // Main pieces
  expect(screen.getByLabelText('Connect Bank Account')).toBeInTheDocument()
  expect(screen.getByLabelText('Add Account Manually')).toBeInTheDocument()
  expect(screen.getByText(/Your data is safe with us/i)).toBeInTheDocument()

  // Accounts rendered
  expect(screen.getByText(/BPI Business Checking/i)).toBeInTheDocument()
  expect(screen.getByText(/BPI Business Savings/i)).toBeInTheDocument()

  // Automated feeds toggle
  expect(screen.getByLabelText(/Automated Feeds/i)).toBeInTheDocument()
})
