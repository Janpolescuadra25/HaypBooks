import type { InvoiceTemplate, TemplateFormData } from './types'
import { DEFAULT_TEMPLATES } from './defaultTemplates'

const STORAGE_KEY = 'haypbooks_invoice_templates'

function load(): InvoiceTemplate[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(templates: InvoiceTemplate[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

export function getAllTemplates(): InvoiceTemplate[] {
  const user = load()
  return [...DEFAULT_TEMPLATES, ...user]
}

export function getUserTemplates(): InvoiceTemplate[] {
  return load()
}

export function getDefaultTemplate(): InvoiceTemplate {
  const all = getAllTemplates()
  return all.find(t => t.isDefault) ?? DEFAULT_TEMPLATES[0]
}

export function saveTemplate(data: TemplateFormData): InvoiceTemplate {
  const templates = load()
  const now = new Date().toISOString()
  const template: InvoiceTemplate = {
    ...data,
    id: `user-${Date.now()}`,
    isBuiltIn: false,
    createdAt: now,
    updatedAt: now,
    usageCount: 0,
  }
  if (template.isDefault) {
    // Unset default on all others
    templates.forEach(t => { t.isDefault = false })
    DEFAULT_TEMPLATES.forEach(t => { t.isDefault = false })
  }
  save([...templates, template])
  return template
}

export function updateTemplate(id: string, data: Partial<TemplateFormData>): InvoiceTemplate | null {
  const templates = load()
  const idx = templates.findIndex(t => t.id === id)
  if (idx === -1) return null
  const now = new Date().toISOString()
  if (data.isDefault) {
    templates.forEach(t => { t.isDefault = false })
    DEFAULT_TEMPLATES.forEach(t => { t.isDefault = false })
  }
  templates[idx] = { ...templates[idx], ...data, updatedAt: now }
  save(templates)
  return templates[idx]
}

export function deleteTemplate(id: string): boolean {
  const templates = load()
  const filtered = templates.filter(t => t.id !== id)
  if (filtered.length === templates.length) return false
  save(filtered)
  return true
}

export function duplicateTemplate(id: string): InvoiceTemplate | null {
  const all = getAllTemplates()
  const src = all.find(t => t.id === id)
  if (!src) return null
  const now = new Date().toISOString()
  const copy: InvoiceTemplate = {
    ...src,
    id: `user-${Date.now()}`,
    name: `${src.name} (Copy)`,
    isBuiltIn: false,
    isDefault: false,
    isDraft: false,
    createdAt: now,
    updatedAt: now,
    usageCount: 0,
  }
  const templates = load()
  save([...templates, copy])
  return copy
}

export function setDefaultTemplate(id: string): void {
  const templates = load()
  // Clear built-in defaults
  DEFAULT_TEMPLATES.forEach(t => { t.isDefault = t.id === id })
  // Clear user defaults
  templates.forEach(t => { t.isDefault = t.id === id })
  save(templates)
}

export function recordTemplateUsage(id: string): void {
  const templates = load()
  const idx = templates.findIndex(t => t.id === id)
  if (idx !== -1) {
    templates[idx].usageCount = (templates[idx].usageCount ?? 0) + 1
    templates[idx].lastUsedAt = new Date().toISOString()
    save(templates)
  }
  // Also update last-used on built-in
  const bi = DEFAULT_TEMPLATES.find(t => t.id === id)
  if (bi) {
    bi.usageCount = (bi.usageCount ?? 0) + 1
    bi.lastUsedAt = new Date().toISOString()
  }
}

export function exportTemplate(template: InvoiceTemplate): string {
  return JSON.stringify(template, null, 2)
}

export function importTemplate(json: string): InvoiceTemplate | null {
  try {
    const data = JSON.parse(json) as Partial<InvoiceTemplate>
    if (!data.name || !data.colors || !data.defaults) return null
    const now = new Date().toISOString()
    const template: InvoiceTemplate = {
      ...data,
      id: `user-${Date.now()}`,
      isBuiltIn: false,
      isDefault: false,
      isDraft: false,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
    } as InvoiceTemplate
    const templates = load()
    save([...templates, template])
    return template
  } catch {
    return null
  }
}
