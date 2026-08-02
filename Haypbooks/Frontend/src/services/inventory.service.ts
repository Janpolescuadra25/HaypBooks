import apiClient from '@/lib/api-client'

export const inventoryService = {
  getFixedAssets: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/inventory/assets`),

  getFixedAsset: (companyId: string, assetId: string) =>
    apiClient.get(`/companies/${companyId}/inventory/assets/${assetId}`),

  getDepreciationSchedule: (companyId: string, assetId: string) =>
    apiClient.get(`/companies/${companyId}/inventory/assets/${assetId}/schedule`),

  getAssetCategories: (companyId: string) =>
    apiClient.get(`/companies/${companyId}/inventory/asset-categories`),
}
