import {
    Controller, Get, Post, Delete, Body, Param, Query,
    UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common'
import { IntegrationsService } from './integrations.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller('api/companies/:companyId/integrations')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class IntegrationsController {
    constructor(private readonly svc: IntegrationsService) { }

    // ─── AI Insights ──────────────────────────────────────────────────────────

    @Get('ai/insights')
    listInsights(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listInsights(req.user.userId, cid, q)
    }

    @Post('ai/insights/generate')
    @HttpCode(HttpStatus.OK)
    generateInsights(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.generateInsights(req.user.userId, cid)
    }

    @Get('ai/insights/:insightId')
    getInsight(@Req() req: any, @Param('companyId') cid: string, @Param('insightId') iid: string) {
        return this.svc.getInsight(req.user.userId, cid, iid)
    }

    @Post('ai/insights/:insightId/dismiss')
    @HttpCode(HttpStatus.OK)
    dismissInsight(@Req() req: any, @Param('companyId') cid: string, @Param('insightId') iid: string) {
        return this.svc.dismissInsight(req.user.userId, cid, iid)
    }

    @Post('ai/insights/:insightId/resolve')
    @HttpCode(HttpStatus.OK)
    resolveInsight(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('insightId') iid: string,
        @Body() body: { actionTaken: string },
    ) {
        return this.svc.resolveInsight(req.user.userId, cid, iid, body)
    }

    // ─── Audit Logs ───────────────────────────────────────────────────────────

    @Get('audit-logs')
    listAuditLogs(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listAuditLogs(req.user.userId, cid, q)
    }

    // ─── API Keys ─────────────────────────────────────────────────────────────

    @Get('api-keys')
    listApiKeys(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listApiKeys(req.user.userId, cid)
    }

    @Post('api-keys')
    createApiKey(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createApiKey(req.user.userId, cid, body)
    }

    @Delete('api-keys/:keyId')
    revokeApiKey(@Req() req: any, @Param('companyId') cid: string, @Param('keyId') kid: string) {
        return this.svc.revokeApiKey(req.user.userId, cid, kid)
    }

    // ─── Bank Feed ────────────────────────────────────────────────────────────

    @Get('bank-feed/connections')
    listBankFeedConnections(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listBankFeedConnections(req.user.userId, cid)
    }

    @Get('bank-feed/imports')
    listBankFeedImports(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listBankFeedImports(req.user.userId, cid, q)
    }
}
