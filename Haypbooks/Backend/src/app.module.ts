import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { AppThrottlerGuard } from './shared/app-throttler.guard'
import { UsersModule } from './users/users.module'
import { OnboardingModule } from './onboarding/onboarding.module'
import { TestController } from './test/test.controller'
import { HealthController } from './health/health.controller'
import { OwnerController } from './owner/owner.controller'
import { MockRepositoriesModule } from './repositories/mock/mock-repositories.module'
import { PrismaRepositoriesModule } from './repositories/prisma/prisma-repositories.module'
import { TasksModule } from './tasks/tasks.module'
import { AttachmentsModule } from './attachments/attachments.module'
import { TenantsModule } from './tenants/tenants.module'
import { CompanyContextMiddleware } from './shared/company-context.middleware'

const RepositoriesModule = (process.env.USE_MOCK_REPOS === 'true') ? MockRepositoriesModule : PrismaRepositoriesModule

@Module({
  imports: [
    // Global rate limiting: 60 requests per 60-second window per IP
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    RepositoriesModule,
    AuthModule,
    UsersModule,
    OnboardingModule,
    TasksModule,
    AttachmentsModule,
    // Companies module (provides company listing and last-accessed updates)
    (require('./companies/companies.module').CompaniesModule),
    // Tenants module (provides client list and invite management for accountants)
    TenantsModule,
    // Accounting / GL module (Chart of Accounts, Journal Entries, Periods, Trial Balance)
    (require('./accounting/accounting.module').AccountingModule),
    // Accounts Receivable (Customers, Quotes, Invoices, Payments, AR Aging)
    (require('./ar/ar.module').ArModule),
    // Sales facade (exposes /api/companies/:companyId/customers in addition to AR routes)
    (require('./sales/sales.module').SalesModule),
    // Accounts Payable (Vendors, Bills, Bill Payments, Purchase Orders, AP Aging)
    (require('./ap/ap.module').ApModule),
    // Expenses facade (money out) — vendor/bill/bill-payment endpoints.
    (require('./expenses/expenses.module').ExpensesModule),
    // Banking & Cash (Bank Accounts, Transactions, Reconciliation, Deposits)
    (require('./banking/banking.module').BankingModule),
    // Reporting & Analytics (P&L, Balance Sheet, Cash Flow, Budgets, Dashboards)
    (require('./reporting/reporting.module').ReportingModule),
    // Tax & BIR Compliance (Tax Codes/Rates, VAT Returns, Withholding, Form 2307, Alphalist)
    (require('./tax/tax.module').TaxModule),
    // Payroll & HR (Employees, Payroll Runs, Paychecks, Loans)
    (require('./payroll/payroll.module').PayrollModule),
    // Inventory & Fixed Assets (Items, Stock, Transactions, Assets, Depreciation)
    (require('./inventory/inventory.module').InventoryModule),
    // AI & Integrations (Insights, Audit Logs, API Keys, Bank Feed)
    (require('./integrations/integrations.module').IntegrationsModule),
    // Projects & Work In Progress (Projects, Milestones, Budgets, Change Orders, WIP)
    (require('./projects/projects.module').ProjectsModule),
    // Time Tracking (Time Entries, Timesheets, Timer Sessions, Utilization)
    (require('./time/time.module').TimeModule),
    // Organization (Legal Entities, Consolidation Groups, Intercompany Transactions)
    (require('./organization/organization.module').OrganizationModule),
    // Financial Services (Revenue Forecast, Cash Flow, Loans, Credit Lines, Investments)
    (require('./financial-services/financial-services.module').FinancialServicesModule),
    // Practice Hub (Dashboard, Clients, Stats for accounting firms)
    (require('./practice-hub/practice-hub.module').PracticeHubModule),
    // New Practice API endpoints for the /api/practice namespace
    (require('./practice/practice.module').PracticeModule),
  ],
  controllers: [TestController, HealthController, OwnerController],
  providers: [
    // Enforce throttling globally (per-email when available) to keep the system
    // protected but avoid per-IP rate limiting issues during local E2E runs.
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CompanyContextMiddleware)
      .forRoutes('*')
  }
}
