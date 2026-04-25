'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Upload, Trash2, Save, Send } from 'lucide-react'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { formatCurrency } from '@/lib/format'
import AccountSelect from '@/components/accounting/AccountSelect'

interface ExpenseLine {
  id: string
  date: string
  description: string
  amount: string
  accountId: string
  taxRate: string
  receiptName: string
}

interface Account {
  id: string
  code: string
  name: string
  type?: string
  subtype?: string
}

const TAX_RATES = ['None', '0%', '5%', '10%', '15%', '20%']

export default function ExpenseCreatePage() {
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [employeeId, setEmployeeId] = useState('')
  const [employees, setEmployees] = useState<Array<{ id: string; displayName: string }>>([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [showNewEmployee, setShowNewEmployee] = useState(false)
  const [newEmployeeFirstName, setNewEmployeeFirstName] = useState('')
  const [newEmployeeLastName, setNewEmployeeLastName] = useState('')
  const [description, setDescription] = useState('')
  const [reimbursable, setReimbursable] = useState(false)
  const [paymentAccountId, setPaymentAccountId] = useState('')
  const [paymentAccounts, setPaymentAccounts] = useState<Account[]>([])
  const [coaAccounts, setCoaAccounts] = useState<Account[]>([])
  const [lines, setLines] = useState<ExpenseLine[]>([
    {
      id: 'line-1',
      date: new Date().toISOString().slice(0, 10),
      description: '',
      amount: '',
      accountId: '',
      taxRate: 'None',
      receiptName: '',
    },
  ])
  const [attachments, setAttachments] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!companyId) return

    const loadEmployees = async () => {
      try {
        const res = await expensesService.listEmployees(companyId, { limit: 100 })
        const data = res.data ?? []
        setEmployees(
          data.map((employee: any) => ({
            id: employee.id,
            displayName: employee.displayName ?? employee.name ?? employee.id,
          })),
        )
        if (!employeeId && data.length > 0) {
          setEmployeeId(data[0].id)
        }
      } catch {
        setEmployees([])
      }
    }

    const loadAccounts = async () => {
      try {
        const [paymentRes, coaRes] = await Promise.all([
          accountingService.listAccounts(companyId, { type: 'asset', subtype: 'cash' }),
          accountingService.listAccounts(companyId, { includeInactive: false }),
        ])
        setPaymentAccounts(paymentRes.data ?? [])
        setCoaAccounts(
          (coaRes.data ?? []).filter(
            (account: any) =>
              !account.type ||
              account.type.toLowerCase() === 'expense' ||
              account.type.toLowerCase() === 'cost',
          ),
        )
      } catch {
        setPaymentAccounts([])
        setCoaAccounts([])
      }
    }

    loadEmployees()
    loadAccounts()
  }, [companyId, employeeId])

  const selectedEmployee = employees.find((employee) => employee.id === employeeId)

  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase()
    if (!q) return employees
    return employees.filter(
      (employee) =>
        employee.displayName.toLowerCase().includes(q) || employee.id.toLowerCase().includes(q),
    )
  }, [employees, employeeSearch])

  const totalAmount = useMemo(
    () => lines.reduce((sum, line) => sum + Number(line.amount || 0), 0),
    [lines],
  )

  const handleLineChange = (id: string, field: keyof ExpenseLine, value: string) => {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, [field]: value } : line)))
  }

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}-${prev.length}`,
        date: new Date().toISOString().slice(0, 10),
        description: '',
        amount: '',
        accountId: '',
        taxRate: 'None',
        receiptName: '',
      },
    ])
  }

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id))
  }

  const handleReceiptChange = (id: string, file?: File) => {
    if (!file) return
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, receiptName: file.name } : line)))
  }

  const handleAttachments = (files: FileList | null) => {
    if (!files) return
    setAttachments((prev) => [...prev, ...Array.from(files)])
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    handleAttachments(event.dataTransfer.files)
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index))
  }

  const createReport = async (status: 'DRAFT' | 'PENDING') => {
    if (!companyId) return null
    if (!employeeId) {
      setError('Select a payee or employee.')
      return null
    }
    if (!reimbursable && !paymentAccountId) {
      setError('Select a payment account for company-paid expenses.')
      return null
    }
    if (!lines.length || lines.every((line) => !line.description.trim())) {
      setError('Add at least one expense line.')
      return null
    }

    const payload: any = {
      employeeId,
      reimbursable,
      paymentAccountId: reimbursable ? null : paymentAccountId || null,
      description: description || null,
      lines: lines.map((line) => ({
        date: line.date,
        description: line.description,
        amount: Number(line.amount || 0),
        accountId: line.accountId || null,
        taxRate: line.taxRate !== 'None' ? Number(line.taxRate.replace('%', '')) : null,
        receiptUrl: line.receiptName || null,
      })),
      attachments: attachments.map((file) => file.name),
    }

    setSaving(true)
    setError('')
    try {
      const response = await expensesService.createExpenseReport(companyId, payload)
      if (!response?.data?.id) {
        setError('Failed to create expense report')
        return null
      }
      if (status === 'PENDING') {
        await expensesService.submitExpenseReport(companyId, response.data.id)
      }
      return response.data
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to save expense report')
      return null
    } finally {
      setSaving(false)
    }
  }

  const handleSaveDraft = async () => {
    const result = await createReport('DRAFT')
    if (result) {
      setSuccess('Expense saved as draft.')
    }
  }

  const handleSubmitForApproval = async () => {
    const result = await createReport('PENDING')
    if (result) {
      setSuccess('Expense submitted for approval.')
    }
  }

  const createEmployee = async () => {
    if (!companyId) return
    if (!newEmployeeFirstName.trim() || !newEmployeeLastName.trim()) {
      setError('First name and last name are required to add a new employee.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const response = await expensesService.createEmployee(companyId, {
        firstName: newEmployeeFirstName.trim(),
        lastName: newEmployeeLastName.trim(),
        hireDate: new Date().toISOString().slice(0, 10),
      })
      const employee = response.data
      if (employee?.id) {
        const displayName = employee.displayName ?? `${employee.firstName} ${employee.lastName}`
        const next = { id: employee.id, displayName }
        setEmployees((prev) => [next, ...prev])
        setEmployeeId(employee.id)
        setShowNewEmployee(false)
        setNewEmployeeFirstName('')
        setNewEmployeeLastName('')
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to add employee')
    } finally {
      setSaving(false)
    }
  }

  const attachmentDropClasses = dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-dashed border-slate-300 bg-white';
  const feedbackClasses = error ? 'rounded-2xl p-4 text-sm bg-rose-50 text-rose-700' : 'rounded-2xl p-4 text-sm bg-emerald-50 text-emerald-700';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-gray-700">
            <Link href="/expenses/employee-expenses/expenses" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-700 transition-colors">
              <ArrowLeft size={16} /> Back to Expenses
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              <Save size={16} /> Save Draft
            </button>
            <button
              type="button"
              onClick={handleSubmitForApproval}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Send size={16} /> Submit for Approval
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">New Expense</h1>
              <p className="mt-1 text-sm text-slate-500">Complete the expense form to create a new report.</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={reimbursable}
                  onChange={(e) => setReimbursable(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700">Reimbursable</span>
              </label>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Payee / Employee</h2>
              <p className="mt-1 text-sm text-slate-500">Search and select the employee responsible for this expense.</p>
              <div className="mt-4 grid gap-3">
                <div className="grid gap-2">
                  <input
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    placeholder="Search employees"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewEmployee((prev) => !prev)}
                    className="inline-flex items-center gap-2 justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <Plus size={16} /> Add New Employee
                  </button>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 max-h-52 overflow-y-auto">
                  {filteredEmployees.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-slate-500">No employees found.</div>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <button
                        key={employee.id}
                        type="button"
                        onClick={() => setEmployeeId(employee.id)}
                        className={`w-full text-left rounded-2xl px-3 py-2 text-sm ${employee.id === employeeId ? 'bg-emerald-100 text-emerald-900' : 'text-slate-800 hover:bg-slate-100'}`}
                      >
                        {employee.displayName}
                      </button>
                    ))
                  )}
                </div>
                {selectedEmployee && (
                  <p className="text-sm text-slate-500">Selected: <span className="font-semibold text-slate-800">{selectedEmployee.displayName}</span></p>
                )}
              </div>
            </div>

            {!reimbursable && (
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Payment Account</h2>
                <p className="mt-1 text-sm text-slate-500">Choose the account used to pay this company expense.</p>
                <div className="mt-4">
                  <AccountSelect
                    value={paymentAccountId}
                    accounts={paymentAccounts}
                    onChange={setPaymentAccountId}
                    disabled={paymentAccounts.length === 0}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Line Items</h2>
              <p className="text-sm text-slate-500">Add each expense line in the table below.</p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-slate-700">#</th>
                  <th className="px-4 py-3 text-slate-700">Description</th>
                  <th className="px-4 py-3 text-slate-700">Expense Account</th>
                  <th className="px-4 py-3 text-slate-700">Amount</th>
                  <th className="px-4 py-3 text-slate-700">Tax</th>
                  <th className="px-4 py-3 text-slate-700">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={line.id} className="border-b border-slate-200 bg-white hover:bg-slate-50">
                    <td className="px-4 py-3 align-top text-slate-700">{index + 1}</td>
                    <td className="px-4 py-3 align-top">
                      <input
                        value={line.description}
                        onChange={(e) => handleLineChange(line.id, 'description', e.target.value)}
                        placeholder="Expense description"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <AccountSelect
                        value={line.accountId}
                        accounts={coaAccounts}
                        onChange={(value) => handleLineChange(line.id, 'accountId', value)}
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.amount}
                        onChange={(e) => handleLineChange(line.id, 'amount', e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <select
                        aria-label="Tax rate"
                        value={line.taxRate}
                        onChange={(e) => handleLineChange(line.id, 'taxRate', e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                      >
                        {TAX_RATES.map((rate) => (
                          <option key={rate} value={rate}>{rate}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                          <Upload size={16} />
                          <span>{line.receiptName || 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleReceiptChange(line.id, e.target.files?.[0] ?? undefined)}
                            className="hidden"
                          />
                        </label>
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLine(line.id)}
                            className="self-start rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addLine}
            className="mt-4 w-full rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          >
            <Plus size={16} /> Add line
          </button>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Totals</h2>
              <p className="text-sm text-slate-500">Review the total before you save or submit.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(totalAmount, currency)}</div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Attachments</h2>
              <p className="text-sm text-slate-500">Add any supporting documents for this expense report.</p>
            </div>
          </div>
          <div
            onDragOver={(event) => { event.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`mt-4 rounded-2xl border-2 p-6 text-center transition-all ${attachmentDropClasses}`}
          >
            <p className="text-sm text-slate-500">Drag files here to attach receipts, or click to browse.</p>
            <input
              type="file"
              multiple
              id="expense-attachments-input"
              onChange={(e) => handleAttachments(e.target.files)}
              className="hidden"
            />
            <label htmlFor="expense-attachments-input" className="mt-3 inline-flex cursor-pointer rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Browse files
            </label>
          </div>
          {attachments.length > 0 && (
            <div className="mt-4 grid gap-3">
              {attachments.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    aria-label="Remove attachment"
                    className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {(error || success) && (
          <div className={feedbackClasses}>
            {error || success}
          </div>
        )}
      </div>
    </div>
  )
}
