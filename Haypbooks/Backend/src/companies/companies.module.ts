import { Module } from '@nestjs/common'
import { CompanyService } from './company.service'
import { CompaniesController } from './company.controller'
import { WorkspaceController } from './workspace.controller'
import { CompanyRepository } from './company.repository.prisma'
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { AccountingModule } from '../accounting/accounting.module'
import { MailService } from '../common/mail.service'

@Module({
  imports: [PrismaRepositoriesModule, AccountingModule],
  providers: [CompanyService, CompanyRepository, PrismaService, MailService],
  controllers: [CompaniesController, WorkspaceController],
  exports: [CompanyService],
})
export class CompaniesModule { }

