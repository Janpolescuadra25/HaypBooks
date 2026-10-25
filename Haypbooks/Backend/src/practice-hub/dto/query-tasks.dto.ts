import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { TaskPriority, TaskStatus } from '@prisma/client'

export class QueryTasksDto {
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority

  @IsString()
  @IsOptional()
  assigneeId?: string

  @IsString()
  @IsOptional()
  companyId?: string

  @IsString()
  @IsOptional()
  search?: string

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 20
}
