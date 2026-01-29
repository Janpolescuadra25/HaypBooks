import { Controller, Post, Body, UseGuards, Request, Get, Query, Param, Patch } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'

@Controller('api/tasks')
export class TasksController {
  constructor(private readonly svc: TasksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() payload: CreateTaskDto) {
    const tenantId = (payload as any).workspaceId || req.user?.workspaceId
    return this.svc.createTask(tenantId, payload)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Request() req, @Query() q: any) {
    const tenantId = q.workspaceId || req.user?.workspaceId
    return this.svc.listTasks(tenantId, q)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async get(@Request() req, @Param('id') id: string) {
    const tenantId = req.user?.workspaceId
    return this.svc.getTask(tenantId, id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Request() req, @Param('id') id: string, @Body() payload: UpdateTaskDto) {
    const tenantId = (payload as any).workspaceId || req.user?.workspaceId
    return this.svc.updateTask(tenantId, id, payload)
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async comment(@Request() req, @Param('id') id: string, @Body() payload: { comment: string }) {
    const tenantId = req.user?.workspaceId
    return this.svc.addComment(tenantId, id, req.user?.id, payload.comment)
  }
}
