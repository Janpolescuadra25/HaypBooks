import apiClient from '@/lib/api-client'

export interface CurrencyDefinition {
  id: string
  code: string
  name: string
  symbol: string
  decimalPlaces: number
  isActive: boolean
}

export interface ExchangeRateResponse {
  fromCurrencyCode: string
  toCurrencyCode: string
  rate: number
  source: string
  fetchedAt: string
}

export const currencyService = {
  listCurrencies: () => apiClient.get<CurrencyDefinition[]>('/currency/currencies'),
  getCurrency: (code: string) => apiClient.get<CurrencyDefinition>(`/currency/currencies/${encodeURIComponent(code)}`),
  getAutoExchangeRate: (fromCurrencyCode: string, toCurrencyCode: string) =>
    apiClient.get<ExchangeRateResponse>('/currency/exchange-rates/auto', {
      params: { fromCurrencyCode, toCurrencyCode },
    }),
}
