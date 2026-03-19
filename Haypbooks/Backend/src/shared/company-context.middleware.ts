import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { runWithContext } from './async-context'

@Injectable()
export class CompanyContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const companyId = (req.params as any)?.companyId || req.body?.companyId || req.query?.companyId
    const workspaceId = (req as any).companyWorkspaceId
    const userId = (req as any).user?.userId || (req as any).user?.id

    return runWithContext({ companyId, workspaceId, userId }, () => next())
  }
}
