export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    dueDate?: string | null;
    remindAt?: string | null;
    assigneeId?: string | null;
    status?: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED' | 'CANCELLED';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}
