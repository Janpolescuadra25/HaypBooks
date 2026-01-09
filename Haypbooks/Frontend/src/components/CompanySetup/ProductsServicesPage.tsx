import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

export type CompanyFeatures = {
  sellProducts: boolean
  trackInventory: boolean
  sellServices: boolean
  enableInvoicing: boolean
  enableSalesReceipts: boolean
  enableEstimates: boolean
  defaultPaymentTerms: string
  invoiceTemplate: string
  trackVendorBills: boolean
  usePurchaseOrders: boolean
  preferredPaymentMethods: string[]
  defaultDepositAccount: string
  runPayroll: boolean
  totalEmployees?: number
  payrollSchedule?: string
}

const STORAGE_KEY = 'company_features'

const defaultFeatures: CompanyFeatures = {
  sellProducts: false,
  trackInventory: false,
  sellServices: true,
  enableInvoicing: true,
  enableSalesReceipts: true,
  enableEstimates: false,
  defaultPaymentTerms: 'Due on Receipt',
  invoiceTemplate: 'Modern',
  trackVendorBills: true,
  usePurchaseOrders: false,
  preferredPaymentMethods: ['Cash', 'Bank Transfer', 'Credit/Debit Card'],
  defaultDepositAccount: 'Checking Account',
  runPayroll: false,
  totalEmployees: 0,
  payrollSchedule: 'Monthly',
}

const readFromStorage = (): CompanyFeatures => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultFeatures
    const parsed = JSON.parse(raw)
    return { ...defaultFeatures, ...parsed }
  } catch (e) {
    return defaultFeatures
  }
}

const writeToStorage = (data: CompanyFeatures) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    // ignore
  }
}

type Props = { initial?: Partial<CompanyFeatures> }

const ProductsServicesPage = forwardRef((props: Props, ref: any) => {
  const { initial } = props
  const [features, setFeatures] = useState<CompanyFeatures>(() => ({ ...readFromStorage(), ...initial }))

  useEffect(() => {
    writeToStorage(features)
  }, [features])

  useImperativeHandle(ref, () => ({
    getData: () => features,
    setData: (payload: Partial<CompanyFeatures>) => setFeatures((s) => ({ ...s, ...payload })),
  }))

  const togglePaymentMethod = (method: string) => {
    setFeatures((prev) => {
      const set = new Set(prev.preferredPaymentMethods)
      if (set.has(method)) set.delete(method)
      else set.add(method)
      return { ...prev, preferredPaymentMethods: Array.from(set) }
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">What do you sell?</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Sell Products</h3>
              <p className="text-sm text-slate-500">Your business sells physical products — items you keep in stock, deliver to customers, or offer in bulk.</p>
            </div>

            <div>
              <label className="inline-flex items-center gap-2 focus-within:ring-2 focus-within:ring-emerald-300 rounded-full">
                <input
                  type="checkbox"
                  className="sr-only"
                  role="switch"
                  aria-checked={features.sellProducts}
                  checked={features.sellProducts}
                  onChange={(e) => setFeatures({ ...features, sellProducts: e.target.checked, trackInventory: e.target.checked ? features.trackInventory : false })}
                  aria-label="Sell Products"
                />
                <span className={`w-11 h-6 rounded-full inline-flex items-center p-0.5 transition-colors duration-200 ${features.sellProducts ? 'bg-emerald-600' : 'bg-slate-200'}`} aria-hidden>
                  <span className={`w-5 h-5 bg-white rounded-full shadow ${features.sellProducts ? 'ml-auto shadow-md' : 'ml-0 shadow-sm'} transform transition-all duration-200 ease-in-out active:scale-95`} />
                </span>
              </label>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={features.trackInventory} onChange={(e) => setFeatures({ ...features, trackInventory: e.target.checked })} disabled={!features.sellProducts} aria-label="Track Inventory Quantity" />
              <span className={`text-slate-500 ${!features.sellProducts ? 'opacity-60' : ''}`}>Track Inventory Quantity</span>
            </label>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Sell Services</h3>
              <p className="text-sm text-slate-500">Your business provides services — work based on your time, skills, or expertise.</p>
            </div>

            <div>
              <label className="inline-flex items-center gap-2 focus-within:ring-2 focus-within:ring-emerald-300 rounded-full">
                <input
                  type="checkbox"
                  className="sr-only"
                  role="switch"
                  aria-checked={features.sellServices}
                  checked={features.sellServices}
                  onChange={(e) => setFeatures({ ...features, sellServices: e.target.checked })}
                  aria-label="Sell Services"
                />
                <span className={`w-11 h-6 rounded-full inline-flex items-center p-0.5 transition-colors duration-200 ${features.sellServices ? 'bg-emerald-600' : 'bg-slate-200'}`} aria-hidden>
                  <span className={`w-5 h-5 bg-white rounded-full shadow ${features.sellServices ? 'ml-auto shadow-md' : 'ml-0 shadow-sm'} transform transition-all duration-200 ease-in-out active:scale-95`} />
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Removed Sales & Invoicing, Purchases, Payments, and Payroll sections per user request */}
    </div>
  )
})

export default ProductsServicesPage
