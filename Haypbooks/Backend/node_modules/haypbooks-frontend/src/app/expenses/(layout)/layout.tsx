import type { ReactNode } from 'react'
import ExpensesNav from '@/components/ExpensesNav'

export default function ExpensesSectionLayout({ children }: { children: ReactNode }) {
	return (
		<div className="space-y-2">
			<div className="glass-card print:hidden px-3 md:px-4 py-1.5 md:py-2">
				<ExpensesNav />
			</div>
			{children}
		</div>
	)
}
