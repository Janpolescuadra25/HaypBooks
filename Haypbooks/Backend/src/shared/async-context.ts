import { AsyncLocalStorage } from 'node:async_hooks'

export type RequestContext = {
  companyId?: string
  workspaceId?: string
  userId?: string
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>()

export function runWithContext<T>(ctx: RequestContext, fn: () => Promise<T> | T) {
  return asyncLocalStorage.run(ctx, fn)
}

export function getRequestContext(): RequestContext {
  return asyncLocalStorage.getStore() ?? {}
}

export function setRequestContext(values: Partial<RequestContext>) {
  const store = asyncLocalStorage.getStore()
  if (!store) return
  Object.assign(store, values)
}

export function getCompanyId(): string | undefined {
  return getRequestContext().companyId
}

export function getWorkspaceId(): string | undefined {
  return getRequestContext().workspaceId
}

export function getUserId(): string | undefined {
  return getRequestContext().userId
}
