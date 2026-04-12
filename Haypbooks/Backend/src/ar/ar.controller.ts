import {
    Controller, Get, Post, Put, Delete, Patch, Body, Param, Query,
    UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ArService } from './ar.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller('api/companies/:companyId/ar')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class ArController {
    constructor(private readonly svc: ArService) { }

    // ─── Customers ────────────────────────────────────────────────────────────

    @Get('customers')
    listCustomers(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: any,
    ) {
        return this.svc.listCustomers(req.user.userId, companyId, query)
    }

    @Post('customers')
    createCustomer(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.createCustomer(req.user.userId, companyId, body)
    }

    @Get('customers/export')
    async exportCustomers(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: any,
    ) {
        return this.svc.exportCustomersCsv(req.user.userId, companyId, query)
    }

    @Get('customers/activity')
    getAllCustomerActivity(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: any,
    ) {
        return this.svc.getAllCustomerActivity(req.user.userId, companyId, query)
    }

    // ─── Customer Groups ──────────────────────────────────────────────────────

    @Post('customer-groups')
    createCustomerGroup(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.createCustomerGroup(req.user.userId, companyId, body)
    }

    @Get('customer-groups/export')
    async exportCustomerGroups(
        @Req() req: any,
        @Param('companyId') companyId: string,
    ) {
        return this.svc.exportCustomerGroupsCsv(req.user.userId, companyId)
    }

    @Post('customer-groups/batch/delete')
    @HttpCode(HttpStatus.OK)
    batchDeleteCustomerGroups(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: { ids: string[] },
    ) {
        return this.svc.batchDeleteCustomerGroups(req.user.userId, companyId, body.ids)
    }

    @Get('customer-groups')
    listCustomerGroups(
        @Req() req: any,
        @Param('companyId') companyId: string,
    ) {
        return this.svc.listCustomerGroups(req.user.userId, companyId)
    }

    @Get('customer-groups/:id')
    getCustomerGroup(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
    ) {
        return this.svc.getCustomerGroup(req.user.userId, companyId, id)
    }

    @Get('customer-groups/:id/members')
    listGroupMembers(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
        @Query() query: any,
    ) {
        return this.svc.listGroupMembers(req.user.userId, companyId, id, query)
    }

    @Post('customer-groups/:id/members')
    addGroupMembers(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
        @Body() body: { customerIds: string[] },
    ) {
        return this.svc.addGroupMembers(req.user.userId, companyId, id, body.customerIds)
    }

    @Delete('customer-groups/:id/members')
    @HttpCode(HttpStatus.OK)
    removeGroupMembers(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
        @Body() body: { customerIds: string[] },
    ) {
        return this.svc.removeGroupMembers(req.user.userId, companyId, id, body.customerIds)
    }

    @Put('customer-groups/:id')
    updateCustomerGroup(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        return this.svc.updateCustomerGroup(req.user.userId, companyId, id, body)
    }

    @Delete('customer-groups/:id')
    deleteCustomerGroup(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
    ) {
        return this.svc.deleteCustomerGroup(req.user.userId, companyId, id)
    }

    @Get('payment-terms')
    listPaymentTerms(
        @Req() req: any,
        @Param('companyId') companyId: string,
    ) {
        return this.svc.listPaymentTerms(req.user.userId, companyId)
    }

    @Post('customers/batch/delete')
    @HttpCode(HttpStatus.OK)
    batchDeleteCustomers(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: { ids: string[] },
    ) {
        return this.svc.batchDeleteCustomers(req.user.userId, companyId, body.ids)
    }

    @Patch('customers/batch/status')
    batchUpdateCustomerStatus(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: { ids: string[]; status: string },
    ) {
        return this.svc.batchUpdateCustomerStatus(req.user.userId, companyId, body.ids, body.status)
    }

    @Patch('customers/batch/group')
    batchUpdateCustomerGroup(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: { ids: string[]; groupId: string | null },
    ) {
        return this.svc.batchUpdateCustomerGroup(req.user.userId, companyId, body.ids, body.groupId)
    }

    @Get('customers/:contactId/activity')
    getCustomerActivity(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('contactId') contactId: string,
        @Query() query: any,
    ) {
        return this.svc.getCustomerActivity(req.user.userId, companyId, contactId, query)
    }

    @Get('customers/:contactId')
    getCustomer(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('contactId') contactId: string,
    ) {
        return this.svc.getCustomer(req.user.userId, companyId, contactId)
    }

    @Put('customers/:contactId')
    updateCustomer(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('contactId') contactId: string,
        @Body() body: any,
    ) {
        return this.svc.updateCustomer(req.user.userId, companyId, contactId, body)
    }

    @Delete('customers/:contactId')
    deleteCustomer(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('contactId') contactId: string,
    ) {
        return this.svc.deleteCustomer(req.user.userId, companyId, contactId)
    }

    // ─── Quotes ───────────────────────────────────────────────────────────────

    @Get('quotes')
    listQuotes(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: any,
    ) {
        return this.svc.listQuotes(req.user.userId, companyId, query)
    }

    @Post('quotes')
    createQuote(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.createQuote(req.user.userId, companyId, body)
    }

    @Get('quotes/export')
    exportQuotes(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: any,
    ) {
        return this.svc.exportQuotes(req.user.userId, companyId, query)
    }

    @Post('quotes/batch/delete')
    @HttpCode(HttpStatus.OK)
    batchDeleteQuotes(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: { ids: string[] },
    ) {
        return this.svc.batchDeleteQuotes(req.user.userId, companyId, body.ids)
    }

    @Patch('quotes/batch/status')
    batchUpdateQuoteStatus(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: { ids: string[]; status: string },
    ) {
        return this.svc.batchUpdateQuoteStatus(req.user.userId, companyId, body.ids, body.status)
    }

    @Get('quotes/:quoteId')
    getQuote(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('quoteId') quoteId: string,
    ) {
        return this.svc.getQuote(req.user.userId, companyId, quoteId)
    }

    @Put('quotes/:quoteId')
    updateQuote(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('quoteId') quoteId: string,
        @Body() body: any,
    ) {
        return this.svc.updateQuote(req.user.userId, companyId, quoteId, body)
    }

    @Patch('quotes/:quoteId/status')
    updateQuoteStatus(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('quoteId') quoteId: string,
        @Body() body: { status: string },
    ) {
        return this.svc.updateQuoteStatus(req.user.userId, companyId, quoteId, body.status)
    }

    @Delete('quotes/:quoteId')
    deleteQuote(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('quoteId') quoteId: string,
    ) {
        return this.svc.deleteQuote(req.user.userId, companyId, quoteId)
    }

    @Post('quotes/:quoteId/convert')
    @HttpCode(HttpStatus.OK)
    convertQuote(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('quoteId') quoteId: string,
    ) {
        return this.svc.convertToInvoice(req.user.userId, companyId, quoteId)
    }

    // ─── Invoices ─────────────────────────────────────────────────────────────

    @Get('invoices')
    listInvoices(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: any,
    ) {
        return this.svc.listInvoices(req.user.userId, companyId, query)
    }

    @Post('invoices')
    createInvoice(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.createInvoice(req.user.userId, companyId, body)
    }

    @Get('invoices/:invoiceId')
    getInvoice(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('invoiceId') invoiceId: string,
    ) {
        return this.svc.getInvoice(req.user.userId, companyId, invoiceId)
    }

    @Put('invoices/:invoiceId')
    updateInvoice(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('invoiceId') invoiceId: string,
        @Body() body: any,
    ) {
        return this.svc.updateInvoice(req.user.userId, companyId, invoiceId, body)
    }

    @Post('invoices/:invoiceId/send')
    @HttpCode(HttpStatus.OK)
    sendInvoice(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('invoiceId') invoiceId: string,
        @Body() body: { subject?: string; body?: string; scheduledAt?: string },
    ) {
        return this.svc.sendInvoice(req.user.userId, companyId, invoiceId, body)
    }

    @Post('invoices/:invoiceId/void')
    @HttpCode(HttpStatus.OK)
    voidInvoice(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('invoiceId') invoiceId: string,
    ) {
        return this.svc.voidInvoice(req.user.userId, companyId, invoiceId)
    }

    // ─── Payments ─────────────────────────────────────────────────────────────

    @Get('payments')
    listPayments(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: any,
    ) {
        return this.svc.listPayments(req.user.userId, companyId, query)
    }

    @Post('payments')
    recordPayment(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.recordPayment(req.user.userId, companyId, body)
    }

    @Get('payments/:paymentId')
    getPayment(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('paymentId') paymentId: string,
    ) {
        return this.svc.getPayment(req.user.userId, companyId, paymentId)
    }

    @Post('payments/:paymentId/apply')
    @HttpCode(HttpStatus.OK)
    applyPayment(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('paymentId') paymentId: string,
        @Body() body: { allocations: Array<{ invoiceId: string; amount: number }> },
    ) {
        return this.svc.applyPaymentToInvoices(req.user.userId, companyId, paymentId, body.allocations)
    }

    @Post('payments/:paymentId/void')
    @HttpCode(HttpStatus.OK)
    voidPayment(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('paymentId') paymentId: string,
    ) {
        return this.svc.voidPayment(req.user.userId, companyId, paymentId)
    }

    @Get('aging')
    getAging(
        @Req() req: any,
        @Param('companyId') companyId: string,
    ) {
        return this.svc.getAging(req.user.userId, companyId)
    }

    @Get('collections')
    listCollections(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: any,
    ) {
        return this.svc.listCollections(req.user.userId, companyId, query)
    }

    @Post('collections')
    createCollection(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.createCollection(req.user.userId, companyId, body)
    }

    @Get('collections/export')
    exportCollections(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: any,
    ) {
        return this.svc.exportCollections(req.user.userId, companyId, query)
    }

    @Post('collections/batch/delete')
    @HttpCode(HttpStatus.OK)
    batchDeleteCollections(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: { ids: string[] },
    ) {
        return this.svc.batchDeleteCollections(req.user.userId, companyId, body.ids)
    }

    @Patch('collections/batch/status')
    batchUpdateCollectionStatus(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: { ids: string[]; status: string },
    ) {
        return this.svc.batchUpdateCollectionStatus(req.user.userId, companyId, body.ids, body.status)
    }

    @Get('collections/:caseId')
    getCollection(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('caseId') caseId: string,
    ) {
        return this.svc.getCollection(req.user.userId, companyId, caseId)
    }

    @Put('collections/:caseId')
    updateCollection(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('caseId') caseId: string,
        @Body() body: any,
    ) {
        return this.svc.updateCollection(req.user.userId, companyId, caseId, body)
    }

    @Delete('collections/:caseId')
    deleteCollection(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('caseId') caseId: string,
    ) {
        return this.svc.deleteCollection(req.user.userId, companyId, caseId)
    }

    @Get('refunds')
    listRefunds(
        @Req() req: any,
        @Param('companyId') companyId: string,
    ) {
        return this.svc.listRefunds(req.user.userId, companyId)
    }

    // ─── Credit Notes ─────────────────────────────────────────────────────────

    @Get('credit-notes')
    listCreditNotes(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: any,
    ) {
        return this.svc.listCreditNotes(req.user.userId, companyId, query)
    }

    @Post('credit-notes')
    createCreditNote(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.createCreditNote(req.user.userId, companyId, body)
    }

    @Get('credit-notes/export')
    exportCreditNotes(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: any,
    ) {
        return this.svc.exportCreditNotes(req.user.userId, companyId, query)
    }

    @Post('credit-notes/batch/delete')
    @HttpCode(HttpStatus.OK)
    batchDeleteCreditNotes(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: { ids: string[] },
    ) {
        return this.svc.batchDeleteCreditNotes(req.user.userId, companyId, body.ids)
    }

    @Get('credit-notes/:creditNoteId')
    getCreditNote(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('creditNoteId') creditNoteId: string,
    ) {
        return this.svc.getCreditNote(req.user.userId, companyId, creditNoteId)
    }

    @Post('credit-notes/:creditNoteId/void')
    @HttpCode(HttpStatus.OK)
    voidCreditNote(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('creditNoteId') creditNoteId: string,
    ) {
        return this.svc.voidCreditNote(req.user.userId, companyId, creditNoteId)
    }

    @Post('credit-notes/:creditNoteId/apply')
    @HttpCode(HttpStatus.OK)
    applyCreditNote(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('creditNoteId') creditNoteId: string,
        @Body() body: any,
    ) {
        return this.svc.applyCreditNote(req.user.userId, companyId, creditNoteId, body)
    }

    // ─── AR Aging Report ──────────────────────────────────────────────────────

    @Get('reports/aging')
    getArAging(
        @Req() req: any,
        @Param('companyId') companyId: string,
    ) {
        return this.svc.getArAging(req.user.userId, companyId)
    }

    // ─── Recurring Invoices ───────────────────────────────────────────────────

    @Get('recurring-invoices')
    getRecurringInvoices(
        @Req() req: any,
        @Param('companyId') companyId: string,
    ) {
        return this.svc.listRecurringInvoices(req.user.userId, companyId)
    }

    @Post('recurring-invoices')
    createRecurringInvoice(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.createRecurringInvoice(req.user.userId, companyId, body)
    }

    @Post('recurring-invoices/batch/delete')
    @HttpCode(HttpStatus.OK)
    batchDeleteRecurringInvoices(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: { ids: string[] },
    ) {
        return this.svc.batchDeleteRecurringInvoices(req.user.userId, companyId, body.ids)
    }

    @Get('recurring-invoices/:id')
    getRecurringInvoice(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
    ) {
        return this.svc.getRecurringInvoice(req.user.userId, companyId, id)
    }

    @Put('recurring-invoices/:id')
    updateRecurringInvoice(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        return this.svc.updateRecurringInvoice(req.user.userId, companyId, id, body)
    }

    @Delete('recurring-invoices/:id')
    deleteRecurringInvoice(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
    ) {
        return this.svc.deleteRecurringInvoice(req.user.userId, companyId, id)
    }

    @Post('recurring-invoices/:id/generate')
    generateRecurringInvoice(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
    ) {
        return this.svc.generateRecurringInvoice(req.user.userId, companyId, id)
    }

    // ─── Write-Offs ───────────────────────────────────────────────────────────

    @Get('write-offs')
    getWriteOffs(
        @Req() req: any,
        @Param('companyId') companyId: string,
    ) {
        return this.svc.listWriteOffs(req.user.userId, companyId)
    }

    @Post('write-offs')
    createWriteOff(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.createWriteOff(req.user.userId, companyId, body)
    }

    @Post('write-offs/batch/delete')
    @HttpCode(HttpStatus.OK)
    batchDeleteWriteOffs(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: { ids: string[] },
    ) {
        return this.svc.batchDeleteWriteOffs(req.user.userId, companyId, body.ids)
    }

    @Get('write-offs/:id')
    getWriteOff(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
    ) {
        return this.svc.getWriteOff(req.user.userId, companyId, id)
    }

    @Put('write-offs/:id')
    updateWriteOff(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        return this.svc.updateWriteOff(req.user.userId, companyId, id, body)
    }

    @Delete('write-offs/:id')
    deleteWriteOff(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
    ) {
        return this.svc.deleteWriteOff(req.user.userId, companyId, id)
    }

    @Post('write-offs/:id/approve')
    approveWriteOff(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
    ) {
        return this.svc.approveWriteOff(req.user.userId, companyId, id)
    }

    @Post('write-offs/:id/reverse')
    reverseWriteOff(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
    ) {
        return this.svc.reverseWriteOff(req.user.userId, companyId, id)
    }

    // ─── Sales Orders ─────────────────────────────────────────────────────────

    @Get('sales-orders')
    getSalesOrders(
        @Req() req: any,
        @Param('companyId') companyId: string,
    ) {
        return this.svc.listSalesOrders(req.user.userId, companyId)
    }

    @Post('sales-orders')
    createSalesOrder(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.createSalesOrder(req.user.userId, companyId, body)
    }

    @Post('sales-orders/batch/delete')
    @HttpCode(HttpStatus.OK)
    batchDeleteSalesOrders(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: { ids: string[] },
    ) {
        return this.svc.batchDeleteSalesOrders(req.user.userId, companyId, body.ids)
    }

    @Get('sales-orders/:id')
    getSalesOrder(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
    ) {
        return this.svc.getSalesOrder(req.user.userId, companyId, id)
    }

    @Put('sales-orders/:id')
    updateSalesOrder(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        return this.svc.updateSalesOrder(req.user.userId, companyId, id, body)
    }

    @Delete('sales-orders/:id')
    deleteSalesOrder(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
    ) {
        return this.svc.deleteSalesOrder(req.user.userId, companyId, id)
    }

    @Post('sales-orders/:id/convert')
    convertSalesOrder(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
    ) {
        return this.svc.convertSalesOrder(req.user.userId, companyId, id)
    }

    // ─── Refunds (extended) ───────────────────────────────────────────────────

    @Post('refunds')
    createRefund(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.createRefund(req.user.userId, companyId, body)
    }

    @Post('refunds/batch/delete')
    @HttpCode(HttpStatus.OK)
    batchDeleteRefunds(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: { ids: string[] },
    ) {
        return this.svc.batchDeleteRefunds(req.user.userId, companyId, body.ids)
    }

    @Get('refunds/:id')
    getRefund(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
    ) {
        return this.svc.getRefund(req.user.userId, companyId, id)
    }

    @Post('refunds/:id/process')
    processRefund(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('id') id: string,
    ) {
        return this.svc.processRefund(req.user.userId, companyId, id)
    }

    // ─── Dunning ─────────────────────────────────────────────────────────────

    @Post('dunning/send')
    sendDunningReminder(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: { invoiceId: string; level: number },
    ) {
        return this.svc.sendDunningReminder(req.user.userId, companyId, body.invoiceId, body.level ?? 1)
    }

    @Post('dunning/batch/send')
    @HttpCode(HttpStatus.OK)
    batchSendDunning(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: { invoiceIds: string[]; level: number },
    ) {
        return this.svc.batchSendDunning(req.user.userId, companyId, body.invoiceIds, body.level ?? 1)
    }

    @Patch('dunning/:invoiceId/level')
    updateDunningLevel(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('invoiceId') invoiceId: string,
        @Body() body: { level: number },
    ) {
        return this.svc.updateDunningLevel(req.user.userId, companyId, invoiceId, body.level)
    }
}
