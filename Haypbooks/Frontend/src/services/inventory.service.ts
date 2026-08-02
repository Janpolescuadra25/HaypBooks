import apiClient from '@/lib/api-client'

export const inventoryService = {
  getFixedAssets: (companyId: string, status?: string) =>
    apiClient.get(`/companies/${companyId}/inventory/assets`, { params: status ? { status } : undefined }),

  getFixedAsset: (companyId: string, assetId: string) =>
    apiClient.get(`/companies/${companyId}/inventory/assets/${assetId}`),

  getDepreciationSchedule: (companyId: string, assetId: string) =>
    apiClient.get(`/companies/${companyId}/inventory/assets/${assetId}/schedule`),

  runDepreciation: (companyId: string, assetId: string, body: { periodStart: string; periodEnd: string }) =>
    apiClient.post(`/companies/${companyId}/inventory/assets/${assetId}/depreciate`, body),

  getAssetCategories: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/inventory/asset-categories`),
}
