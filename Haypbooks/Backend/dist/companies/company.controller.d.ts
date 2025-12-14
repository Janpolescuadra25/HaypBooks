import { CompanyService } from './company.service';
export declare class CompaniesController {
    private readonly svc;
    constructor(svc: CompanyService);
    create(body: any): Promise<import(".prisma/client").Tenant>;
    get(id: string): Promise<import(".prisma/client").Tenant | null>;
}
