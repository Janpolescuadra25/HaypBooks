import { PayrollService } from './payroll.service';
export declare class PayrollController {
    private readonly payroll;
    constructor(payroll: PayrollService);
    preview(body: any): Promise<any[]>;
    submit(body: any): Promise<{
        payrollRun: import(".prisma/client").PayrollRun;
        paychecks: any[];
    }>;
}
