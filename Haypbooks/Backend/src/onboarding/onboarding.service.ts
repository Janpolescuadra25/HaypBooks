import { Injectable, Inject, BadRequestException } from '@nestjs/common'
import { IOnboardingRepository } from '../repositories/interfaces/onboarding.repository.interface'
import { IUserRepository } from '../repositories/interfaces/user.repository.interface'
import { ONBOARDING_REPOSITORY, USER_REPOSITORY } from '../repositories/mock/mock-repositories.module'
import { CompanyService } from '../companies/company.service'
import { increment as incMetric } from '../common/metrics'

@Injectable()
export class OnboardingService {
  constructor(
    @Inject(ONBOARDING_REPOSITORY)
    private readonly onboardingRepository: IOnboardingRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly companyService: CompanyService,
  ) {
    if (!this.companyService) {
      throw new Error('[ONBOARDING] CompanyService must be injected!')
    }
  }

  async saveStep(userId: string, step: string, data: Record<string, any>) {
    await this.onboardingRepository.save(userId, step, data)
    return { success: true }
  }

  async loadProgress(userId: string) {
    const steps = await this.onboardingRepository.load(userId)
    return steps
  }

  async complete(userId: string, onboardingType: 'quick' | 'full' = 'full', hub: 'OWNER' | 'ACCOUNTANT' = 'OWNER') {
    // Ensure required values are present before marking onboarding complete
    const steps = await this.onboardingRepository.load(userId)
    const user = await this.userRepository.findById(userId)

    let createdTenant: any = null

    if (hub === 'OWNER') {
      // Get business name from onboarding steps (backwards-compatible with companyName key)
      const val = steps?.business?.companyName || steps?.business?.businessName
      if (!val) throw new BadRequestException('businessName is required to complete owner onboarding')

      // Normalize business name for Company creation
      const normalized = String(val).trim().slice(0, 140)

      // Persist detected companyName to user profile (best-effort)
      try { await this.userRepository.update(userId, { companyName: normalized }) } catch (e) { /* ignore */ }

      // Best-effort: create a Tenant (Owner Workspace) for the user
      try {
        console.log('[ONBOARDING-COMPLETE] 🚀 Step 1: Starting Tenant creation for userId:', userId)
        const payload: any = {}
        const businessStep = steps?.business || {}
        const fiscalStep = steps?.fiscal || {}
        const taxStep = steps?.tax || {}
        const brandingStep = steps?.branding || {}

        // Include normalized business name on tenant payload so it appears in tenant/company creation trace
        payload.name = normalized

        // Create tenant and TenantUser
        payload.users = { create: [{ userId, role: 'owner', isOwner: true, joinedAt: new Date(), status: 'ACTIVE' }] }
        console.log('[ONBOARDING-COMPLETE] 🚀 Step 2: Calling createCompany (Tenant) with payload:', JSON.stringify(payload, null, 2))

        createdTenant = await this.companyService.createCompany(payload)
        console.log('[ONBOARDING-COMPLETE] ✅ Step 3: Tenant created successfully:', { tenantId: createdTenant?.id })

        // Build Company payload from onboarding steps
        const companyPayload: any = { name: normalized, currency: payload.baseCurrency || 'USD' }
        if (businessStep.legalBusinessName) companyPayload.legalName = businessStep.legalBusinessName
        if (businessStep.startDate) companyPayload.startDate = new Date(businessStep.startDate)
        if (businessStep.country) companyPayload.country = businessStep.country
        if (fiscalStep.fiscalStart) companyPayload.fiscalYearStart = parseInt(fiscalStep.fiscalStart || '') || undefined
        if (businessStep.businessType) companyPayload.businessType = businessStep.businessType
        if (businessStep.industry) companyPayload.industry = businessStep.industry
        if (businessStep.address) companyPayload.address = businessStep.address
        if (taxStep.taxId || taxStep.tin) companyPayload.taxId = taxStep.taxId || taxStep.tin
        if (brandingStep.logo) companyPayload.logoUrl = brandingStep.logo
        if (brandingStep.invoicePrefix) companyPayload.invoicePrefix = brandingStep.invoicePrefix
        if (taxStep.vatRegistered !== undefined) companyPayload.vatRegistered = !!taxStep.vatRegistered
        if (taxStep.collectTax !== undefined) companyPayload.vatRegistered = !!taxStep.collectTax
        if (taxStep.taxRate !== undefined) companyPayload.vatRate = taxStep.taxRate
        if (taxStep.vatRate !== undefined) companyPayload.vatRate = taxStep.vatRate
        if (taxStep.pricesInclusive !== undefined) companyPayload.pricesInclusive = !!taxStep.pricesInclusive
        if (taxStep.inclusive !== undefined) companyPayload.pricesInclusive = !!taxStep.inclusive

        // Attempt to create an actual Company under the tenant (best-effort)
        try {
          console.info('[ONBOARDING] 🚀 Creating Company record:', { tenantId: createdTenant.id, name: normalized })
          const createdCompany = await this.companyService.createCompanyUnderTenant(createdTenant.id, companyPayload)
          console.log('[ONBOARDING-COMPLETE] ✅ Step 6: Company created successfully:', { companyId: createdCompany?.id, name: createdCompany?.name })
          try { incMetric('onboarding.company_creation_success') } catch (mErr) { /* no-op */ }
          if (createdCompany) (createdTenant as any).__createdCompany = createdCompany
          console.info('[ONBOARDING] ✅ Created company record during onboarding:', { companyId: createdCompany?.id, tenantId: createdTenant?.id, name: createdCompany?.name })
        } catch (e) {
          // Non-fatal; we already created the tenant so onboarding can proceed
          console.error('[ONBOARDING] ❌ Failed to create Company record under tenant (non-fatal):', e?.message || e)
          try { incMetric('onboarding.company_creation_failure') } catch (err) { /* no-op */ }

          // Attempt to recover by finding an existing Company associated with this tenant (best-effort)
          try {
            const owned = await this.companyService.listCompaniesForUser(userId, 'owned')
            const existing = (owned || []).find((c: any) => c.tenantId === createdTenant.id)
            if (existing) (createdTenant as any).__createdCompany = existing
          } catch (ex) {
            // ignore
          }
        }
      } catch (e) {
        // Best-effort only: log and continue; failing tenant creation should not block onboarding entirely
        console.warn('Failed to create tenant during onboarding (non-fatal):', e?.message || e)
        try { incMetric('onboarding.company_creation_failure') } catch (err) { /* no-op */ }
      } 

    } else {
      const fromStep = steps?.accountant_firm?.firmName
      const fromProfile = user?.firmName
      const val = typeof fromStep === 'string' && fromStep.trim().length > 0 ? fromStep : (typeof fromProfile === 'string' && fromProfile.trim().length > 0 ? fromProfile : null)
      if (!val) throw new BadRequestException('firmName is required to complete accountant onboarding')
      // Normalize & persist trimmed value
      await this.userRepository.update(userId, { firmName: String(val).trim().slice(0, 140) })
    }

    await this.onboardingRepository.markComplete(userId)
    // Set per-hub onboarding flags (and preserve backward compatibility with global flag)
    const updateData: any = { onboardingMode: onboardingType }
    if (hub === 'ACCOUNTANT') {
      updateData.accountantOnboardingComplete = true
    } else {
      updateData.ownerOnboardingComplete = true
    }
    // Also set the legacy global flag for compatibility
    updateData.onboardingComplete = true
    await this.userRepository.update(userId, updateData)
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
