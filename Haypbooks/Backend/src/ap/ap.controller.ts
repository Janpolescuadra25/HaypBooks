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

    @Get('bills/:billId')
    getBill(@Req() req: any, @Param('companyId') cid: string, @Param('billId') bid: string) {
        return this.svc.getBill(req.user.userId, cid, bid)
    }

    @Put('bills/:billId')
    updateBill(@Req() req: any, @Param('companyId') cid: string, @Param('billId') bid: string, @Body() body: any) {
        return this.svc.updateBill(req.user.userId, cid, bid, body)
    }

    @Post('bills/:billId/approve')
    @HttpCode(HttpStatus.OK)
    approveBill(@Req() req: any, @Param('companyId') cid: string, @Param('billId') bid: string) {
        return this.svc.approveBill(req.user.userId, cid, bid)
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

    // ─── AP Aging Report ──────────────────────────────────────────────────────

    @Get('reports/aging')
    getApAging(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.getApAging(req.user.userId, cid)
    }
}
