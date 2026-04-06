import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common'
import { IOnboardingRepository } from '../repositories/interfaces/onboarding.repository.interface'
import { IUserRepository } from '../repositories/interfaces/user.repository.interface'
import { ONBOARDING_REPOSITORY, USER_REPOSITORY } from '../repositories/mock/mock-repositories.module'
import { CompanyService } from '../companies/company.service'
import { TenantsService } from '../tenants/tenants.service'
import { AccountingService } from '../accounting/accounting.service'
import { increment as incMetric } from '../common/metrics'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name)

  constructor(
    @Inject(ONBOARDING_REPOSITORY)
    private readonly onboardingRepository: IOnboardingRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly companyService: CompanyService,
    private readonly accountingService: AccountingService,
    private readonly prisma: PrismaService,
    // Optional: TenantsService is injected so we can update workspaceName early on saveStep
    private readonly tenantsService?: TenantsService,
  ) {
    if (!this.companyService) {
      throw new Error('[ONBOARDING] CompanyService must be injected!')
    }
  }

  async saveStep(userId: string, step: string, data: Record<string, any>) {
    await this.onboardingRepository.save(userId, step, data)

    // If the owner workspace step includes a workspace name, attempt to persist it
    // immediately to the owning tenant (if exists) or create an owner Tenant early
    try {
      if (step === 'owner_workspace' && data && data.workspaceName) {
        const rawName = data.workspaceName
        const normalized = String(rawName).trim().slice(0, 140)

        // If TenantsService is available, try to update existing owner tenant
        if (this.tenantsService) {
          try {
            const tenants = await this.tenantsService.listTenantsForUser(userId)
            const ownerTenant = (tenants || []).find((t: any) => !!t.isOwner)
            if (ownerTenant) {
              await this.tenantsService.updateWorkspaceName(ownerTenant.id, normalized)
              return { success: true }
            }
          } catch (e) {
            // ignore tenant lookup/update failures
            console.warn('[ONBOARDING-SAVE] Failed to update existing tenant workspaceName (non-fatal):', e?.message || e)
          }
        }

        // If no owner tenant exists, create a OWNER workspace directly using valid Workspace fields only
        try {
          await this.prisma.workspace.create({
            data: {
              ownerUserId: userId,
              type: 'OWNER' as any,
              status: 'ACTIVE' as any,
            }
          })
        } catch (e) {
          // non-fatal
          console.warn('[ONBOARDING-SAVE] Failed to create tenant early (non-fatal):', e?.message || e)
        }
      }

      // If accountant onboarding saves a firm name, attempt to persist it to an accountant tenant
      // Note: PracticeProfile sends the field as `name`; support both `firmName` (legacy) and `name`
      const firmNameFromData = data?.firmName ?? data?.name ?? null
      if (step === 'accountant_firm' && firmNameFromData) {
        const rawFirm = firmNameFromData
        const normalizedFirm = String(rawFirm).trim().slice(0, 140)

        // Look up workspace by ownerUserId directly (avoids WorkspaceUser table)
        try {
          const existingWs = await this.prisma.workspace.findFirst({ where: { ownerUserId: userId } })
          if (existingWs) {
            // Workspace exists — ensure/update Practice record
            const existingPractice = await this.prisma.practice.findFirst({ where: { workspaceId: existingWs.id } })
            if (existingPractice) {
              try { await this.prisma.practice.update({ where: { id: existingPractice.id }, data: { name: normalizedFirm, displayName: normalizedFirm } }) } catch (e) { }
            } else {
              try { await this.prisma.practice.create({ data: { name: normalizedFirm, displayName: normalizedFirm, workspaceId: existingWs.id } }) } catch (e) { }
            }
            return { success: true }
          }
        } catch (e) {
          console.warn('[ONBOARDING-SAVE] Failed to update existing workspace/practice (non-fatal):', e?.message || e)
        }

        // No workspace yet — create a PRACTICE workspace and Practice record (best-effort)
        try {
          const newWs = await this.prisma.workspace.create({
            data: {
              ownerUserId: userId,
              type: 'PRACTICE' as any,
              status: 'ACTIVE' as any,
            }
          })
          try {
            await this.prisma.practice.create({ data: { name: normalizedFirm, displayName: normalizedFirm, workspaceId: newWs.id } })
          } catch (practiceErr) { /* non-fatal */ }
          return { success: true }
        } catch (e) {
          console.warn('[ONBOARDING-SAVE] Failed to create accountant workspace (non-fatal):', e?.message || e)
        }
      }

    } catch (e) {
      // best-effort only
      console.warn('[ONBOARDING-SAVE] post-save workspaceName propagation failed (non-fatal):', e?.message || e)
    }

    return { success: true }
  }

  async loadProgress(userId: string) {
    const steps = await this.onboardingRepository.load(userId)
    return steps
  }

  async complete(userId: string, onboardingType: 'quick' | 'full' = 'full', hub: 'OWNER' | 'ACCOUNTANT' = 'OWNER', mode: 'append' | 'replace' = 'replace', practiceName?: string, companyName?: string) {
    // Ensure required values are present before marking onboarding complete
    const steps = await this.onboardingRepository.load(userId)
    const user = await this.userRepository.findById(userId)

    let createdTenant: any = null

    if (hub === 'OWNER') {
      // Get workspace name from owner workspace step (fallback to business step)
      const workspaceVal = steps?.owner_workspace?.workspaceName || steps?.business?.workspaceName || steps?.business?.companyName || steps?.business?.businessName
      if (!workspaceVal) throw new BadRequestException('businessName is required to complete owner onboarding')

      // Prefer explicit companyName payload, then business step, then workspace name
      const companyVal = companyName?.trim() || steps?.business?.companyName || steps?.business?.businessName || steps?.business?.workspaceName || steps?.owner_workspace?.workspaceName

      // Normalize names
      const normalizedWorkspace = String(workspaceVal).trim().slice(0, 140)
      const normalizedCompany = String(companyVal || workspaceVal).trim().slice(0, 140)

      // Persist detected companyName to user profile only if it came from businessName/companyName
      try {
        const sourceWasWorkspace = !!(steps?.owner_workspace?.workspaceName || steps?.business?.workspaceName)
        if (!sourceWasWorkspace) {
          await this.userRepository.update(userId, { companyName: normalizedCompany })
        }
      } catch (e) { /* ignore */ }

      // Best-effort: ensure an Owner Workspace exists, create Company record, seed COA, and create bank account inside a single transaction.
      let createdCompanyId: string | null = null
      let ownerWorkspaceId: string | null = null
      try {
        this.logger.log('[ONBOARDING-COMPLETE] 🚀 Step 1: Upserting workspace and company for userId: ' + userId)
        const businessStep = steps?.business || {}
        const fiscalStep = steps?.fiscal_tax || steps?.fiscal || {}
        const taxStep = steps?.tax || {}
        const brandingStep = steps?.branding || {}

        await this.prisma.$transaction(async (tx) => {
          let workspaceId: string | null = null
          const existingWorkspace = await tx.workspace.findFirst({ where: { ownerUserId: userId } })
          if (existingWorkspace) {
            workspaceId = existingWorkspace.id
            this.logger.log('[ONBOARDING-COMPLETE] ✅ Found existing workspace: ' + workspaceId)
          } else {
            const newWorkspace = await tx.workspace.create({
              data: {
                ownerUserId: userId,
                type: 'OWNER',
                status: 'ACTIVE',
              }
            })
            workspaceId = newWorkspace.id
            createdTenant = newWorkspace
            this.logger.log('[ONBOARDING-COMPLETE] ✅ Created new workspace: ' + workspaceId)
          }

          ownerWorkspaceId = workspaceId

          if (workspaceId) {
            const roleName = 'Owner'
            let roleRecord = await tx.role.findFirst({ where: { workspaceId, name: { equals: roleName, mode: 'insensitive' } } })
            if (!roleRecord) {
              roleRecord = await tx.role.create({ data: { workspaceId, name: roleName } })
            }
            const roleId = roleRecord.id

            const existingUser = await tx.workspaceUser.findFirst({ where: { workspaceId, userId } })
            if (existingUser) {
              await tx.workspaceUser.update({
                where: { workspaceId_userId: { workspaceId, userId } },
                data: {
                  status: 'ACTIVE',
                  isOwner: true,
                  joinedAt: new Date(),
                  Role: { connect: { id: roleId } },
                },
              })
            } else {
              await tx.workspaceUser.create({
                data: {
                  workspace: { connect: { id: workspaceId } },
                  user: { connect: { id: userId } },
                  Role: { connect: { id: roleId } },
                  isOwner: true,
                  joinedAt: new Date(),
                  status: 'ACTIVE',
                } as any,
              })
            }

            const existingCompany = await tx.company.findFirst({ where: { workspaceId } })
            const effectiveCompanyName = (businessStep && (businessStep.businessName || businessStep.companyName || normalizedCompany)) || `Workspace ${workspaceId}`

            const COUNTRY_NAME_TO_ISO2: Record<string, string> = {
              'Philippines': 'PH', 'United States': 'US', 'United Kingdom': 'GB',
              'Australia': 'AU', 'Canada': 'CA', 'Singapore': 'SG', 'Malaysia': 'MY',
              'Indonesia': 'ID', 'Thailand': 'TH', 'Vietnam': 'VN', 'Japan': 'JP',
              'South Korea': 'KR', 'China': 'CN', 'India': 'IN', 'Germany': 'DE',
              'France': 'FR', 'Spain': 'ES', 'Italy': 'IT', 'Netherlands': 'NL',
              'Brazil': 'BR', 'Mexico': 'MX', 'Other': '', '': '',
            }
            const rawCountry = businessStep?.country || 'PH'
            const countryCode = (COUNTRY_NAME_TO_ISO2[rawCountry] ?? rawCountry).toUpperCase()

            let resolvedCountryId: string | undefined = undefined
            try {
              const countryRow = await tx.country.findFirst({ where: { code: countryCode as any } })
              if (countryRow?.id) resolvedCountryId = countryRow.id
            } catch { /* Country code may not be a valid enum value — proceed without countryId */ }

            const monthNames: Record<string, number> = {
              January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
              July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
            }
            const fiscalStartMonth = monthNames[(fiscalStep?.fiscalStart ?? '').toString()] || undefined

            const countryCurrency: Record<string, string> = {
              PH: 'PHP', US: 'USD', AU: 'AUD', GB: 'GBP', CA: 'CAD', SG: 'SGD',
              MY: 'MYR', ID: 'IDR', TH: 'THB', VN: 'VND', JP: 'JPY', KR: 'KRW',
              CN: 'CNY', DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR',
              BR: 'BRL', MX: 'MXN',
            }
            const finalCurrency = (fiscalStep?.currency as string) || countryCurrency[countryCode] || 'USD'

            if (mode === 'append' || !existingCompany) {
              const created = await tx.company.create({
                data: {
                  name: effectiveCompanyName,
                  workspaceId,
                  isActive: true,
                  ...(resolvedCountryId ? { countryId: resolvedCountryId } : {}),
                  ...(businessStep?.businessType ? { businessType: businessStep.businessType } : {}),
                  ...(businessStep?.industry ? { industry: businessStep.industry } : {}),
                  currency: finalCurrency,
                  ...(fiscalStartMonth ? { fiscalYearStart: fiscalStartMonth } : {}),
                  ...(fiscalStep?.accountingMethod ? { accountingMethod: fiscalStep.accountingMethod } : {}),
                  ...(taxStep?.taxId ? { taxId: taxStep.taxId } : {}),
                  ...(taxStep?.taxRate ? { vatRate: Number(taxStep.taxRate) } : {}),
                  ...(typeof taxStep?.pricesInclusive === 'boolean' ? { pricesInclusive: taxStep.pricesInclusive } : {}),
                },
              } as any)

              this.logger.log('[ONBOARDING-COMPLETE] ✅ Created Company record: ' + effectiveCompanyName + ' (' + created.id + ')')
              createdCompanyId = created.id
              if (!createdTenant) createdTenant = { id: workspaceId, __createdCompany: created }
              else (createdTenant as any).__createdCompany = created
            } else {
              const updated = await tx.company.update({
                where: { id: existingCompany!.id },
                data: { name: effectiveCompanyName },
              })
              this.logger.log('[ONBOARDING-COMPLETE] 🔁 Updated existing Company record for replace mode: ' + updated.id)
              createdCompanyId = updated.id
              if (!createdTenant) createdTenant = { id: workspaceId, __createdCompany: updated }
              else (createdTenant as any).__createdCompany = updated
            }

            const step5Data = steps?.coa || {}
            if (createdCompanyId) {
              await this.accountingService.seedDefaultAccounts(createdCompanyId, tx, { industry: businessStep?.industry ?? undefined })
              this.logger.log('[ONBOARDING-COMPLETE] ✅ COA seeded for company: ' + createdCompanyId)
            }

            const step6Data = steps?.bank || {}
            if (step6Data?.bankName && ownerWorkspaceId) {
              await tx.bankAccount.create({
                data: {
                  workspaceId: ownerWorkspaceId,
                  name: step6Data.bankName,
                  institution: step6Data.bankInstitution || null,
                  accountNumber: step6Data.accountNumber || null,
                  routingNumber: step6Data.routingNumber || null,
                  isDefault: true,
                },
              })
              this.logger.log('[ONBOARDING-COMPLETE] ✅ Bank account created for workspace: ' + ownerWorkspaceId)
            }
          }
        })
      } catch (e) {
        this.logger.warn('[ONBOARDING-COMPLETE] Onboarding workspace/company/financial setup failed: ' + (e?.message || e))
        incMetric('onboarding.company_creation_failure')
        throw e
      }

    } else {
      // Support explicit practiceName payload, PracticeProfile `name`, and legacy `firmName`
      const fromStep = practiceName?.trim() || steps?.accountant_firm?.name || steps?.accountant_firm?.firmName
      const val = typeof fromStep === 'string' && fromStep.trim().length > 0 ? fromStep : null
      if (!val) throw new BadRequestException('Practice name is required to complete onboarding')
      // Normalize & persist trimmed value on the accountant tenant
      const normalizedFirm = String(val).trim().slice(0, 140)
      try {
        // Look up workspace by ownerUserId directly (avoids WorkspaceUser table which doesn't include type)
        const existingWorkspace = await this.prisma.workspace.findFirst({ where: { ownerUserId: userId } })
        if (existingWorkspace) {
          createdTenant = existingWorkspace
          this.logger.log('[ONBOARDING-COMPLETE] ✅ Found existing workspace for accountant: ' + existingWorkspace.id)
          // Create or update Practice rows depending on mode
          try {
            const existingPractice = await this.prisma.practice.findFirst({ where: { workspaceId: existingWorkspace.id } })
            if (mode === 'append' || !existingPractice) {
              await this.prisma.practice.create({ data: { name: normalizedFirm, workspaceId: existingWorkspace.id } })
              this.logger.log('[ONBOARDING-COMPLETE] ✅ Created new Practice record: ' + normalizedFirm)
            } else {
              await this.prisma.practice.update({ where: { id: existingPractice.id }, data: { name: normalizedFirm } })
              this.logger.log('[ONBOARDING-COMPLETE] ✅ Updated existing Practice record: ' + normalizedFirm)
            }
          } catch (e) {
            this.logger.warn('[ONBOARDING-COMPLETE] Practice record change failed (non-fatal): ' + (e as any)?.message)
          }
        } else {
          // No workspace yet — create a PRACTICE workspace
          const newPracticeWorkspace = await this.prisma.workspace.create({
            data: {
              ownerUserId: userId,
              type: 'PRACTICE' as any,
              status: 'ACTIVE' as any,
            }
          })
          createdTenant = newPracticeWorkspace
          this.logger.log('[ONBOARDING-COMPLETE] ✅ Created PRACTICE workspace: ' + newPracticeWorkspace.id)
          // Create a Practice record under the new workspace
          try {
            await this.prisma.practice.create({ data: { name: normalizedFirm, workspaceId: newPracticeWorkspace.id } })
            this.logger.log('[ONBOARDING-COMPLETE] ✅ Created Practice record: ' + normalizedFirm)
          } catch (practiceErr) {
            this.logger.warn('[ONBOARDING-COMPLETE] Practice record creation failed (non-fatal): ' + (practiceErr as any)?.message)
          }
        }
      } catch (e) {
        // non-fatal; onboarding can still complete
        console.warn('[ONBOARDING-COMPLETE] Failed to persist firmName on tenant (non-fatal):', e?.message || e)
      }
    }

    await this.onboardingRepository.markComplete(userId)
    // Update user's preferredHub to match the onboarding hub they just completed
    // Note: onboardingComplete/ownerOnboardingComplete/accountantOnboardingComplete fields
    // do NOT exist on the User model — completion is tracked via OnboardingData.complete and cookies
    try {
      const preferredHub = hub === 'ACCOUNTANT' ? 'ACCOUNTANT' : 'OWNER'
      await this.userRepository.update(userId, { preferredHub } as any)
    } catch (e) {
      this.logger.warn('[ONBOARDING-COMPLETE] User preferredHub update failed (non-fatal): ' + (e?.message || e))
    }
    // Return the created company (if any) for callers; fall back to tenant when necessary
    const createdCompany = (createdTenant as any)?.__createdCompany || null
    if (createdCompany) return { success: true, company: createdCompany }
    // Fallback: return tenant when company not created (legacy behavior)
    return { success: true, company: createdTenant || null }
  }

  async isComplete(userId: string) {
    return this.onboardingRepository.isComplete(userId)
  }
}
