"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertCompanyBelongsToTenant = assertCompanyBelongsToTenant;
const common_1 = require("@nestjs/common");
async function assertCompanyBelongsToTenant(prisma, companyId, tenantId) {
    if (!companyId)
        return;
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company)
        throw new common_1.BadRequestException('company not found');
    if (company.tenantId !== tenantId)
        throw new common_1.BadRequestException('company does not belong to tenant');
}
//# sourceMappingURL=company-utils.js.map