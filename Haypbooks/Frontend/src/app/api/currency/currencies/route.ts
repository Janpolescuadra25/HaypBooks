import { NextResponse } from 'next/server'

const currencies = [
  { id: 'cur-usd', code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2, isActive: true },
  { id: 'cur-php', code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimalPlaces: 2, isActive: true },
  { id: 'cur-eur', code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2, isActive: true },
  { id: 'cur-gbp', code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2, isActive: true },
  { id: 'cur-jpy', code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0, isActive: true },
  { id: 'cur-aud', code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalPlaces: 2, isActive: true },
  { id: 'cur-cad', code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', decimalPlaces: 2, isActive: true },
  { id: 'cur-chf', code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimalPlaces: 2, isActive: true },
  { id: 'cur-cny', code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalPlaces: 2, isActive: true },
  { id: 'cur-sgd', code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalPlaces: 2, isActive: true },
  { id: 'cur-hkd', code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimalPlaces: 2, isActive: true },
  { id: 'cur-krw', code: 'KRW', name: 'South Korean Won', symbol: '₩', decimalPlaces: 0, isActive: true },
  { id: 'cur-thb', code: 'THB', name: 'Thai Baht', symbol: '฿', decimalPlaces: 2, isActive: true },
  { id: 'cur-inr', code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2, isActive: true },
  { id: 'cur-aed', code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'د.إ', decimalPlaces: 2, isActive: true },
]

export async function GET() {
  return NextResponse.json(currencies)
}
