// ─── Invoice Template Types ────────────────────────────────────────────────

export type LayoutStyle = 'classic' | 'modern' | 'compact' | 'minimal' | 'bold' | 'elegant'
export type BorderStyle = 'solid' | 'dashed' | 'none' | 'double' | 'rounded'
export type LogoPosition = 'top-left' | 'top-center' | 'top-right' | 'none'
export type FontSize = 'small' | 'normal' | 'large'
export type PaymentTerms = 'due-on-receipt' | 'net-15' | 'net-30' | 'net-45' | 'net-60' | 'eom' | 'custom'
export type TaxTreatment = 'inclusive' | 'exclusive' | 'none'
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MMM DD, YYYY'

export interface TemplateColors {
  primary: string
  accent: string
  background: string
  text: string
}

export interface TemplateTypography {
  headingFont: string
  bodyFont: string
  fontSize: FontSize
}

export interface TemplateSections {
  companyLogo: boolean
  customerAddress: boolean
  shippingAddress: boolean
  paymentTermsText: boolean
  notesField: boolean
  bankDetails: boolean
  thankYouMessage: boolean
  termsAndConditions: boolean
  footerNotes: boolean
  qrCode: boolean
}

export interface TemplateDefaults {
  paymentTerms: PaymentTerms
  customPaymentDays?: number
  taxTreatment: TaxTreatment
  defaultTaxRate: number
  currency: string
  language: string
  decimalPlaces: number
  dateFormat: DateFormat
}

export interface InvoiceTemplate {
  id: string
  name: string
  description?: string
  icon: string           // emoji icon
  isBuiltIn: boolean
  isDefault: boolean
  isDraft: boolean

  // Visual
  colors: TemplateColors
  typography: TemplateTypography
  layoutStyle: LayoutStyle
  borderStyle: BorderStyle
  logoPosition: LogoPosition

  // Defaults
  defaults: TemplateDefaults
  sections: TemplateSections

  // Custom text
  defaultMessage: string
  defaultTerms?: string
  footerText?: string

  // Metadata
  createdAt: string
  updatedAt: string
  lastUsedAt?: string
  usageCount: number
}

export type TemplateFormData = Omit<InvoiceTemplate, 'id' | 'isBuiltIn' | 'createdAt' | 'updatedAt' | 'usageCount'>
