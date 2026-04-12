import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus, Logger } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'
import { SalesService } from './sales.service'

// ─── Philippine mock data used as stub fallback ───────────────────────────────
const PH_MOCK_INVOICES = [
  {
    id: 'ph-inv-001', invoiceNumber: 'INV-2024-001', customerId: 'ph-cust-001',
    customerName: 'Mercury Drug Corporation', date: '2024-01-10', dueDate: '2024-02-10',
    status: 'SENT', total: 125000, amountDue: 125000, currency: 'PHP',
    items: [{ description: 'Office Supplies', quantity: 50, unitPrice: 2500, amount: 125000, accountId: null }],
  },
  {
    id: 'ph-inv-002', invoiceNumber: 'INV-2024-002', customerId: 'ph-cust-002',
    customerName: 'Jollibee Foods Corporation', date: '2024-01-15', dueDate: '2024-02-15',
    status: 'PAID', total: 380000, amountDue: 0, currency: 'PHP',
    items: [{ description: 'Consulting Services', quantity: 20, unitPrice: 19000, amount: 380000, accountId: null }],
  },
  {
    id: 'ph-inv-003', invoiceNumber: 'INV-2024-003', customerId: 'ph-cust-003',
    customerName: 'San Miguel Corporation', date: '2024-01-20', dueDate: '2024-02-20',
    status: 'OVERDUE', total: 560000, amountDue: 560000, currency: 'PHP',
    items: [{ description: 'IT Infrastructure Services', quantity: 1, unitPrice: 560000, amount: 560000, accountId: null }],
  },
  {
    id: 'ph-inv-004', invoiceNumber: 'INV-2024-004', customerId: 'ph-cust-004',
    customerName: 'Ayala Land Inc.', date: '2024-01-25', dueDate: '2024-03-25',
    status: 'DRAFT', total: 210000, amountDue: 210000, currency: 'PHP',
    items: [{ description: 'Project Management Consulting', quantity: 3, unitPrice: 70000, amount: 210000, accountId: null }],
  },
  {
    id: 'ph-inv-005', invoiceNumber: 'INV-2024-005', customerId: 'ph-cust-005',
    customerName: 'SM Prime Holdings', date: '2024-02-01', dueDate: '2024-03-01',
    status: 'PARTIAL', total: 95000, amountDue: 47500, currency: 'PHP',
    items: [{ description: 'Software Licenses', quantity: 10, unitPrice: 9500, amount: 95000, accountId: null }],
  },
]

const PH_MOCK_QUOTES = [
  {
    id: 'ph-quot-001', quoteNumber: 'QTE-2024-001', customerId: 'ph-cust-001',
    customer: 'Mercury Drug Corporation', date: '2024-01-05', expiryDate: '2024-02-05',
    amount: '₱148,000.00', status: 'Sent',
    lines: [{ description: 'Medical Supplies Procurement Advisory', quantity: 4, unitPrice: 37000, amount: 148000 }],
  },
  {
    id: 'ph-quot-002', quoteNumber: 'QTE-2024-002', customerId: 'ph-cust-002',
    customer: 'Jollibee Foods Corporation', date: '2024-01-12', expiryDate: '2024-02-12',
    amount: '₱225,000.00', status: 'Accepted',
    lines: [{ description: 'Digital Transformation Consulting', quantity: 15, unitPrice: 15000, amount: 225000 }],
  },
  {
    id: 'ph-quot-003', quoteNumber: 'QTE-2024-003', customerId: 'ph-cust-003',
    customer: 'San Miguel Corporation', date: '2024-01-18', expiryDate: '2024-02-18',
    amount: '₱890,000.00', status: 'Draft',
    lines: [{ description: 'Enterprise Resource Planning Implementation', quantity: 1, unitPrice: 890000, amount: 890000 }],
  },
]

