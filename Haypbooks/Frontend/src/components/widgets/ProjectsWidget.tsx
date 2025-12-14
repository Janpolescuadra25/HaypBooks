"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import Amount from '@/components/Amount'

type Project = {
  id: string
  name: string
  client: string
  budget: number
  spent: number
  hoursLogged: number
  profitability: number
  status: 'active' | 'on-hold' | 'completed'
}

type ProjectsSummary = {
  activeCount: number
  totalRevenue: number
  projects: Project[]
}

export default function ProjectsWidget() {
  const [summary, setSummary] = useState<ProjectsSummary>({
    activeCount: 0,
    totalRevenue: 0,
    projects: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        type ProjectsApiResponse = { summary?: ProjectsSummary }
        const data = await api<ProjectsApiResponse>('/api/dashboard/projects')
        setSummary(data?.summary || { activeCount: 0, totalRevenue: 0, projects: [] })
      } catch (err) {
        console.error('Failed to load projects', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="animate-pulse bg-slate-100 rounded h-32" />
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'on-hold':
        return 'bg-amber-100 text-amber-700'
      case 'completed':
        return 'bg-slate-100 text-slate-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="glass-card !shadow-none border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Projects</h3>
        <Link href={'/projects/new' as any} className="btn-primary btn-xs">
          + New project
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-600 mb-1">Active Projects</p>
          <p className="text-2xl font-bold text-slate-900">{summary.activeCount}</p>
        </div>
        
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-700 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-green-900">
            <Amount value={summary.totalRevenue} />
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-slate-500 uppercase">Recent Projects</h4>
        {summary.projects.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No projects</p>
        ) : (
          summary.projects.slice(0, 4).map((project) => (
            <div key={project.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 truncate">{project.name}</h4>
                  <p className="text-xs text-slate-500">{project.client}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-slate-600">
                    <Amount value={project.spent} /> / <Amount value={project.budget} />
                  </p>
                  <p className="text-xs text-slate-500">{project.hoursLogged}h logged</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${project.profitability >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {project.profitability >= 0 ? '+' : ''}{project.profitability}%
                  </p>
                  <p className="text-xs text-slate-500">margin</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200">
        <Link href="/projects" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
          View all projects →
        </Link>
      </div>
    </div>
  )
}
