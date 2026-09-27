import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Patch,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { AttachmentsService } from './attachments.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { WorkspaceAccessGuard } from '../auth/guards/workspace-access.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'
import { R2Service } from '../common/r2/r2.service'
import { PrismaService } from '../repositories/prisma/prisma.service'

@UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
@Controller('/api')
export class AttachmentsController {
  constructor(
    private readonly svc: AttachmentsService,
    private readonly r2Service: R2Service,
    private readonly prisma: PrismaService,
  ) {}

  @Get('attachments')
  async list(@Req() req: any, @Query('entityType') entityType: string, @Query('entityId') entityId: string) {
    const workspaceId = req.workspaceId
    if (!workspaceId) {
      throw new BadRequestException('Workspace context is required')
    }

    const attachments = await this.svc.list(workspaceId, entityType, entityId)

    return Promise.all(
      attachments.map(async (attachment) => ({
        ...attachment,
        signedUrl: attachment.fileUrl ? await this.r2Service.getPresignedUrl(attachment.fileUrl) : undefined,
      })),
    )
  }

  @Post('attachments')
  async create(@Req() req: any, @Body() body: any) {
    const workspaceId = req.workspaceId
    if (!workspaceId) {
      throw new BadRequestException('Workspace context is required')
    }

    return this.svc.create({
      ...body,
      workspaceId,
    })
  }

  @Post('companies/:companyId/attachments/upload')
  @UseGuards(CompanyAccessGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async upload(@Req() req: any, @Param('companyId') companyId: string, @UploadedFile() file: any, @Body() body: any) {
    if (!file) {
      throw new BadRequestException('File is required')
    }
    if (!body?.entityType || !body?.entityId) {
      throw new BadRequestException('entityType and entityId are required')
    }

    const workspaceId = req.workspaceId ?? req.companyWorkspaceId
    if (!workspaceId) {
      throw new BadRequestException('Workspace context is required')
    }

    const sanitizedName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')
    const key = `attachments/${companyId}/${Date.now()}-${sanitizedName}`

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { workspaceId: true },
    })
    if (!company) {
      throw new NotFoundException('Company not found')
    }

    await this.r2Service.upload(key, file.buffer, file.mimetype)
    const signedUrl = await this.r2Service.getPresignedUrl(key)

    const attachment = await this.svc.create({
      workspaceId,
      entityType: body.entityType,
      entityId: String(body.entityId),
      fileUrl: key,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      uploadedById: req.user?.userId ?? null,
      description: body.description ?? null,
    })

    return {
      ...attachment,
      signedUrl,
    }
  }

  @Get('attachments/:id/url')
  async getAttachmentUrl(@Param('id') id: string, @Req() req: any) {
    const workspaceId = req.workspaceId
    if (!workspaceId) {
      throw new BadRequestException('Workspace context is required')
    }

    const attachment = await this.svc.findById(id)
    if (!attachment || attachment.deletedAt) {
      throw new NotFoundException('Attachment not found')
    }

    if (attachment.workspaceId !== workspaceId) {
      throw new ForbiddenException('Access denied: attachment does not belong to the current workspace')
    }

    const url = await this.r2Service.getPresignedUrl(attachment.fileUrl)
    return { url, fileName: attachment.fileName }
  }

  @Post('companies/:companyId/ap/receipts/upload')
  @UseGuards(CompanyAccessGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async uploadReceipt(
    @Param('companyId') companyId: string,
    @Req() req: any,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided')
    }

    const sanitized = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')
    const key = `receipts/${companyId}/${Date.now()}-${sanitized}`

    await this.r2Service.upload(key, file.buffer, file.mimetype)
    const signedUrl = await this.r2Service.getPresignedUrl(key)

    return {
      fileUrl: key,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      signedUrl,
    }
  }

  @Delete('attachments/:id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const workspaceId = req.workspaceId
    if (!workspaceId) {
      throw new BadRequestException('Workspace context is required')
    }

    const attachment = await this.svc.findById(id)
    if (!attachment || attachment.deletedAt) {
      throw new NotFoundException('Attachment not found')
    }

    if (attachment.workspaceId !== workspaceId) {
      throw new ForbiddenException('Access denied: attachment does not belong to the current workspace')
    }

    if (attachment.uploadedById && req.user?.userId && attachment.uploadedById !== req.user.userId) {
      throw new ForbiddenException('Access denied: only the uploader may delete this attachment')
    }

    return this.svc.softDelete(id)
  }

  @Patch('attachments/:id/public')
  async setPublic(
    @Param('id') id: string,
    @Body() body: { isPublic: boolean },
    @Req() req: any,
  ) {
    const workspaceId = req.workspaceId
    if (!workspaceId) {
      throw new BadRequestException('Workspace context is required')
    }

    const attachment = await this.svc.findById(id)
    if (!attachment || attachment.deletedAt) {
      throw new NotFoundException('Attachment not found')
    }

    if (attachment.workspaceId !== workspaceId) {
      throw new ForbiddenException('Access denied: attachment does not belong to the current workspace')
    }

    if (attachment.uploadedById && req.user?.userId && attachment.uploadedById !== req.user.userId) {
      throw new ForbiddenException('Access denied: only the uploader may modify public visibility')
    }

    return this.svc.setPublic(id, !!body.isPublic)
  }
}
