/** @jest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ReportsCatalog from '@/components/ReportsCatalog'

function setHubPeriod(preset = 'YTD', start?: string, end?: string) {
	localStorage.setItem('reportsHubPeriod', JSON.stringify({ preset, start, end }))
}

describe('ReportsCatalog favorites & recents', () => {
	beforeEach(() => {
		localStorage.clear()
	})

	it('persists favorites and shows them in the Favorites section', () => {
		setHubPeriod('YTD')
		render(<ReportsCatalog />)
		// Favorite first visible tile in Overview
		const starButtons = screen.getAllByRole('button', { name: /favorite|unfavorite/i })
		fireEvent.click(starButtons[0])
		// Re-render to ensure persisted
		render(<ReportsCatalog />)
		expect(screen.getAllByText(/Favorites/i).length).toBeGreaterThan(0)
	})

	it('tracks recents when clicking a report link', () => {
		setHubPeriod('ThisMonth')
		render(<ReportsCatalog />)
		const firstReport = screen.getAllByRole('link').find((a) => /profit and loss/i.test(a.textContent || '')) as HTMLAnchorElement
		fireEvent.click(firstReport)
		// Re-render to show Recent section
		render(<ReportsCatalog />)
		expect(screen.getAllByText(/Recent/i).length).toBeGreaterThan(0)
	})
})
