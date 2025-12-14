import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly svc;
    constructor(svc: TasksService);
    create(req: any, payload: CreateTaskDto): Promise<import(".prisma/client").Task>;
    list(req: any, q: any): Promise<import(".prisma/client").Task[]>;
    get(req: any, id: string): Promise<(import(".prisma/client").Task & {
        comments: import(".prisma/client").TaskComment[];
    }) | null>;
    update(req: any, id: string, payload: UpdateTaskDto): Promise<import(".prisma/client").Prisma.BatchPayload>;
    comment(req: any, id: string, payload: {
        comment: string;
    }): Promise<import(".prisma/client").TaskComment>;
}
