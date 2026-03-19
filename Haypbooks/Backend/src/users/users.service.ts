import { Injectable, Inject } from '@nestjs/common'
import { IUserRepository } from '../repositories/interfaces/user.repository.interface'
import { USER_REPOSITORY } from '../repositories/prisma/prisma-repositories.module'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService,
  ) { }

  async findById(id: string) {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('User not found')
    }
    const { password, ...result } = user as any

    // Fetch companies and practices directly via the user's workspace
    let uniqueCompanies: any[] = []
    let uniquePractices: any[] = []
    let ownedWorkspaceId: string | null = null
    try {
      // Find the workspace owned by this user
      const workspace = await this.prisma.workspace.findUnique({
        where: { ownerUserId: id },
        include: { companies: true, practices: true }
      })
      if (workspace) {
        ownedWorkspaceId = workspace.id
        uniqueCompanies = workspace.companies || []
        uniquePractices = workspace.practices || []
      }
      // Also check workspaces where user is a member
      const memberWorkspaces = await this.prisma.workspaceUser.findMany({
        where: { userId: id },
        include: { workspace: { include: { companies: true, practices: true } } }
      })
      for (const wu of memberWorkspaces) {
        const wc = wu.workspace?.companies || []
        const wp = wu.workspace?.practices || []
        uniqueCompanies.push(...wc)
        uniquePractices.push(...wp)
      }
      // Deduplicate
      uniqueCompanies = Array.from(new Map(uniqueCompanies.map((c: any) => [c.id, c])).values())
      uniquePractices = Array.from(new Map(uniquePractices.map((p: any) => [p.id, p])).values())
    } catch (e) {
      console.error('[USER-PROFILE] Error fetching workspace data:', e?.message || e)
    }

    console.log(`[USER-PROFILE] userId=${id} companies=${uniqueCompanies.length} practices=${uniquePractices.length}`)

    // Ensure required fields for frontend are present
    return {
      ...result,
      companies: uniqueCompanies,
      practices: uniquePractices,
      ownedWorkspaceId,
      // Back-compat: global flag
      onboardingCompleted: result.onboardingComplete ?? false,
      onboardingMode: result.onboardingMode || 'full',
      // Per-hub flags
      ownerOnboardingCompleted: (result as any).ownerOnboardingComplete ?? false,
      accountantOnboardingCompleted: (result as any).accountantOnboardingComplete ?? false,
    }
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new Error('User not found')
    }
    const { password, ...result } = user
    return result
  }

  async setPreferredHub(userId: string, preferredHub: 'OWNER' | 'ACCOUNTANT') {
    const updated = await this.userRepository.update(userId, { preferredHub } as any)
    const { password, ...result } = updated
    return result
  }

  async updatePhone(userId: string, phone: string) {
    // Normalize phone and compute HMAC if available
    const normalize = require('../utils/phone.util').normalizePhoneOrThrow
    let normalized: string
    try { normalized = normalize(phone) } catch (e) { throw e }

    let phoneHmac: string | undefined = undefined
    try { phoneHmac = require('../utils/hmac.util').hmacPhone(normalized) } catch (e) { phoneHmac = undefined }

    const updated = await this.userRepository.update(userId, { phone: normalized, phoneHmac } as any)
    const { password, ...result } = updated
    return result
  }

  async updateProfile(userId: string, data: { companyName?: string } = {}) {
    // If companyName is provided, persist it as the 'business' onboarding step so that
    // POST /api/onboarding/complete can proceed without requiring a separate save call.
    if (data.companyName) {
      const trimmed = String(data.companyName).trim().slice(0, 140)
      if (trimmed) {
        try {
          const existingData = await this.prisma.onboardingData.findUnique({ where: { userId } })
          const existingSteps: Record<string, any> = (existingData?.steps as Record<string, any>) || {}
          const updatedSteps = { ...existingSteps, business: { ...(existingSteps.business || {}), companyName: trimmed } }
          await this.prisma.onboardingData.upsert({
            where: { userId },
            create: { userId, steps: updatedSteps, complete: false },
            update: { steps: updatedSteps },
          })
        } catch (e) { /* non-fatal — ignore */ }
      }
    }
    const updated = await this.userRepository.update(userId, {})
    const { password, ...result } = updated
    return result
  }

  async setPreferredWorkspace(userId: string, body: { type: 'company' | 'practice', id?: string }) {
    const preferredHub = body.type === 'company' ? 'OWNER' : 'ACCOUNTANT'
    const updated = await this.userRepository.update(userId, { preferredHub } as any)
    const { password, ...result } = updated
    return result
  }
}
