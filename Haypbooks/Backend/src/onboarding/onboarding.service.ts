import { Injectable, Inject, BadRequestException } from '@nestjs/common'
import { IOnboardingRepository } from '../repositories/interfaces/onboarding.repository.interface'
import { IUserRepository } from '../repositories/interfaces/user.repository.interface'
import { ONBOARDING_REPOSITORY, USER_REPOSITORY } from '../repositories/mock/mock-repositories.module'
import { CompanyService } from '../companies/company.service'
import { TenantsService } from '../tenants/tenants.service'
import { increment as incMetric } from '../common/metrics'

@Injectable()
export class OnboardingService {
  constructor(
    @Inject(ONBOARDING_REPOSITORY)
    private readonly onboardingRepository: IOnboardingRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly companyService: CompanyService,
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

        // If no owner tenant exists (or tenantsService not present), attempt to create a tenant
        // via CompanyService (best-effort); this will create a Tenant and TenantUser for the user
        try {
          const payload: any = { ownerUserId: userId, type: 'OWNER', status: 'ACTIVE' }
          // Prevent legacy backfill from creating a Company record that contains workspace name
          payload.suppressCompanyCreation = true
          // Ensure owner relation is connected for Prisma (avoid raw users array shape)
          payload.owner = { connect: { id: userId } }
          await this.companyService.createCompany(payload)
        } catch (e) {
          // non-fatal
          console.warn('[ONBOARDING-SAVE] Failed to create tenant early (non-fatal):', e?.message || e)
        }
      }

