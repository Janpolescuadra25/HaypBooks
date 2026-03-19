import { promises as fs } from 'fs'
import path from 'path'

const TEMPLATE_PATH = path.join(process.cwd(), 'config', 'coa-templates.json')

export type CoaTemplateLine = {
  code: string
  name: string
  typeKey: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE'
  normalSide: 'DEBIT' | 'CREDIT'
  isHeader: boolean
  parentCode?: string
  liquidityType?: string
}

export type CoaTemplate = {
  id: string
  name: string
  description: string
  industryKeywords: string[]
  lines: CoaTemplateLine[]
}

export async function readTemplates(): Promise<CoaTemplate[]> {
  const raw = await fs.readFile(TEMPLATE_PATH, 'utf-8')
  return JSON.parse(raw) as CoaTemplate[]
}

export async function writeTemplates(templates: CoaTemplate[]) {
  await fs.writeFile(TEMPLATE_PATH, JSON.stringify(templates, null, 2), 'utf-8')
}
