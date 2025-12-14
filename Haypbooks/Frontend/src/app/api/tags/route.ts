import { NextResponse } from 'next/server'

// Deterministic tag catalog for filter UIs.
// Mirrors the basic shape used by the mock layer so client components can fetch /api/tags
// even when the in-process mock API is disabled.
export async function GET() {
  const tags = [
    { id: 't:project:alpha', name: 'Alpha', group: 'Project' },
    { id: 't:project:beta', name: 'Beta', group: 'Project' },
    { id: 't:region:west', name: 'West', group: 'Region' },
    { id: 't:region:east', name: 'East', group: 'Region' },
    { id: 't:channel:direct', name: 'Direct', group: 'Channel' },
    { id: 't:channel:partner', name: 'Partner', group: 'Channel' },
  ]
  const groups = Array.from(new Set(tags.map(t => t.group || 'Ungrouped')))
  return NextResponse.json({ tags, groups }, { headers: { 'Cache-Control': 'no-store' } })
}
