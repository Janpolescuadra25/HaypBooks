import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator'
import { TaskPriority, TaskStatus } from '@prisma/client'

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  description?: string | null

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus

  @IsISO8601()
  @IsOptional()
  dueDate?: string | null

  @IsString()
  @IsOptional()
  assigneeId?: string | null

  @IsString()
  @IsOptional()
  companyId?: string | null
}
