import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'

export default function requestIdMiddleware(req: Request & { requestId?: string }, res: Response, next: NextFunction) {
  try {
    const existing = (req.headers['x-request-id'] as string) || (req.headers['x-requestid'] as string)
    const id = existing || (typeof randomUUID === 'function' ? randomUUID() : `${Date.now()}`)
    req.headers['x-request-id'] = id
    req.requestId = id
    res.setHeader('X-Request-Id', id)
  } catch (e) {
    // best-effort; don't block the request
  }
  next()
}
