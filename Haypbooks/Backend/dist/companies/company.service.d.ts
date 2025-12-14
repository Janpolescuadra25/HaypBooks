import { CompanyRepository } from './company.repository.prisma';
export declare class CompanyService {
    private readonly repo;
    constructor(repo: CompanyRepository);
    createCompany(payload: any): Promise<import(".prisma/client").Tenant>;
    getCompany(id: string): Promise<import(".prisma/client").Tenant | null>;
    listCompaniesForUser(userId: string): Promise<import(".prisma/client").Tenant[]>;
}
