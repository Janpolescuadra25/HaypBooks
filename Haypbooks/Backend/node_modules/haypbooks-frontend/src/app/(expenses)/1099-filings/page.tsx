import Link from 'next/link'

export default function Filings1099Page() {
	return (
		<div className="space-y-4">
			<div className="glass-card">
				<h1 className="text-xl font-semibold text-slate-900">1099 filings</h1>
				<p className="text-slate-600 text-sm">Prepare and review 1099 forms for eligible payees.</p>

				<div className="mt-4 grid gap-3 sm:grid-cols-2">
					<Link href="/reports/1099-contractor-balance-summary-us" className="btn-secondary !justify-start">
						1099 Contractor Balance Summary
					</Link>
					<Link href="/reports/1099-contractor-balance-detail-us" className="btn-secondary !justify-start">
						1099 Contractor Balance Detail
					</Link>
					<Link href="/reports/1099-transaction-detail-us" className="btn-secondary !justify-start">
						1099 Transaction Detail Report
					</Link>
				</div>

				<div className="mt-4 text-slate-700 text-sm">
					Notes:
					<ul className="list-disc ml-5 mt-1 space-y-1">
						<li>Eligibility threshold: $600 YTD nonemployee compensation.</li>
						<li>Taxpayer identification numbers (TIN) are masked in UI/exports.</li>
						<li>Use report action bars to set period, export CSV, and print.</li>
					</ul>
				</div>
			</div>
		</div>
	)
}
