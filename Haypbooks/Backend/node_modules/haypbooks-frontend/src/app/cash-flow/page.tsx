import { redirect } from 'next/navigation'

export const metadata = { title: 'Cash Flow' }

export default function CashFlowPage(){
  redirect('/dashboard/cash-flow')
}
