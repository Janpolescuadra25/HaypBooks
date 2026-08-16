import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { AppThrottlerGuard } from './shared/app-throttler.guard'
import { UsersModule } from './users/users.module'
import { OnboardingModule } from './onboarding/onboarding.module'
import { TestController } from './test/test.controller'
import { PrismaRepositoriesModule } from './repositories/prisma/prisma-repositories.module'
import { TasksModule } from './tasks/tasks.module'
import { CurrencyModule } from './currency/currency.module'
import { AttachmentsModule } from './attachments/attachments.module'
import { OwnerModule } from './owner/owner.module'
import { R2Module } from './common/r2/r2.module'
import { TenantsModule } from './tenants/tenants.module'
import { CompanyContextMiddleware } from './shared/company-context.middleware'
import { RequestIdMiddleware } from './common/middleware/request-id.middleware'
import { HealthModule } from './health/health.module'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { ZypraModule } from './zypra/zypra.module'

// CUTOVER: use Prisma repositories in all environments by default for production readiness.
// Remove this env-controlled toggle once the mock layer is fully deprecated.
const RepositoriesModule = PrismaRepositoriesModule

@Module({
  imports: [
    // ── Rate Limiting Tiers ──────────────────────────────────
    // General API:   60 req/min  (baseline protection)
    // Login:         5 req/min  (brute-force protection)
    // Signup:        5 req/min  (abuse prevention)
    // Forgot PW:     3 req/min  (spam prevention)
    // Refresh:       10 req/min (normal usage)
    // ─────────────────────────────────────────────────────────
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    RepositoriesModule,
    AuthModule,
    UsersModule,
    OnboardingModule,
    TasksModule,
    R2Module,
    AttachmentsModule,
    OwnerModule,
    // Companies module (provides company listing and last-accessed updates)
    (require('./companies/companies.module').CompaniesModule),
    // Tenants module (provides client list and invite management for accountants)
    TenantsModule,
    CurrencyModule,
    // Accounting / GL module (Chart of Accounts, Journal Entries, Periods, Trial Balance)
    (require('./accounting/accounting.module').AccountingModule),
    // General Ledger (full cross-account GL view with opening/closing balance and running balance)
    (require('./general-ledger/general-ledger.module').GeneralLedgerModule),
    // Contacts module (Customers and Vendors)
    (require('./contacts/contacts.module').ContactsModule),
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
    // Email Templates (saved send templates per company)
    (require('./email-templates/email-templates.module').EmailTemplatesModule),
    ZypraModule,
    HealthModule,
  ],
  controllers: [TestController],
  providers: [
    // Enforce lightweight request logging for every route.
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    // Enforce throttling globally (per-email when available) to keep the system
    // protected but avoid per-IP rate limiting issues during local E2E runs.
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, CompanyContextMiddleware)
      .forRoutes('*')
  }
}
