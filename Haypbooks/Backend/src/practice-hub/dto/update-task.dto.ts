import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator'
import { TaskPriority, TaskStatus } from '@prisma/client'

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus

  @IsISO8601()
  @IsOptional()
  dueDate?: string

  @IsString()
  @IsOptional()
  assigneeId?: string

  @IsString()
  @IsOptional()
  companyId?: string
}
