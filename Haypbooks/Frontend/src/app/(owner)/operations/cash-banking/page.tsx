import { redirect } from 'next/navigation'

export default function CashBankingPage() {
  redirect('/operations/cash-banking/transactions/bank-transactions')
}
