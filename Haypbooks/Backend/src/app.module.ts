import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { OnboardingModule } from './onboarding/onboarding.module'
import { TestController } from './test/test.controller'
import { HealthController } from './health/health.controller'
import { BillsModule } from './accounting/bills.module'
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module'
import { InventoryModule } from './inventory/inventory.module'
import { MockRepositoriesModule } from './repositories/mock/mock-repositories.module'
import { PrismaRepositoriesModule } from './repositories/prisma/prisma-repositories.module'
import { PayrollModule } from './payroll/payroll.module'
import { TasksModule } from './tasks/tasks.module'
import { AttachmentsModule } from './attachments/attachments.module'

const RepositoriesModule = (process.env.USE_MOCK_REPOS === 'true') ? MockRepositoriesModule : PrismaRepositoriesModule

@Module({
  imports: [
    RepositoriesModule,
    AuthModule,
    UsersModule,
    OnboardingModule,
    // AccountantModule removed: migrating to unified Companies & TenantUser model
    BillsModule,
    PurchaseOrdersModule,
    InventoryModule,
    PayrollModule,
    TasksModule,
    AttachmentsModule,
    // Companies module (provides company listing and last-accessed updates)
    (require('./companies/companies.module').CompaniesModule),
  ],
  controllers: [TestController, HealthController],
})
export class AppModule {}