      // If accountant onboarding saves a firm name, attempt to persist it to an accountant tenant
      if (step === 'accountant_firm' && data && data.firmName) {
        const rawFirm = data.firmName
        const normalizedFirm = String(rawFirm).trim().slice(0, 140)

        if (this.tenantsService) {
          try {
            const tenants = await this.tenantsService.listTenantsForUser(userId)
            const accountantTenant = (tenants || []).find((t: any) => t?.type === 'ACCOUNTANT')
            if (accountantTenant && accountantTenant.id) {
              try {
                await this.tenantsService.updateWorkspaceName(accountantTenant.id, normalizedFirm)
              } catch (e) {}
              try {
                await this.tenantsService.updateFirmName(accountantTenant.id, normalizedFirm)
              } catch (e) {}
              return { success: true }
            }
          } catch (e) {
            console.warn('[ONBOARDING-SAVE] Failed to update existing accountant tenant (non-fatal):', e?.message || e)
          }
        }

        // If no accountant tenant exists, attempt to create one (best-effort)
        try {
          const payload: any = { ownerUserId: userId, firmName: normalizedFirm, type: 'ACCOUNTANT', status: 'ACTIVE' }
          // Prevent backfill company creation for early accountant tenant creation
          payload.suppressCompanyCreation = true
          // Connect owner explicitly
          payload.owner = { connect: { id: userId } }
          await this.companyService.createCompany(payload)
          return { success: true }
        } catch (e) {
          console.warn('[ONBOARDING-SAVE] Failed to create accountant tenant early (non-fatal):', e?.message || e)
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

  async complete(userId: string, onboardingType: 'quick' | 'full' = 'full', hub: 'OWNER' | 'ACCOUNTANT' = 'OWNER') {
    // Ensure required values are present before marking onboarding complete
    const steps = await this.onboardingRepository.load(userId)
    const user = await this.userRepository.findById(userId)

    let createdTenant: any = null

    if (hub === 'OWNER') {
      // Get workspace name from owner workspace step (fallback to business step)
      const workspaceVal = steps?.owner_workspace?.workspaceName || steps?.business?.workspaceName || steps?.business?.companyName || steps?.business?.businessName
      if (!workspaceVal) throw new BadRequestException('businessName is required to complete owner onboarding')

      // Prefer business step for company name; fallback to workspace name
      const companyVal = steps?.business?.companyName || steps?.business?.businessName || steps?.business?.workspaceName || steps?.owner_workspace?.workspaceName

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

      // Best-effort: create a Tenant (Owner Workspace) for the user
      try {
        console.log('[ONBOARDING-COMPLETE] 🚀 Step 1: Starting Tenant creation for userId:', userId)
        const payload: any = {}
        const businessStep = steps?.business || {}
        const fiscalStep = steps?.fiscal || {}
        const taxStep = steps?.tax || {}
        const brandingStep = steps?.branding || {}

        // Set owner and workspace type/status; avoid passing legacy `workspaceName` field
        payload.ownerUserId = userId
        payload.owner = { connect: { id: userId } }
        payload.type = 'OWNER'
        payload.status = 'ACTIVE'

        // Determine whether we have a true business/company step (company should be created)
        const hasBusinessCompany = !!(businessStep && (businessStep.companyName || businessStep.businessName || businessStep.legalBusinessName))

        // If no business/company details were provided, suppress backfill when creating tenant
        if (!hasBusinessCompany) payload.suppressCompanyCreation = true

        // Do not use raw users array here (Prisma expects Role/roleId); we connected owner explicitly above
        console.log('[ONBOARDING-COMPLETE] 🚀 Step 2: Calling createCompany (Tenant) with payload:', JSON.stringify(payload, null, 2))

        // Actually create the tenant (owner workspace) and capture the created tenant object
        try {
          createdTenant = await this.companyService.createCompany(payload)
          console.log('[ONBOARDING-COMPLETE] ✅ Step 3: Tenant created successfully:', { workspaceId: createdTenant?.id })
        } catch (e) {
          console.error('[ONBOARDING-COMPLETE] ❌ Failed to create tenant (non-fatal):', e?.message || e)
        }

        // Build Company payload from onboarding steps
        const companyPayload: any = { name: normalizedCompany, currency: payload.baseCurrency || 'USD' }
        if (businessStep.legalBusinessName) companyPayload.legalName = businessStep.legalBusinessName
        if (businessStep.startDate) companyPayload.startDate = new Date(businessStep.startDate)
        // Default to PH when not provided
        companyPayload.country = businessStep.country || 'PH'
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
        if (hasBusinessCompany) {
          try {
            console.info('[ONBOARDING] 🚀 Creating Company record:', { workspaceId: createdTenant.id, name: normalizedCompany })
            const createdCompany = await this.companyService.createCompanyUnderTenant(createdTenant.id, companyPayload)
            console.log('[ONBOARDING-COMPLETE] ✅ Step 6: Company created successfully:', { companyId: createdCompany?.id, name: createdCompany?.name })
            try { incMetric('onboarding.company_creation_success') } catch (mErr) { /* no-op */ }
            if (createdCompany) (createdTenant as any).__createdCompany = createdCompany
            console.info('[ONBOARDING] ✅ Created company record during onboarding:', { companyId: createdCompany?.id, workspaceId: createdTenant?.id, name: createdCompany?.name })
          } catch (e) {
            // Non-fatal; we already created the tenant so onboarding can proceed
            console.error('[ONBOARDING] ❌ Failed to create Company record under tenant (non-fatal):', e?.message || e)
            try { incMetric('onboarding.company_creation_failure') } catch (err) { /* no-op */ }

            // Attempt to recover by finding an existing Company associated with this tenant (best-effort)
            try {
              const owned = await this.companyService.listCompaniesForUser(userId, 'owned')
              const existing = (owned || []).find((c: any) => c.workspaceId === createdTenant.id)
              if (existing) (createdTenant as any).__createdCompany = existing
            } catch (ex) {
              // ignore
            }
          }
        } else {
          // No company details present — do not create a Company record under this tenant
          console.info('[ONBOARDING] Skipping Company creation because no business/company step data supplied')
        }
      } catch (e) {
        // Best-effort only: log and continue; failing tenant creation should not block onboarding entirely
        console.warn('Failed to create tenant during onboarding (non-fatal):', e?.message || e)
        try { incMetric('onboarding.company_creation_failure') } catch (err) { /* no-op */ }
      } 

    } else {
      const fromStep = steps?.accountant_firm?.firmName
      const val = typeof fromStep === 'string' && fromStep.trim().length > 0 ? fromStep : null
      if (!val) throw new BadRequestException('firmName is required to complete accountant onboarding')
      // Normalize & persist trimmed value on the accountant tenant
      const normalizedFirm = String(val).trim().slice(0, 140)
      try {
        // Try to update existing accountant tenant first
        if (this.tenantsService) {
          const tenants = await this.tenantsService.listTenantsForUser(userId)
          const accountantTenant = (tenants || []).find((t: any) => t?.type === 'ACCOUNTANT')
          if (accountantTenant?.id) {
            await this.tenantsService.updateWorkspaceName(accountantTenant.id, normalizedFirm)
            try { await this.tenantsService.updateFirmName(accountantTenant.id, normalizedFirm) } catch (e) {}
          } else {
            // Create a firm tenant if none exists (best-effort)
            const payload: any = { ownerUserId: userId, firmName: normalizedFirm, type: 'ACCOUNTANT', status: 'ACTIVE' }
            payload.owner = { connect: { id: userId } }
            await this.companyService.createCompany(payload)
          }
        }
      } catch (e) {
        // non-fatal; onboarding can still complete
        console.warn('[ONBOARDING-COMPLETE] Failed to persist firmName on tenant (non-fatal):', e?.message || e)
      }
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
