import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import axios from 'axios'
import { Prisma, ExchangeRate } from '@prisma/client'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class ExchangeRateService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeCode(code: string): string {
    return String(code || '').trim().toUpperCase()
  }

  async getExchangeRate(fromCode: string, toCode: string, date?: Date): Promise<Prisma.Decimal | null> {
    const from = this.normalizeCode(fromCode)
    const to = this.normalizeCode(toCode)
    if (from === to) return new Prisma.Decimal(1)

    const targetDate = date ?? new Date()

    const fromCurrency = await this.prisma.currency.findFirst({ where: { code: from, isActive: true } })
    const toCurrency = await this.prisma.currency.findFirst({ where: { code: to, isActive: true } })

    if (!fromCurrency || !toCurrency) return null

    const rate = await this.prisma.exchangeRate.findFirst({
      where: {
        fromCurrencyId: fromCurrency.id,
        toCurrencyId: toCurrency.id,
        validFrom: { lte: targetDate },
        OR: [{ validTo: null }, { validTo: { gte: targetDate } }],
      },
      orderBy: { validFrom: 'desc' },
    })

    return rate?.rate ?? null
  }

  async convertAmount(amount: Prisma.Decimal, fromCode: string, toCode: string, date?: Date): Promise<Prisma.Decimal> {
    const from = this.normalizeCode(fromCode)
    const to = this.normalizeCode(toCode)
    if (from === to) return amount

    const rate = await this.getExchangeRate(from, to, date)
    if (!rate) throw new NotFoundException(`Exchange rate not found for ${from}/${to}`)

    return amount.mul(rate)
  }

  async createExchangeRate(data: { fromCurrencyCode: string; toCurrencyCode: string; rate: Prisma.Decimal; source?: string }): Promise<Prisma.ExchangeRateGetPayload<{ include: { fromCurrency: true; toCurrency: true } }>> {
    const fromCode = this.normalizeCode(data.fromCurrencyCode)
    const toCode = this.normalizeCode(data.toCurrencyCode)

    const fromCurrency = await this.prisma.currency.findFirst({ where: { code: fromCode, isActive: true } })
    if (!fromCurrency) throw new NotFoundException(`Currency not found: ${fromCode}`)

    const toCurrency = await this.prisma.currency.findFirst({ where: { code: toCode, isActive: true } })
    if (!toCurrency) throw new NotFoundException(`Currency not found: ${toCode}`)

    const now = new Date()
    await this.prisma.exchangeRate.updateMany({
      where: {
        fromCurrencyId: fromCurrency.id,
        toCurrencyId: toCurrency.id,
        validTo: null,
      },
      data: { validTo: now },
    })

    return this.prisma.exchangeRate.create({
      data: {
        fromCurrencyId: fromCurrency.id,
        toCurrencyId: toCurrency.id,
        rate: data.rate,
        source: data.source ?? 'manual',
        validFrom: now,
        validTo: null,
      },
      include: { fromCurrency: true, toCurrency: true },
    })
  }

  async getActiveCurrencies() {
    return this.prisma.currency.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } })
  }

  async fetchAutoExchangeRate(fromCode: string, toCode: string): Promise<Prisma.Decimal> {
    const from = this.normalizeCode(fromCode)
    const to = this.normalizeCode(toCode)
    if (from === to) return new Prisma.Decimal(1)

    const url = `https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`
    let response

    try {
      response = await axios.get(url)
    } catch (error: any) {
      throw new ServiceUnavailableException(`Failed to fetch exchange rates for ${from}: ${error?.message || 'network error'}`)
    }

    if (!response || !response.data) {
      throw new ServiceUnavailableException(`Exchange rate API returned no data for ${from}`)
    }

    const payload = response.data
    if (!payload || typeof payload !== 'object' || !payload.rates || typeof payload.rates !== 'object') {
      throw new ServiceUnavailableException('Invalid exchange rate API response format')
    }

    const rateValue = payload.rates?.[to]
    if (rateValue == null) {
      throw new ServiceUnavailableException(`Exchange rate not available for ${from}/${to}`)
    }

    try {
      return new Prisma.Decimal(rateValue)
    } catch (error: any) {
      throw new ServiceUnavailableException(`Invalid exchange rate value for ${from}/${to}`)
    }
  }
}
