'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Search, Users } from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { formatMMDDYYYY } from '@/lib/date'

interface PayrollEmployee {
  id: string
  firstName: string
  lastName: string
  employeeNumber?: string | null
  hireDate?: string | null
  terminationDate?: string | null
  payType?: string | null
}

function getStatus(employee: PayrollEmployee) {
  return employee.terminationDate ? 'Inactive' : 'Active'
}

export default function Page() {
  const { companyId, loading: companyLoading, error: companyError } = useCompanyId()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [employees, setEmployees] = useState<PayrollEmployee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId) return
    const controller = new AbortController()
    const params = new URLSearchParams()
    if (query.trim()) params.set('search', query.trim())

    setLoading(true)
    setError(null)

    fetch(`/api/companies/${companyId}/payroll/employees?${params.toString()}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load employees: ${res.status}`)
        }
        const data = await res.json()
        if (!Array.isArray(data)) {
          throw new Error('Unexpected response format')
        }
        setEmployees(data)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Unable to load employee list.')
          setEmployees([])
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [companyId, query])

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      if (statusFilter === 'All') return true
      return getStatus(employee) === statusFilter
    })
  }, [employees, statusFilter])

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setQuery(search)
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">Payroll Workforce</p>
          <h1 className="text-3xl font-semibold text-gray-900">Employees</h1>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl">
            Track active and inactive payroll employees for the selected company.
            Use search to find an employee by name, ID, or number.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <Users size={16} /> Live payroll data
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <label htmlFor="employee-search" className="sr-only">Search employees</label>
          <div className="relative w-full">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="employee-search"
              type="search"
              placeholder="Search by name or employee ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>
          <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Search
          </button>
        </form>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm">
          <span className="font-medium">Status</span>
          <select
            aria-label="Employee status filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'All' | 'Active' | 'Inactive')}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {companyError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">
          {companyError}
        </div>
      )}

      {loading || companyLoading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-sm text-gray-500">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Name</th>
                  <th className="px-5 py-4 font-medium">Employee ID</th>
                  <th className="px-5 py-4 font-medium">Email</th>
                  <th className="px-5 py-4 font-medium">Department</th>
                  <th className="px-5 py-4 font-medium">Position</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Hire Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">
                      No employees found. Try a different search or clear the filters.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">{`${employee.firstName} ${employee.lastName}`}</div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{employee.employeeNumber ?? employee.id}</td>
                      <td className="px-5 py-4 text-gray-600">—</td>
                      <td className="px-5 py-4 text-gray-600">—</td>
                      <td className="px-5 py-4 text-gray-600">{employee.payType ?? 'Unknown'}</td>
                      <td className="px-5 py-4 text-gray-600">{getStatus(employee)}</td>
                      <td className="px-5 py-4 text-gray-600">{employee.hireDate ? formatMMDDYYYY(employee.hireDate) : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