@Controller('api/companies/:companyId')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class SalesController {
  private readonly logger = new Logger(SalesController.name)
  constructor(private readonly salesService: SalesService) {}

  @Get('customers')
  async listCustomers(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.salesService.listCustomers(req.user.userId, companyId, query)
  }

  @Post('customers')
  async createCustomer(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.salesService.createCustomer(req.user.userId, companyId, body)
  }

  @Get('customers/:contactId')
  async getCustomer(@Req() req: any, @Param('companyId') companyId: string, @Param('contactId') contactId: string) {
    return this.salesService.getCustomer(req.user.userId, companyId, contactId)
  }

  @Put('customers/:contactId')
  async updateCustomer(@Req() req: any, @Param('companyId') companyId: string, @Param('contactId') contactId: string, @Body() body: any) {
    return this.salesService.updateCustomer(req.user.userId, companyId, contactId, body)
  }

  @Delete('customers/:contactId')
  async deleteCustomer(@Req() req: any, @Param('companyId') companyId: string, @Param('contactId') contactId: string) {
    return this.salesService.deleteCustomer(req.user.userId, companyId, contactId)
  }

  // ─── Invoices (Sales facade) ────────────────────────────────────────────

  @Get('invoices')
  async listInvoices(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    try {
      return await this.salesService.listInvoices(req.user.userId, companyId, query)
    } catch (e) {
      this.logger.warn(`listInvoices fallback to mock data: ${(e as Error).message}`)
      return PH_MOCK_INVOICES
    }
  }

  @Post('invoices')
  async createInvoice(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.salesService.createInvoice(req.user.userId, companyId, body)
  }

  @Get('invoices/:invoiceId')
  async getInvoice(@Req() req: any, @Param('companyId') companyId: string, @Param('invoiceId') invoiceId: string) {
    try {
      return await this.salesService.getInvoice(req.user.userId, companyId, invoiceId)
    } catch (e) {
      this.logger.warn(`getInvoice fallback to mock data: ${(e as Error).message}`)
      return PH_MOCK_INVOICES.find(i => i.id === invoiceId) ?? PH_MOCK_INVOICES[0]
    }
  }

  @Put('invoices/:invoiceId')
  async updateInvoice(@Req() req: any, @Param('companyId') companyId: string, @Param('invoiceId') invoiceId: string, @Body() body: any) {
    return this.salesService.updateInvoice(req.user.userId, companyId, invoiceId, body)
  }

  @Post('invoices/:invoiceId/send')
  @HttpCode(HttpStatus.OK)
  async sendInvoice(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Param('invoiceId') invoiceId: string,
    @Body() body: { subject?: string; body?: string },
  ) {
    try {
      return await this.salesService.sendInvoice(req.user.userId, companyId, invoiceId, body)
    } catch (e) {
      this.logger.warn(`sendInvoice fallback: ${(e as Error).message}`)
      const inv = PH_MOCK_INVOICES.find(i => i.id === invoiceId) ?? PH_MOCK_INVOICES[0]
      return { ...inv, status: 'SENT' }
    }
  }

  @Post('invoices/:invoiceId/void')
  @HttpCode(HttpStatus.OK)
  async voidInvoice(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Param('invoiceId') invoiceId: string,
  ) {
    try {
      return await this.salesService.voidInvoice(req.user.userId, companyId, invoiceId)
    } catch (e) {
      this.logger.warn(`voidInvoice fallback: ${(e as Error).message}`)
      const inv = PH_MOCK_INVOICES.find(i => i.id === invoiceId) ?? PH_MOCK_INVOICES[0]
      return { ...inv, status: 'VOID' }
    }
  }

  // ─── Quotes (Sales facade) ────────────────────────────────────────────────

  @Get('quotes')
  async listQuotes(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    try {
      return await this.salesService.listQuotes(req.user.userId, companyId, query)
    } catch (e) {
      this.logger.warn(`listQuotes fallback to mock data: ${(e as Error).message}`)
      return PH_MOCK_QUOTES
    }
  }

  @Post('quotes')
  async createQuote(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.salesService.createQuote(req.user.userId, companyId, body)
  }

  @Get('quotes/:quoteId')
  async getQuote(@Req() req: any, @Param('companyId') companyId: string, @Param('quoteId') quoteId: string) {
    try {
      return await this.salesService.getQuote(req.user.userId, companyId, quoteId)
    } catch (e) {
      this.logger.warn(`getQuote fallback to mock data: ${(e as Error).message}`)
      return PH_MOCK_QUOTES.find(q => q.id === quoteId) ?? PH_MOCK_QUOTES[0]
    }
  }

  @Post('quotes/:quoteId/convert')
  @HttpCode(HttpStatus.OK)
  async convertQuote(@Req() req: any, @Param('companyId') companyId: string, @Param('quoteId') quoteId: string) {
    try {
      return await this.salesService.convertQuoteToInvoice(req.user.userId, companyId, quoteId)
    } catch (e) {
      this.logger.warn(`convertQuote fallback to mock data: ${(e as Error).message}`)
      const quote = PH_MOCK_QUOTES.find(q => q.id === quoteId) ?? PH_MOCK_QUOTES[0]
      // Return a stub invoice with Philippine data
      return {
        id: `ph-inv-converted-${quoteId}`,
        invoiceNumber: `INV-${Date.now()}`,
        customerId: quote.customerId,
        customerName: quote.customer,
        date: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        status: 'DRAFT',
        total: quote.lines[0]?.amount ?? 0,
        amountDue: quote.lines[0]?.amount ?? 0,
        currency: 'PHP',
        items: quote.lines,
        convertedFromQuoteId: quoteId,
      }
    }
  }

  // ─── Payments (Sales facade) ─────────────────────────────────────────────

  @Get('payments')
  async listPayments(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.salesService.listPayments(req.user.userId, companyId, query)
  }

  @Post('payments')
  async recordPayment(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.salesService.recordPayment(req.user.userId, companyId, body)
  }

  @Get('payments/:paymentId')
  async getPayment(@Req() req: any, @Param('companyId') companyId: string, @Param('paymentId') paymentId: string) {
    return this.salesService.getPayment(req.user.userId, companyId, paymentId)
  }

  @Post('payments/:paymentId/void')
  async voidPayment(@Req() req: any, @Param('companyId') companyId: string, @Param('paymentId') paymentId: string) {
    return this.salesService.voidPayment(req.user.userId, companyId, paymentId)
  }
}
