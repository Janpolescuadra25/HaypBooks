export class CreateTaskDto {
  title!: string
  description?: string
  dueDate?: string
  remindAt?: string
  assigneeId?: string
  relatedType?: string
  relatedId?: string
  priority?: 'LOW'|'MEDIUM'|'HIGH'|'URGENT'
}
