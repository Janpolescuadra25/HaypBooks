import {
    Controller, Get, Post, Put, Delete,
    Body, Param, UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common'
import { EmailTemplatesService } from './email-templates.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller('api/companies/:companyId/email-templates')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class EmailTemplatesController {
    constructor(private readonly svc: EmailTemplatesService) { }

    @Get()
    list(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listTemplates(req.user.userId, cid)
    }

    @Get(':templateId')
    get(@Req() req: any, @Param('companyId') cid: string, @Param('templateId') tid: string) {
        return this.svc.getTemplate(req.user.userId, cid, tid)
    }

    @Post()
    create(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createTemplate(req.user.userId, cid, body)
    }

    @Put(':templateId')
    update(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('templateId') tid: string,
        @Body() body: any,
    ) {
        return this.svc.updateTemplate(req.user.userId, cid, tid, body)
    }

    @Delete(':templateId')
    @HttpCode(HttpStatus.OK)
    remove(@Req() req: any, @Param('companyId') cid: string, @Param('templateId') tid: string) {
        return this.svc.deleteTemplate(req.user.userId, cid, tid)
    }
}
