import apiClient from '@/lib/api-client'

export interface TaxCodeRate {
  id: string
  taxCodeId: string
  taxRateId: string
  companyId: string
  ratePct: string
  sequence: number
  taxRate?: {
    id: string
    name: string
    rate: string
    taxType?: string
  }
}

export interface TaxRate {
  id: string
  companyId: string
  countryId?: string | null
  jurisdictionId?: string | null
  name: string
  rate: string
  jurisdictionLevel?: string | null
  taxType?: string | null
  thresholdAmount?: string | null
  exemptionAmount?: string | null
  effectiveFrom: string
  effectiveTo?: string | null
  isCompound: boolean
  createdAt: string
  deletedAt?: string | null
}

export interface TaxCode {
  id: string
  companyId: string
  code: string
  name: string
  isDefault: boolean
  createdAt: string
  rates: TaxCodeRate[]
}

export interface CreateTaxRateDto {
  name: string
  rate: number
  taxType: string
  effectiveFrom: string
  effectiveTo?: string
}

export interface CreateTaxCodeDto {
  code: string
  name: string
  isDefault?: boolean
  rates?: { taxRateId: string; ratePct: number }[]
}

export const taxService = {
  listRates: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/tax/rates`),

  createRate: (companyId: string, data: CreateTaxRateDto) =>
    apiClient.post(`/companies/${companyId}/tax/rates`, data),

  listCodes: (companyId: string, search?: string) => {
    const params: Record<string, string> = {}
    if (search) params.search = search
    return apiClient.get(`/companies/${companyId}/tax/codes`, { params })
  },

  createCode: (companyId: string, data: CreateTaxCodeDto) =>
    apiClient.post(`/companies/${companyId}/tax/codes`, data),
}
