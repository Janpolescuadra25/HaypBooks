import { Body, Controller, Delete, Get, Param, Post, Query, Patch, BadRequestException, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { AttachmentsService } from './attachments.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller('/api')
export class AttachmentsController {
  constructor(private readonly svc: AttachmentsService) {}

  @Get('attachments')
  async list(@Query('tenantId') workspaceId: string, @Query('entityType') entityType: string, @Query('entityId') entityId: string) {
    return this.svc.list(workspaceId, entityType, entityId)
  }

  @Post('attachments')
  async create(@Body() body: any) {
    // body expected to include tenantId, entityType, entityId, fileUrl, optional metadata
    return this.svc.create(body)
  }

  @Post('companies/:companyId/attachments/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          const uploadPath = join(process.cwd(), 'uploads', 'attachments')
          mkdirSync(uploadPath, { recursive: true })
          callback(null, uploadPath)
        },
        filename: (_req, file, callback) => {
          const safeName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')
          callback(null, `${Date.now()}-${safeName}`)
        },
      }),
    }),
  )
  async upload(@Req() req: any, @Param('companyId') companyId: string, @UploadedFile() file: any, @Body() body: any) {
    if (!file) {
      throw new BadRequestException('File is required')
    }
    if (!body?.entityType || !body?.entityId) {
      throw new BadRequestException('entityType and entityId are required')
    }
    const fileUrl = `/uploads/attachments/${file.filename}`
    return this.svc.create({
      workspaceId: companyId,
      entityType: body.entityType,
      entityId: body.entityId,
      fileUrl,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      uploadedById: req.user?.userId ?? null,
      description: body.description ?? null,
    })
  }

  @Delete('attachments/:id')
  async remove(@Param('id') id: string) {
    return this.svc.softDelete(id)
  }

  @Patch('attachments/:id/public')
  async setPublic(@Param('id') id: string, @Body() body: { isPublic: boolean }) {
    return this.svc.setPublic(id, !!body.isPublic)
  }
}
