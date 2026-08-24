import { SetMetadata } from '@nestjs/common'

export const WORKSPACE_TYPES_KEY = 'workspace-types'
export const RequireWorkspaceType = (...types: string[]) => SetMetadata(WORKSPACE_TYPES_KEY, types)
