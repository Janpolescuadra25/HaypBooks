import {
    Controller, Get, Post, Put, Patch, Delete, Body, Param, Query,
    UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller('api/companies/:companyId/projects')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class ProjectsController {
    constructor(private readonly svc: ProjectsService) { }

    // ─── Projects CRUD ────────────────────────────────────────────────────────

    @Get()
    listProjects(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listProjects(req.user.userId, cid, q)
    }

    @Post()
    createProject(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createProject(req.user.userId, cid, body)
    }

    @Get('wip')
    getWip(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.getWip(req.user.userId, cid)
    }

    @Get(':projectId')
    getProject(@Req() req: any, @Param('companyId') cid: string, @Param('projectId') pid: string) {
        return this.svc.getProject(req.user.userId, cid, pid)
    }

    @Put(':projectId')
    updateProject(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('projectId') pid: string, @Body() body: any,
    ) {
        return this.svc.updateProject(req.user.userId, cid, pid, body)
    }

    @Delete(':projectId')
    deleteProject(@Req() req: any, @Param('companyId') cid: string, @Param('projectId') pid: string) {
        return this.svc.deleteProject(req.user.userId, cid, pid)
    }

    // ─── Milestones ───────────────────────────────────────────────────────────

    @Get(':projectId/milestones')
    listMilestones(@Req() req: any, @Param('companyId') cid: string, @Param('projectId') pid: string) {
        return this.svc.listMilestones(req.user.userId, cid, pid)
    }

    @Post(':projectId/milestones')
    createMilestone(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('projectId') pid: string, @Body() body: any,
    ) {
        return this.svc.createMilestone(req.user.userId, cid, pid, body)
    }

    @Patch(':projectId/milestones/:milestoneId')
    updateMilestone(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('projectId') pid: string, @Param('milestoneId') mid: string,
        @Body() body: any,
    ) {
        return this.svc.updateMilestone(req.user.userId, cid, pid, mid, body)
    }

    // ─── Budget ───────────────────────────────────────────────────────────────

    @Get(':projectId/budget')
    getProjectBudget(@Req() req: any, @Param('companyId') cid: string, @Param('projectId') pid: string) {
        return this.svc.getProjectBudget(req.user.userId, cid, pid)
    }

    @Put(':projectId/budget')
    updateProjectBudget(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('projectId') pid: string, @Body() body: any,
    ) {
        return this.svc.updateProjectBudget(req.user.userId, cid, pid, body)
    }

    // ─── Tasks ────────────────────────────────────────────────────────────────

    @Get(':projectId/tasks')
    listProjectTasks(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('projectId') pid: string, @Query() q: any,
    ) {
        return this.svc.listProjectTasks(req.user.userId, cid, pid, q)
    }

    @Post(':projectId/tasks')
    createProjectTask(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('projectId') pid: string, @Body() body: any,
    ) {
        return this.svc.createProjectTask(req.user.userId, cid, pid, body)
    }

    // ─── Time Entries ─────────────────────────────────────────────────────────

    @Get(':projectId/time-entries')
    listProjectTimeEntries(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('projectId') pid: string, @Query() q: any,
    ) {
        return this.svc.listProjectTimeEntries(req.user.userId, cid, pid, q)
    }

    @Post(':projectId/time-entries')
    createProjectTimeEntry(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('projectId') pid: string, @Body() body: any,
    ) {
        return this.svc.createProjectTimeEntry(req.user.userId, cid, pid, body)
    }

    // ─── Expenses ─────────────────────────────────────────────────────────────

    @Get(':projectId/expenses')
    listProjectExpenses(@Req() req: any, @Param('companyId') cid: string, @Param('projectId') pid: string) {
        return this.svc.listProjectExpenses(req.user.userId, cid, pid)
    }

    @Post(':projectId/expenses')
    createProjectExpense(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('projectId') pid: string, @Body() body: any,
    ) {
        return this.svc.createProjectExpense(req.user.userId, cid, pid, body)
    }

    // ─── Profitability ────────────────────────────────────────────────────────

    @Get(':projectId/profitability')
    getProjectProfitability(@Req() req: any, @Param('companyId') cid: string, @Param('projectId') pid: string) {
        return this.svc.getProjectProfitability(req.user.userId, cid, pid)
    }

    @Get(':projectId/wip')
    getProjectWip(@Req() req: any, @Param('companyId') cid: string, @Param('projectId') pid: string) {
        return this.svc.getProject(req.user.userId, cid, pid)
    }

    // ─── Flat Retainers (company-wide) ────────────────────────────────────────

    @Get('retainers')
    listAllRetainers(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listAllRetainers(req.user.userId, cid)
    }

    @Post('retainers')
    createFlatRetainer(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createFlatRetainer(req.user.userId, cid, body)
    }

    @Put('retainers/:id')
    updateFlatRetainer(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('id') id: string, @Body() body: any,
    ) {
        return this.svc.updateFlatRetainer(req.user.userId, cid, id, body)
    }

    @Delete('retainers/:id')
    deleteFlatRetainer(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string) {
        return this.svc.deleteFlatRetainer(req.user.userId, cid, id)
    }

    // ─── Resource Plans (company-wide, stored as ProjectTasks) ───────────────

    @Get('resource-plans')
    listResourcePlans(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listResourcePlans(req.user.userId, cid)
    }

    @Post('resource-plans')
    createResourcePlan(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createResourcePlan(req.user.userId, cid, body)
    }

    @Put('resource-plans/:id')
    updateResourcePlan(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('id') id: string, @Body() body: any,
    ) {
        return this.svc.updateResourcePlan(req.user.userId, cid, id, body)
    }

    @Delete('resource-plans/:id')
    deleteResourcePlan(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string) {
        return this.svc.deleteResourcePlan(req.user.userId, cid, id)
    }
}

// ─── Change Orders (flat route under company) ─────────────────────────────────

@Controller('api/companies/:companyId/change-orders')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class ChangeOrdersController {
    constructor(private readonly svc: ProjectsService) { }

    @Get()
    listChangeOrders(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listChangeOrders(req.user.userId, cid, q)
    }

    @Post()
    createChangeOrder(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createChangeOrder(req.user.userId, cid, body)
    }
}

// ─── Project Retainers ───────────────────────────────────────────────────────────

@Controller('api/companies/:companyId/projects/:projectId/retainers')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class ProjectRetainersController {
    constructor(private readonly svc: ProjectsService) { }

    @Get()
    listRetainers(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('projectId') pid: string,
    ) {
        return this.svc.listRetainers(req.user.userId, cid, pid)
    }

    @Post()
    createRetainer(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('projectId') pid: string,
        @Body() body: any,
    ) {
        return this.svc.createRetainer(req.user.userId, cid, pid, body)
    }
}

// ─── Project Billing ─────────────────────────────────────────────────────────────

@Controller('api/companies/:companyId/projects/:projectId/billing')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class ProjectBillingController {
    constructor(private readonly svc: ProjectsService) { }

    @Get()
    listBilling(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('projectId') pid: string,
    ) {
        return this.svc.listBilling(req.user.userId, cid, pid)
    }

    @Post()
    createBilling(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('projectId') pid: string,
        @Body() body: any,
    ) {
        return this.svc.createBilling(req.user.userId, cid, pid, body)
    }
}

// ─── Resource Allocation ─────────────────────────────────────────────────────────

@Controller('api/companies/:companyId/projects/:projectId/resources')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class ResourceAllocationController {
    constructor(private readonly svc: ProjectsService) { }

    @Get()
    listResources(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('projectId') pid: string,
    ) {
        return this.svc.listResourceAllocations(req.user.userId, cid, pid)
    }

    @Post()
    createResource(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('projectId') pid: string,
        @Body() body: any,
    ) {
        return this.svc.createResourceAllocation(req.user.userId, cid, pid, body)
    }
}
