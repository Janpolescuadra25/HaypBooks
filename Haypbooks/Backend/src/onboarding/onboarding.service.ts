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
      const fromStep = steps?.business?.companyName
      const fromProfile = user?.companyName
      const val = typeof fromStep === 'string' && fromStep.trim().length > 0 ? fromStep : (typeof fromProfile === 'string' && fromProfile.trim().length > 0 ? fromProfile : null)
      if (!val) throw new BadRequestException('companyName is required to complete owner onboarding')

      // Normalize & persist trimmed value
      const normalized = String(val).trim().slice(0, 140)
      await this.userRepository.update(userId, { companyName: normalized })

      // Best-effort: create a Tenant (company) for the user so the Owner Hub shows a card
      // Use a simple slugify for subdomain generation and attach the creating user as the owner
      try {
        const slug = normalized.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) || undefined
        const payload: any = { name: normalized }
        if (slug) payload.subdomain = slug
          // Include onboarding-supplied business details where available
          const businessStep = steps?.business || {}
          const fiscalStep = steps?.fiscal || {}
          const taxStep = steps?.tax || {}
          const brandingStep = steps?.branding || {}

          // Keep only non-onboarding tenant properties. The detailed onboarding
          // fields (businessType, industry, tax details, branding, etc.) are
          // stored in the OnboardingStep table and are intentionally **not**
          // copied into the Tenant record to avoid denormalizing ephemeral
          // onboarding input into the tenancy table.
          if (fiscalStep.fiscalStart) payload.fiscalStart = fiscalStep.fiscalStart
        // Create tenant and create TenantUser at creation time (nested create)
        payload.users = { create: [{ userId, role: 'owner', isOwner: true, joinedAt: new Date(), status: 'ACTIVE' }] }
        // Capture the created tenant so callers can act deterministically
        try {
          createdTenant = await this.companyService.createCompany(payload)
          // eslint-disable-next-line no-console
          console.info(`[ONBOARDING] ✅ Created tenant during onboarding:`, {
            tenantId: createdTenant?.id,
            name: createdTenant?.name,
            subdomain: createdTenant?.subdomain,
            userId,
            hasUsers: !!createdTenant?.users
          })
        } catch (e) {
          // Best-effort only: log and continue; failing company creation should not block onboarding
          // eslint-disable-next-line no-console
          console.error('[ONBOARDING] ❌ Failed to create company during onboarding (non-fatal):', e?.message || e, e?.stack)
          // Increment a lightweight metric so we can alert on repeated failures in production
          try { incMetric('onboarding.company_creation_failure') } catch (err) { /* no-op */ }
        }
      } catch (e) {
        // Best-effort only: log and continue; failing company creation should not block onboarding
        // eslint-disable-next-line no-console
        console.warn('Failed to create company during onboarding (non-fatal):', e?.message || e)
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
    // Return the created tenant (if any) so callers can wait for consistency
    return { success: true, company: createdTenant || null }
  }

  async isComplete(userId: string) {
    return this.onboardingRepository.isComplete(userId)
  }
}
