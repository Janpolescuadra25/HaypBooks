import {
    Controller, Get, Post, Put, Delete, Patch, Body, Param, Query,
    UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common'
import { BankingService } from './banking.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller('api/companies/:companyId/banking')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class BankingController {
    constructor(private readonly svc: BankingService) { }

    // ─── Cash Position ────────────────────────────────────────────────────────

    @Get('cash-position')
    getCashPosition(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.getCashPosition(req.user.userId, cid)
    }

    // ─── Bank Accounts ────────────────────────────────────────────────────────

    @Get('accounts')
    listBankAccounts(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listBankAccounts(req.user.userId, cid)
    }

    @Post('accounts')
    createBankAccount(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createBankAccount(req.user.userId, cid, body)
    }

    @Get('accounts/:bankAccountId')
    getBankAccount(@Req() req: any, @Param('companyId') cid: string, @Param('bankAccountId') bid: string) {
        return this.svc.getBankAccount(req.user.userId, cid, bid)
    }

    @Put('accounts/:bankAccountId')
    updateBankAccount(@Req() req: any, @Param('companyId') cid: string, @Param('bankAccountId') bid: string, @Body() body: any) {
        return this.svc.updateBankAccount(req.user.userId, cid, bid, body)
    }

    @Delete('accounts/:bankAccountId')
    deleteBankAccount(@Req() req: any, @Param('companyId') cid: string, @Param('bankAccountId') bid: string) {
        return this.svc.deleteBankAccount(req.user.userId, cid, bid)
    }

    // ─── Transactions ─────────────────────────────────────────────────────────

    @Get('accounts/:bankAccountId/transactions')
    listTransactions(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('bankAccountId') bid: string,
        @Query() q: any,
    ) {
        return this.svc.listTransactions(req.user.userId, cid, bid, q)
    }

    @Post('accounts/:bankAccountId/transactions/import')
    @HttpCode(HttpStatus.OK)
    importTransactions(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('bankAccountId') bid: string,
        @Body() body: any[],
    ) {
        return this.svc.importTransactions(req.user.userId, cid, bid, body)
    }

    @Post('accounts/:bankAccountId/transactions')
    createTransaction(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('bankAccountId') bid: string,
        @Body() body: any,
    ) {
        return this.svc.createTransaction(req.user.userId, cid, bid, body)
    }

    @Patch('accounts/:bankAccountId/transactions/:transactionId')
    updateTransaction(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('bankAccountId') bid: string,
        @Param('transactionId') tid: string,
        @Body() body: any,
    ) {
        return this.svc.updateTransaction(req.user.userId, cid, bid, tid, body)
    }

    @Post('accounts/:bankAccountId/transactions/:transactionId/split')
    @HttpCode(HttpStatus.OK)
    splitTransaction(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('bankAccountId') bid: string,
        @Param('transactionId') tid: string,
        @Body() body: any[],
    ) {
        return this.svc.splitTransaction(req.user.userId, cid, bid, tid, body)
    }

    @Post('accounts/:bankAccountId/transactions/batch-categorize')
    @HttpCode(HttpStatus.OK)
    batchCategorize(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('bankAccountId') bid: string,
        @Body() body: { transactionIds: string[]; accountId: string; contactId?: string; transactionType?: string; category?: string },
    ) {
        return this.svc.batchCategorize(req.user.userId, cid, bid, body)
    }

    @Post('transfers')
    createTransfer(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Body() body: any,
    ) {
        return this.svc.createTransfer(req.user.userId, cid, body)
    }

    // ─── Bank Reconciliation ──────────────────────────────────────────────────

    @Get('accounts/:bankAccountId/reconciliations')
    listReconciliations(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('bankAccountId') bid: string,
    ) {
        return this.svc.listReconciliations(req.user.userId, cid, bid)
    }

    @Post('accounts/:bankAccountId/reconciliations')
    createReconciliation(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('bankAccountId') bid: string,
        @Body() body: any,
    ) {
        return this.svc.createReconciliation(req.user.userId, cid, bid, body)
    }

    @Get('reconciliations/:reconId')
    getReconciliation(@Req() req: any, @Param('companyId') cid: string, @Param('reconId') rid: string) {
        return this.svc.getReconciliation(req.user.userId, cid, rid)
    }

    @Post('reconciliations/:reconId/match')
    @HttpCode(HttpStatus.OK)
    matchTransaction(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('reconId') rid: string,
        @Body() body: any,
    ) {
        return this.svc.matchTransaction(req.user.userId, cid, rid, body)
    }

    @Delete('reconciliations/:reconId/match/:bankTransactionId')
    unmatchTransaction(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('reconId') rid: string,
        @Param('bankTransactionId') tid: string,
    ) {
        return this.svc.unmatchTransaction(req.user.userId, cid, rid, tid)
    }

    @Post('reconciliations/:reconId/complete')
    @HttpCode(HttpStatus.OK)
    completeReconciliation(@Req() req: any, @Param('companyId') cid: string, @Param('reconId') rid: string) {
        return this.svc.completeReconciliation(req.user.userId, cid, rid)
    }

    @Post('reconciliations/:reconId/undo')
    @HttpCode(HttpStatus.OK)
    undoReconciliation(@Req() req: any, @Param('companyId') cid: string, @Param('reconId') rid: string) {
        return this.svc.undoReconciliation(req.user.userId, cid, rid)
    }

    @Post('reconciliations/:reconId/auto-match')
    @HttpCode(HttpStatus.OK)
    autoMatchReconciliation(@Req() req: any, @Param('companyId') cid: string, @Param('reconId') rid: string) {
        return this.svc.autoMatchReconciliation(req.user.userId, cid, rid)
    }

    @Get('reconciliations/:reconId/discrepancies')
    getReconciliationDiscrepancies(@Req() req: any, @Param('companyId') cid: string, @Param('reconId') rid: string) {
        return this.svc.getReconciliationDiscrepancies(req.user.userId, cid, rid)
    }

    @Post('reconciliations/:reconId/adjustment')
    @HttpCode(HttpStatus.OK)
    addReconciliationAdjustment(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('reconId') rid: string,
        @Body() body: any,
    ) {
        return this.svc.addReconciliationAdjustment(req.user.userId, cid, rid, body)
    }

    // ─── Bank Deposits ────────────────────────────────────────────────────────

    @Get('deposits')
    listDeposits(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listDeposits(req.user.userId, cid, q)
    }

    @Post('deposits')
    createDeposit(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createDeposit(req.user.userId, cid, body)
    }

    @Get('deposits/:depositId')
    getDeposit(@Req() req: any, @Param('companyId') cid: string, @Param('depositId') did: string) {
        return this.svc.getDeposit(req.user.userId, cid, did)
    }

    @Post('deposits/:depositId/post')
    @HttpCode(HttpStatus.OK)
    postDeposit(@Req() req: any, @Param('companyId') cid: string, @Param('depositId') did: string) {
        return this.svc.postDeposit(req.user.userId, cid, did)
    }

    @Post('deposits/:depositId/void')
    @HttpCode(HttpStatus.OK)
    voidDeposit(@Req() req: any, @Param('companyId') cid: string, @Param('depositId') did: string) {
        return this.svc.voidDeposit(req.user.userId, cid, did)
    }

    // ─── Undeposited Funds ────────────────────────────────────────────────────

    @Get('undeposited-funds')
    listUndepositedFunds(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listUndepositedFunds(req.user.userId, cid)
    }

    // ─── Smart Rules ────────────────────────────────────────────

    @Get('smart-rules')
    listSmartRules(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listSmartRules(req.user.userId, cid)
    }

    @Post('smart-rules')
    createSmartRule(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createSmartRule(req.user.userId, cid, body)
    }

    @Put('smart-rules/:id')
    updateSmartRule(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string, @Body() body: any) {
        return this.svc.updateSmartRule(req.user.userId, cid, id, body)
    }

    @Delete('smart-rules/:id')
    deleteSmartRule(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string) {
        return this.svc.deleteSmartRule(req.user.userId, cid, id)
    }

    // ─── Feed Connections ────────────────────────────────────────────────────

    @Get('feed-connections')
    listFeedConnections(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listFeedConnections(req.user.userId, cid)
    }

    @Post('feed-connections')
    createFeedConnection(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createFeedConnection(req.user.userId, cid, body)
    }

    @Put('feed-connections/:id')
    updateFeedConnection(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        return this.svc.updateFeedConnection(req.user.userId, cid, id, body)
    }

    @Delete('feed-connections/:id')
    deleteFeedConnection(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string) {
        return this.svc.deleteFeedConnection(req.user.userId, cid, id)
    }

    @Post('feed-connections/:id/sync')
    @HttpCode(HttpStatus.OK)
    syncFeedConnection(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string) {
        return this.svc.syncFeedConnection(req.user.userId, cid, id)
    }

    @Get('feed-status')
    getFeedStatus(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.getFeedStatus(req.user.userId, cid)
    }

    // ─── Credit Cards ─────────────────────────────────────────────────────────

    @Get('credit-cards')
    listCreditCards(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listCreditCards(req.user.userId, cid)
    }

    @Get('credit-cards/:cardId/statements')
    listCardStatements(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('cardId') cardId: string,
    ) {
        return this.svc.listCardStatements(req.user.userId, cid, cardId)
    }

    // ─── Checks ───────────────────────────────────────────────────────────────

    @Get('checks')
    listChecks(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listChecks(req.user.userId, cid, q)
    }

    @Post('checks')
    createCheck(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createCheck(req.user.userId, cid, body)
    }

    @Patch('checks/:checkId')
    updateCheck(@Req() req: any, @Param('companyId') cid: string, @Param('checkId') checkId: string, @Body() body: any) {
        return this.svc.updateCheck(req.user.userId, cid, checkId, body)
    }
}
