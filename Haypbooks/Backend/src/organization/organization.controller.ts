import {
    Controller, Get, Post, Put, Delete, Body, Param, Query,
    UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common'
import { OrganizationService } from './organization.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller('api/companies/:companyId/organization')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class OrganizationController {
    constructor(private readonly svc: OrganizationService) { }

    // ─── Legal Entities ───────────────────────────────────────────────────────

    @Get('legal-entities')
    listLegalEntities(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listLegalEntities(req.user.userId, cid)
    }

    @Post('legal-entities')
    createLegalEntity(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createLegalEntity(req.user.userId, cid, body)
    }

    @Put('legal-entities/:id')
    updateLegalEntity(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('id') id: string, @Body() body: any,
    ) {
        return this.svc.updateLegalEntity(req.user.userId, cid, id, body)
    }

    @Delete('legal-entities/:id')
    deleteLegalEntity(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string) {
        return this.svc.deleteLegalEntity(req.user.userId, cid, id)
    }

    // ─── Consolidation ────────────────────────────────────────────────────────

    @Get('consolidation')
    listConsolidationGroups(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listConsolidationGroups(req.user.userId, cid)
    }

    @Post('consolidation')
    createConsolidationGroup(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createConsolidationGroup(req.user.userId, cid, body)
    }

    // ─── Intercompany ─────────────────────────────────────────────────────────

    @Get('intercompany')
    listIntercompanyTransactions(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listIntercompanyTransactions(req.user.userId, cid, q)
    }

    @Post('intercompany')
    createIntercompanyTransaction(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createIntercompanyTransaction(req.user.userId, cid, body)
    }

    // ─── Departments ──────────────────────────────────────────────────────────

    @Get('departments')
    listDepartments(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listDepartments(req.user.userId, cid)
    }

    @Post('departments')
    createDepartment(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createDepartment(req.user.userId, cid, body)
    }

    @Put('departments/:id')
    updateDepartment(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string, @Body() body: any) {
        return this.svc.updateDepartment(req.user.userId, cid, id, body)
    }

    @Delete('departments/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteDepartment(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string) {
        return this.svc.deleteDepartment(req.user.userId, cid, id)
    }

    // ─── Locations & Divisions ────────────────────────────────────────────────

    @Get('locations')
    listLocations(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listLocations(req.user.userId, cid)
    }

    @Post('locations')
    createLocation(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createLocation(req.user.userId, cid, body)
    }

    @Put('locations/:id')
    updateLocation(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string, @Body() body: any) {
        return this.svc.updateLocation(req.user.userId, cid, id, body)
    }

    @Delete('locations/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteLocation(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string) {
        return this.svc.deleteLocation(req.user.userId, cid, id)
    }

    // ─── Filing Calendar ──────────────────────────────────────────────────────

    @Get('filing-calendar')
    listFilingCalendars(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listFilingCalendars(req.user.userId, cid)
    }

    @Post('filing-calendar')
    createFilingCalendar(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createFilingCalendar(req.user.userId, cid, body)
    }

    @Put('filing-calendar/:id')
    updateFilingCalendar(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string, @Body() body: any) {
        return this.svc.updateFilingCalendar(req.user.userId, cid, id, body)
    }

    @Delete('filing-calendar/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteFilingCalendar(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string) {
        return this.svc.deleteFilingCalendar(req.user.userId, cid, id)
    }
}
