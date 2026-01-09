import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import ProductsServicesPage from '../ProductsServicesPage'

describe('ProductsServicesPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders defaults from spec and exposes getData via ref', () => {
    const ref: any = React.createRef()
    render(<ProductsServicesPage ref={ref} />)

    // defaults
    expect(screen.getByLabelText(/Sell Services/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Sell Products/i)).toBeInTheDocument()

    // industry default behavior: Sell Services on, Sell Products off
    expect(ref.current.getData()).toEqual(expect.objectContaining({ sellServices: true, sellProducts: false }))
  })

  it('toggles payment pills and persists to localStorage', () => {
    const ref: any = React.createRef()
    render(<ProductsServicesPage ref={ref} />)

    const bankBtn = screen.getByRole('button', { name: /Bank Transfer/i })
    expect(bankBtn).toBeInTheDocument()

    expect(bankBtn.getAttribute('aria-pressed')).toBe('true') // default selection includes Bank Transfer

    act(() => {
      fireEvent.click(bankBtn)
    })

    // check that the selection toggled off
    let data = ref.current.getData()
    expect(data.preferredPaymentMethods).not.toContain('Bank Transfer')

    // click again to enable
    act(() => {
      fireEvent.click(bankBtn)
    })

    data = ref.current.getData()
    expect(data.preferredPaymentMethods).toContain('Bank Transfer')

    // ensure localStorage was written
    const raw = localStorage.getItem('company_features')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw as string)
    expect(parsed.preferredPaymentMethods).toContain('Bank Transfer')
  })

  it('renders feature cards and headings', () => {
    render(<ProductsServicesPage />)
    expect(screen.getByRole('heading', { name: /Sell Products/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Sell Services/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Sales & Invoicing/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Payments & Cash Collection/i })).toBeInTheDocument()
  })

  it('disables Track Inventory when Sell Products is off and preserves when turned on', () => {
    const ref: any = React.createRef()
    render(<ProductsServicesPage ref={ref} />)

    // initially sellProducts is false and trackInventory should be disabled
    const sellProductsCheckbox = screen.getByLabelText(/Sell Products/i) as HTMLInputElement
    expect(sellProductsCheckbox.checked).toBe(false)

    // the Track Inventory label exists and checkbox is disabled
    const trackInventoryLabel = screen.getByText(/Track Inventory Quantity/i)
    expect(trackInventoryLabel).toBeInTheDocument()
    // find the checkbox by role: it's the first checkbox after Sell Products; query by label text isn't an input, so use getByLabelText via aria-label is not set; locate via querySelector
    const trackInventory = document.querySelector('input[type="checkbox"][disabled]') as HTMLInputElement
    expect(trackInventory).toBeTruthy()

    // turn sell products on
    act(() => {
      sellProductsCheckbox.click()
    })

    // now trackInventory should be enabled
    const enabledTrack = document.querySelector('input[type="checkbox"]:not([disabled])') as HTMLInputElement
    expect(enabledTrack).toBeTruthy()

    // toggle trackInventory on and verify getData includes it
    act(() => {
      enabledTrack.click()
    })
    expect(ref.current.getData().trackInventory).toBe(true)

    // turning Sell Products off resets trackInventory to false
    act(() => {
      sellProductsCheckbox.click()
    })
    expect(ref.current.getData().trackInventory).toBe(false)
  })

  it('switch inputs are accessible and update aria-checked', () => {
    const ref: any = React.createRef()
    render(<ProductsServicesPage ref={ref} />)

    const sellProductsSwitch = screen.getByRole('switch', { name: /Sell Products/i }) as HTMLInputElement
    const sellServicesSwitch = screen.getByRole('switch', { name: /Sell Services/i }) as HTMLInputElement

    // initial states
    expect(sellProductsSwitch.getAttribute('aria-checked')).toBe('false')
    expect(sellServicesSwitch.getAttribute('aria-checked')).toBe('true')

    // toggle Sell Products on
    act(() => {
      sellProductsSwitch.click()
    })
    expect(sellProductsSwitch.getAttribute('aria-checked')).toBe('true')

    // toggle Sell Services off
    act(() => {
      sellServicesSwitch.click()
    })
    expect(sellServicesSwitch.getAttribute('aria-checked')).toBe('false')
  })

  it('payment pill buttons are keyboard accessible and toggle on Enter/Space', () => {
    const ref: any = React.createRef()
    render(<ProductsServicesPage ref={ref} />)

    const bankBtn = screen.getByRole('button', { name: /Bank Transfer/i })
    bankBtn.focus()
    expect(document.activeElement).toBe(bankBtn)

    // Press Space to toggle off
    act(() => {
      fireEvent.keyDown(bankBtn, { key: ' ', code: 'Space' })
    })
    expect(ref.current.getData().preferredPaymentMethods).not.toContain('Bank Transfer')

    // Press Enter to toggle on
    act(() => {
      fireEvent.keyDown(bankBtn, { key: 'Enter', code: 'Enter' })
    })
    expect(ref.current.getData().preferredPaymentMethods).toContain('Bank Transfer')

    // ensure the button has tabindex and focus ring class available
    expect(bankBtn.getAttribute('tabindex')).toBe('0')
    expect(bankBtn.className).toMatch(/focus:ring-2/)
  })

  it('payroll segmented control toggles and shows inputs', () => {
    const ref: any = React.createRef()
    render(<ProductsServicesPage ref={ref} />)

    const yesBtn = screen.getByRole('button', { name: 'YES' })
    const noBtn = screen.getByRole('button', { name: 'NO' })

    // default NO
    expect(noBtn.getAttribute('aria-pressed')).toBe('true')

    act(() => {
      yesBtn.click()
    })
    expect(ref.current.getData().runPayroll).toBe(true)

    act(() => {
      noBtn.click()
    })
    expect(ref.current.getData().runPayroll).toBe(false)
  })

  it('payroll section hides/shows controls and persists total employees', () => {
    const ref: any = React.createRef()
    render(<ProductsServicesPage ref={ref} />)

    // Payroll disabled by default
    expect(screen.getByText(/Total Employees: 0/i)).toBeInTheDocument()

    // enable payroll
    const payrollCheckbox = screen.getByLabelText(/Do you run payroll\?/i) as HTMLInputElement
    act(() => {
      payrollCheckbox.click()
    })

    // now text input should appear
    const totalInput = screen.getByLabelText(/Total Employees/i) as HTMLInputElement
    expect(totalInput.value).toBe('0')

    // change value
    act(() => {
      fireEvent.change(totalInput, { target: { value: '3' } })
    })
    expect(ref.current.getData().totalEmployees).toBe(3)

    // persisted
    const raw = localStorage.getItem('company_features')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw as string)
    expect(parsed.totalEmployees).toBe(3)
  })

  it('select defaults are set correctly', () => {
    const ref: any = React.createRef()
    render(<ProductsServicesPage ref={ref} />)
    expect(ref.current.getData().defaultPaymentTerms).toBe('Due on Receipt')
    expect(ref.current.getData().invoiceTemplate).toBe('Modern')
  })
})
