export type CompanyInfo = {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address: { street?: string; city?: string; state?: string; zip?: string };
  publicAddressSame: boolean;
  logoUrl?: string;
};

export type InvoiceLayout = {
  logoUrl?: string;
  useCustomInvoiceLogo?: boolean;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  templateStyle: 'modern' | 'classic' | 'compact' | 'minimal';
  logoPlacement?: 'left' | 'center' | 'right';
  logoSize?: 'sm' | 'md' | 'lg';
  showSKU: boolean;
  showSKUEditor?: boolean;
  showSKUCustomer?: boolean;
  showServiceDate: boolean;
  showServiceDateEditor?: boolean;
  showServiceDateCustomer?: boolean;
  showDiscount: boolean;
  // Per-view visibility flags: editor (New Invoice form) and customer (invoice preview / sent invoice)
  showDiscountEditor?: boolean;
  showDiscountCustomer?: boolean;
  applyDiscountAfterTax: boolean;
  showDeposit: boolean;
  showShippingAddress: boolean;
  showShippingAddressEditor?: boolean;
  showShippingAddressCustomer?: boolean;
  // Visibility of the shipping / other amount line in editor & customer views
  showShippingEditor?: boolean;
  showShippingCustomer?: boolean;
  showInvoiceNumber: boolean;
  showInvoiceNumberEditor?: boolean;
  showInvoiceNumberCustomer?: boolean;
  showInvoiceDate: boolean;
  showInvoiceDateEditor?: boolean;
  showInvoiceDateCustomer?: boolean;
  showDueDate: boolean;
  showDueDateEditor?: boolean;
  showDueDateCustomer?: boolean;
  showTerms: boolean;
  showTermsEditor?: boolean;
  showTermsCustomer?: boolean;
  showTags: boolean;
  showTagsEditor?: boolean;
  showTagsCustomer?: boolean;
  paymentMethods?: { card: boolean; bankTransfer: boolean; paypal: boolean };
  footerMarkdown?: string;
  terms?: string;
  emailSubjectTemplate: string;
  emailBodyTemplate: string;
  // Print and preview options
  printPageSize?: 'Letter' | 'A4';
  printMarginTop?: number; // mm
  printMarginRight?: number; // mm
  printMarginBottom?: number; // mm
  printMarginLeft?: number; // mm
  showTaxSummary?: boolean;
  showTaxSummaryEditor?: boolean;
  showTaxSummaryCustomer?: boolean;
  pageBreakAvoidItems?: boolean;
  wrapDescriptions?: boolean;
};

export const DEFAULT_LAYOUT: InvoiceLayout = {
  primaryColor: '#1463ff',
  accentColor: '#1f2937',
  fontFamily: 'Inter',
  templateStyle: 'modern',
  useCustomInvoiceLogo: false,
  showSKU: false,
  showSKUEditor: false,
  showSKUCustomer: false,
  showServiceDate: false,
  showServiceDateEditor: true,
  showServiceDateCustomer: false,
  showDiscount: true,
  showDiscountEditor: true,
  showDiscountCustomer: true,
  applyDiscountAfterTax: false,
  logoPlacement: 'left',
  logoSize: 'md',
  showDeposit: true,
  showShippingAddress: false,
  showShippingAddressEditor: true,
  showShippingAddressCustomer: false,
  showShippingEditor: true,
  showShippingCustomer: true,
  showInvoiceNumber: true,
  showInvoiceNumberEditor: true,
  showInvoiceNumberCustomer: true,
  showInvoiceDate: true,
  showInvoiceDateEditor: true,
  showInvoiceDateCustomer: true,
  showDueDate: true,
  showDueDateEditor: true,
  showDueDateCustomer: true,
  showTerms: true,
  showTermsEditor: true,
  showTermsCustomer: true,
  showTags: true,
  showTagsEditor: true,
  showTagsCustomer: false,
  emailSubjectTemplate: 'Invoice {{invoiceNumber}} from {{companyName}}',
  emailBodyTemplate: 'Hi {{customerName}}, your invoice {{invoiceNumber}} totaling {{amountDue}} is due {{dueDate}}. Pay securely: {{payUrl}}',
  printPageSize: 'Letter',
  printMarginTop: 12.7, // 0.5in
  printMarginRight: 12.7,
  printMarginBottom: 12.7,
  printMarginLeft: 12.7,
  showTaxSummary: true,
  showTaxSummaryEditor: true,
  showTaxSummaryCustomer: true,
  pageBreakAvoidItems: true,
  wrapDescriptions: true,
};

export const DEFAULT_COMPANY: CompanyInfo = {
  name: '',
  address: {},
  publicAddressSame: true,
  logoUrl: undefined,
};
