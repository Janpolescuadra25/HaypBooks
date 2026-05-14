import {
    Controller, Get, Post, Put, Delete, Patch, Body, Param, Query,
    UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApService } from './ap.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller('api/companies/:companyId/ap')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class ApController {
    constructor(private readonly svc: ApService) { }

    // ─── Vendors ──────────────────────────────────────────────────────────────

    @Get('vendors')
    listVendors(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listVendors(req.user.userId, cid, q)
    }

    @Post('vendors')
    createVendor(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createVendor(req.user.userId, cid, body)
    }

    @Get('vendors/:contactId/activity')
    getVendorActivity(@Req() req: any, @Param('companyId') cid: string, @Param('contactId') vid: string, @Query() q: any) {
        return this.svc.getVendorActivity(req.user.userId, cid, vid, q)
    }

    @Get('vendors/:contactId')
    getVendor(@Req() req: any, @Param('companyId') cid: string, @Param('contactId') vid: string) {
        return this.svc.getVendor(req.user.userId, cid, vid)
    }

    @Put('vendors/:contactId')
    updateVendor(@Req() req: any, @Param('companyId') cid: string, @Param('contactId') vid: string, @Body() body: any) {
        return this.svc.updateVendor(req.user.userId, cid, vid, body)
    }

    @Delete('vendors/:contactId')
    deleteVendor(@Req() req: any, @Param('companyId') cid: string, @Param('contactId') vid: string) {
        return this.svc.deleteVendor(req.user.userId, cid, vid)
    }

    // ─── Bills ────────────────────────────────────────────────────────────────

    @Get('bills')
    listBills(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listBills(req.user.userId, cid, q)
    }

    @Post('bills')
    createBill(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createBill(req.user.userId, cid, body)
    }

    @Get('bills/:billId/activity')
    getBillActivity(@Req() req: any, @Param('companyId') cid: string, @Param('billId') bid: string, @Query() q: any) {
        return this.svc.getBillActivity(req.user.userId, cid, bid, q)
    }

    @Get('bills/:billId')
    getBill(@Req() req: any, @Param('companyId') cid: string, @Param('billId') bid: string) {
        return this.svc.getBill(req.user.userId, cid, bid)
    }

    @Put('bills/:billId')
    updateBill(@Req() req: any, @Param('companyId') cid: string, @Param('billId') bid: string, @Body() body: any) {
        return this.svc.updateBill(req.user.userId, cid, bid, body)
    }

    @Delete('bills/:billId')
    deleteBill(@Req() req: any, @Param('companyId') cid: string, @Param('billId') bid: string) {
        return this.svc.deleteBill(req.user.userId, cid, bid)
    }

    @Post('bills/:billId/approve')
    @HttpCode(HttpStatus.OK)
    approveBill(@Req() req: any, @Param('companyId') cid: string, @Param('billId') bid: string) {
        return this.svc.approveBill(req.user.userId, cid, bid)
    }

    @Post('bills/:billId/submit')
    @HttpCode(HttpStatus.OK)
    submitBill(@Req() req: any, @Param('companyId') cid: string, @Param('billId') bid: string) {
        return this.svc.submitBill(req.user.userId, cid, bid)
    }

    @Post('bills/:billId/payments')
    @HttpCode(HttpStatus.OK)
    recordBillPaymentForBill(@Req() req: any, @Param('companyId') cid: string, @Param('billId') bid: string, @Body() body: any) {
        return this.svc.recordPayment(req.user.userId, cid, bid, body)
    }

    @Post('bills/:billId/void')
    @HttpCode(HttpStatus.OK)
    voidBill(@Req() req: any, @Param('companyId') cid: string, @Param('billId') bid: string) {
        return this.svc.voidBill(req.user.userId, cid, bid)
    }

    // ─── Bill Payments ────────────────────────────────────────────────────────

    @Get('bill-payments')
    listBillPayments(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listBillPayments(req.user.userId, cid, q)
    }

    @Post('bill-payments')
    recordBillPayment(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.recordBillPayment(req.user.userId, cid, body)
    }

    @Get('bill-payments/:paymentId')
    getBillPayment(@Req() req: any, @Param('companyId') cid: string, @Param('paymentId') pid: string) {
        return this.svc.getBillPayment(req.user.userId, cid, pid)
    }

    @Post('bill-payments/:paymentId/void')
    @HttpCode(HttpStatus.OK)
    voidBillPayment(@Req() req: any, @Param('companyId') cid: string, @Param('paymentId') pid: string) {
        return this.svc.voidBillPayment(req.user.userId, cid, pid)
    }

    // ─── Purchase Orders ──────────────────────────────────────────────────────

    @Get('purchase-orders')
    listPOs(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listPurchaseOrders(req.user.userId, cid, q)
    }

    @Post('purchase-orders')
    createPO(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createPurchaseOrder(req.user.userId, cid, body)
    }

    @Get('purchase-orders/:poId')
    getPO(@Req() req: any, @Param('companyId') cid: string, @Param('poId') poId: string) {
        return this.svc.getPurchaseOrder(req.user.userId, cid, poId)
    }

    @Patch('purchase-orders/:poId/status')
    updatePOStatus(@Req() req: any, @Param('companyId') cid: string, @Param('poId') poId: string, @Body() body: { status: string }) {
        return this.svc.updatePoStatus(req.user.userId, cid, poId, body.status)
    }

    @Post('purchase-orders/:poId/convert')
    @HttpCode(HttpStatus.OK)
    convertPOToBill(@Req() req: any, @Param('companyId') cid: string, @Param('poId') poId: string) {
        return this.svc.convertPoToBill(req.user.userId, cid, poId)
    }

    @Delete('purchase-orders/:poId')
    deletePurchaseOrder(@Req() req: any, @Param('companyId') cid: string, @Param('poId') poId: string) {
        return this.svc.deletePurchaseOrder(req.user.userId, cid, poId)
    }

    // ─── Purchase Requests ─────────────────────────────────────────────────────

    @Get('purchase-requests')
    listPurchaseRequests(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listPurchaseRequests(req.user.userId, cid, q)
    }

    @Post('purchase-requests')
    createPurchaseRequest(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createPurchaseRequest(req.user.userId, cid, body)
    }

    @Get('purchase-requests/:requestId')
    getPurchaseRequest(@Req() req: any, @Param('companyId') cid: string, @Param('requestId') requestId: string) {
        return this.svc.getPurchaseRequest(req.user.userId, cid, requestId)
    }

    @Put('purchase-requests/:requestId')
    updatePurchaseRequest(@Req() req: any, @Param('companyId') cid: string, @Param('requestId') requestId: string, @Body() body: any) {
        return this.svc.updatePurchaseRequest(req.user.userId, cid, requestId, body)
    }

    @Delete('purchase-requests/:requestId')
    deletePurchaseRequest(@Req() req: any, @Param('companyId') cid: string, @Param('requestId') requestId: string) {
        return this.svc.deletePurchaseRequest(req.user.userId, cid, requestId)
    }

    // ─── Vendor Credits ──────────────────────────────────────────────────────

    @Get('vendor-credits')
    listVendorCredits(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listVendorCredits(req.user.userId, cid, q)
    }

    @Post('vendor-credits')
    createVendorCredit(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createVendorCredit(req.user.userId, cid, body)
    }

    @Get('vendor-credits/:creditId')
    getVendorCredit(@Req() req: any, @Param('companyId') cid: string, @Param('creditId') creditId: string) {
        return this.svc.getVendorCredit(req.user.userId, cid, creditId)
    }

    @Put('vendor-credits/:creditId')
    updateVendorCredit(@Req() req: any, @Param('companyId') cid: string, @Param('creditId') creditId: string, @Body() body: any) {
        return this.svc.updateVendorCredit(req.user.userId, cid, creditId, body)
    }

    @Delete('vendor-credits/:creditId')
    deleteVendorCredit(@Req() req: any, @Param('companyId') cid: string, @Param('creditId') creditId: string) {
        return this.svc.deleteVendorCredit(req.user.userId, cid, creditId)
    }

    @Post('vendor-credits/:creditId/apply')
    @HttpCode(HttpStatus.OK)
    applyVendorCredit(@Req() req: any, @Param('companyId') cid: string, @Param('creditId') creditId: string) {
        return this.svc.applyVendorCredit(req.user.userId, cid, creditId)
    }

    // ─── Receipts ────────────────────────────────────────────────────────────

    @Get('receipts')
    listReceipts(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listReceipts(req.user.userId, cid, q)
    }

    @Post('receipts')
    createReceipt(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createReceipt(req.user.userId, cid, body)
    }

    @Get('receipts/:receiptId')
    getReceipt(@Req() req: any, @Param('companyId') cid: string, @Param('receiptId') receiptId: string) {
        return this.svc.getReceipt(req.user.userId, cid, receiptId)
    }

    @Put('receipts/:receiptId')
    updateReceipt(@Req() req: any, @Param('companyId') cid: string, @Param('receiptId') receiptId: string, @Body() body: any) {
        return this.svc.updateReceipt(req.user.userId, cid, receiptId, body)
    }

    @Delete('receipts/:receiptId')
    deleteReceipt(@Req() req: any, @Param('companyId') cid: string, @Param('receiptId') receiptId: string) {
        return this.svc.deleteReceipt(req.user.userId, cid, receiptId)
    }

    // ─── Mileage Logs ─────────────────────────────────────────────────────────

    @Get('mileage')
    listMileageLogs(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listMileageLogs(req.user.userId, cid, q)
    }

    @Post('mileage')
    createMileageLog(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createMileageLog(req.user.userId, cid, body)
    }

    @Get('mileage/:logId')
    getMileageLog(@Req() req: any, @Param('companyId') cid: string, @Param('logId') logId: string) {
        return this.svc.getMileageLog(req.user.userId, cid, logId)
    }

    @Put('mileage/:logId')
    updateMileageLog(@Req() req: any, @Param('companyId') cid: string, @Param('logId') logId: string, @Body() body: any) {
        return this.svc.updateMileageLog(req.user.userId, cid, logId, body)
    }

    @Delete('mileage/:logId')
    deleteMileageLog(@Req() req: any, @Param('companyId') cid: string, @Param('logId') logId: string) {
        return this.svc.deleteMileageLog(req.user.userId, cid, logId)
    }

    // ─── Per Diem Claims ───────────────────────────────────────────────────────────

    @Get('per-diem')
    listPerDiem(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listPerDiem(req.user.userId, cid, q)
    }

    @Post('per-diem')
    createPerDiem(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createPerDiem(req.user.userId, cid, body)
    }

    @Get('per-diem/:id')
    getPerDiem(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string) {
        return this.svc.getPerDiem(req.user.userId, cid, id)
    }

    @Put('per-diem/:id')
    updatePerDiem(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string, @Body() body: any) {
        return this.svc.updatePerDiem(req.user.userId, cid, id, body)
    }

    // ─── AP Aging Report ──────────────────────────────────────────────────────

    @Get('reports/aging')
    getApAging(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.getApAging(req.user.userId, cid)
    }

    // ─── RFQs (Request for Quotation) ─────────────────────────────────────────

    @Get('rfqs')
    listRfqs(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listRfqs(req.user.userId, cid, q)
    }

    @Post('rfqs')
    createRfq(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createRfq(req.user.userId, cid, body)
    }

    @Get('rfqs/:rfqId')
    getRfq(@Req() req: any, @Param('companyId') cid: string, @Param('rfqId') rfqId: string) {
        return this.svc.getRfq(req.user.userId, cid, rfqId)
    }

    @Put('rfqs/:rfqId')
    updateRfq(@Req() req: any, @Param('companyId') cid: string, @Param('rfqId') rfqId: string, @Body() body: any) {
        return this.svc.updateRfq(req.user.userId, cid, rfqId, body)
    }

    // ─── Recurring Bills ──────────────────────────────────────────────────────

    @Get('recurring-bills')
    listRecurringBills(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listRecurringBills(req.user.userId, cid, q)
    }

    @Post('recurring-bills')
    createRecurringBill(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createRecurringBill(req.user.userId, cid, body)
    }

    @Get('recurring-bills/:billId')
    getRecurringBill(@Req() req: any, @Param('companyId') cid: string, @Param('billId') billId: string) {
        return this.svc.getRecurringBill(req.user.userId, cid, billId)
    }

    @Put('recurring-bills/:billId')
    updateRecurringBill(@Req() req: any, @Param('companyId') cid: string, @Param('billId') billId: string, @Body() body: any) {
        return this.svc.updateRecurringBill(req.user.userId, cid, billId, body)
    }

    @Delete('recurring-bills/:billId')
    deleteRecurringBill(@Req() req: any, @Param('companyId') cid: string, @Param('billId') billId: string) {
        return this.svc.deleteRecurringBill(req.user.userId, cid, billId)
    }

    // ─── Payment Runs ─────────────────────────────────────────────────────────

    @Get('payment-runs')
    listPaymentRuns(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listPaymentRuns(req.user.userId, cid, q)
    }

    @Post('payment-runs')
    createPaymentRun(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createPaymentRun(req.user.userId, cid, body)
    }

    @Get('payment-runs/:runId')
    getPaymentRun(@Req() req: any, @Param('companyId') cid: string, @Param('runId') runId: string) {
        return this.svc.getPaymentRun(req.user.userId, cid, runId)
    }

    @Patch('payment-runs/:runId')
    updatePaymentRun(@Req() req: any, @Param('companyId') cid: string, @Param('runId') runId: string, @Body() body: any) {
        return this.svc.updatePaymentRun(req.user.userId, cid, runId, body)
    }

    @Post('payment-runs/:runId/process')
    @HttpCode(HttpStatus.OK)
    processPaymentRun(@Req() req: any, @Param('companyId') cid: string, @Param('runId') runId: string) {
        return this.svc.processPaymentRun(req.user.userId, cid, runId)
    }
}
