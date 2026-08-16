import { Controller, Get, Post, Body, Query, Param, UseGuards, NotFoundException } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ExchangeRateService } from './exchange-rate.service'
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto'
import { ConvertAmountDto } from './dto/convert-amount.dto'
import { FetchRateDto } from './dto/fetch-rate.dto'
import { Prisma } from '@prisma/client'

@UseGuards(JwtAuthGuard)
@Controller('api/currency')
export class CurrencyController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get('currencies')
  async listCurrencies() {
    return this.exchangeRateService.getActiveCurrencies()
  }

  @Get('currencies/:code')
  async getCurrency(@Param('code') code: string) {
    const currencies = await this.exchangeRateService.getActiveCurrencies()
    const currency = currencies.find((item) => item.code.toUpperCase() === code.toUpperCase())
    if (!currency) throw new NotFoundException('Currency not found')
    return currency
  }

  @Post('exchange-rates')
  async createExchangeRate(@Body() body: CreateExchangeRateDto) {
    return this.exchangeRateService.createExchangeRate({
      fromCurrencyCode: body.fromCurrencyCode,
      toCurrencyCode: body.toCurrencyCode,
      rate: new Prisma.Decimal(body.rate),
      source: body.source ?? 'manual',
    })
  }

  @Get('exchange-rates')
  async getExchangeRate(
    @Query('from') fromCurrencyCode: string,
    @Query('to') toCurrencyCode: string,
    @Query('date') date?: string,
  ) {
    const rate = await this.exchangeRateService.getExchangeRate(fromCurrencyCode, toCurrencyCode, date ? new Date(date) : undefined)
    return {
      fromCurrencyCode,
      toCurrencyCode,
      rate,
      date: date ?? new Date().toISOString(),
    }
  }

  @Get('exchange-rates/auto')
  async getAutoExchangeRate(@Query() query: FetchRateDto) {
    const rate = await this.exchangeRateService.fetchAutoExchangeRate(query.fromCurrencyCode, query.toCurrencyCode)
    return {
      fromCurrencyCode: query.fromCurrencyCode,
      toCurrencyCode: query.toCurrencyCode,
      rate,
      source: 'auto',
      fetchedAt: new Date().toISOString(),
    }
  }

  @Post('exchange-rates/convert')
  async convertAmount(@Body() body: ConvertAmountDto) {
    const convertedAmount = await this.exchangeRateService.convertAmount(
      new Prisma.Decimal(body.amount),
      body.fromCurrencyCode,
      body.toCurrencyCode,
      body.date ? new Date(body.date) : undefined,
    )
    const rate = await this.exchangeRateService.getExchangeRate(body.fromCurrencyCode, body.toCurrencyCode, body.date ? new Date(body.date) : undefined)
    return {
      originalAmount: body.amount,
      convertedAmount,
      fromCurrencyCode: body.fromCurrencyCode,
      toCurrencyCode: body.toCurrencyCode,
      exchangeRate: rate,
    }
  }
}
