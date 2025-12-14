import { PrismaService } from '../repositories/prisma/prisma.service';
import { JournalService } from '../accounting/journal.service';
type EmployeeHours = {
    employeeId: string;
    hours: number;
};
export declare class PayrollService {
    private prisma;
    private journal;
    constructor(prisma: PrismaService, journal: JournalService);
    calculate(tenantId: string, rows: EmployeeHours[]): Promise<any[]>;
    submit(tenantId: string, payload: {
        rows: EmployeeHours[];
        startDate: string;
        endDate: string;
        description?: string;
    }): Promise<{
        payrollRun: import(".prisma/client").PayrollRun;
        paychecks: any[];
    }>;
}
export {};
