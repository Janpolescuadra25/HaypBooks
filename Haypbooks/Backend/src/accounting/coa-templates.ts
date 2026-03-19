import { readTemplates, writeTemplates, CoaTemplate } from './coa-templates.store'
export type { CoaTemplate } from './coa-templates.store'

export type CoaTemplateLine = {
  code: string
  name: string
  typeKey: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE'
  normalSide: 'DEBIT' | 'CREDIT'
  isHeader: boolean
  parentCode?: string
  liquidityType?: string
}

export async function listTemplates() {
  const templates = await readTemplates()
  return templates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    industryKeywords: t.industryKeywords,
    lines: t.lines,
    exampleAccounts: t.lines.slice(0, 6).map(l => `${l.code} · ${l.name}`),
  }))
}

export async function findTemplateForIndustry(industry?: string | null): Promise<CoaTemplate> {
  const templates = await readTemplates()
  const base = templates.find(t => t.id === 'base')!
  if (!industry) return base
  const normalized = String(industry).trim().toLowerCase()
  const match = templates.find(t =>
    t.industryKeywords.some(k => normalized.includes(k.toLowerCase()))
  )
  return match ?? base
}

export async function writeTemplatesToDisk(templates: CoaTemplate[]) {
  return writeTemplates(templates)
}
