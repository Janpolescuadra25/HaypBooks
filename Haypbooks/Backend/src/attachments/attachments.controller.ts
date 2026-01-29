import { Body, Controller, Delete, Get, Param, Post, Query, Patch } from '@nestjs/common'
import { AttachmentsService } from './attachments.service'

@Controller('/api/attachments')
export class AttachmentsController {
  constructor(private readonly svc: AttachmentsService) {}

  @Get()
  async list(@Query('tenantId') workspaceId: string, @Query('entityType') entityType: string, @Query('entityId') entityId: string) {
    return this.svc.list(workspaceId, entityType, entityId)
  }

  @Post()
  async create(@Body() body: any) {
    // body expected to include tenantId, entityType, entityId, fileUrl, optional metadata
    return this.svc.create(body)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.svc.softDelete(id)
  }

  @Patch(':id/public')
  async setPublic(@Param('id') id: string, @Body() body: { isPublic: boolean }) {
    return this.svc.setPublic(id, !!body.isPublic)
  }
}
