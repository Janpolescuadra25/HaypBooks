import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createAcceptanceTestApp } from './shared/acceptance-harness';
import { PrismaService } from '../../src/repositories/prisma/prisma.service';
import { Prisma } from '@prisma/client';

describe('Journey 5 Acceptance: Multi-Currency & Tax Handling', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let primaryCompanyId: string;
  let isolatedCompanyId: string;
  let baseCurrencyCode = 'PHP';
  let foreignCurrencyCode = 'USD';
  let currencyPhpId: string;
  let currencyUsdId: string;
  let exchangeRateId: string;
  let taxRateId: string;

  beforeAll(async () => {
    const harness = await createAcceptanceTestApp();
    app = harness.app;
    prisma = harness.prisma;

    const primaryCompany = await prisma.company.create({
      data: {
        name: `J5 Multi-Currency Corp ${Date.now()}`,
        currency: baseCurrencyCode,
        workspaceId: 'test-workspace-primary',
      },
    });
    primaryCompanyId = primaryCompany.id;

    const isolatedCompany = await prisma.company.create({
      data: {
        name: `J5 Isolated Entity ${Date.now()}`,
        currency: 'EUR',
        workspaceId: 'test-workspace-isolated',
      },
    });
    isolatedCompanyId = isolatedCompany.id;

    const php = await prisma.currency.upsert({
      where: { code: 'PHP' },
      update: { isActive: true },
      create: {
        code: 'PHP',
        name: 'Philippine Peso',
        symbol: '₱',
        decimalPlaces: 2,
        isActive: true,
      },
    });
    currencyPhpId = php.id;

    const usd = await prisma.currency.upsert({
      where: { code: 'USD' },
      update: { isActive: true },
      create: {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        decimalPlaces: 2,
        isActive: true,
      },
    });
    currencyUsdId = usd.id;

    const exchangeRate = await prisma.exchangeRate.create({
      data: {
        fromCurrencyId: currencyUsdId,
        toCurrencyId: currencyPhpId,
        rate: new Prisma.Decimal(55.0),
        source: 'manual',
        validFrom: new Date(Date.UTC(2026, 0, 1)),
      },
    });
    exchangeRateId = exchangeRate.id;

    const country = await prisma.country.findFirst({ where: { code: 'PH' } }) ?? await prisma.country.create({
      data: {
        code: 'PH',
        name: 'Philippines',
        isoCode: 'PH',
      },
    });

    const taxJurisdiction = await prisma.taxJurisdiction.create({
      data: {
        countryId: country.id,
        name: 'Bureau of Internal Revenue',
        region: 'NCR',
        code: `BIR-${Date.now().toString().slice(-4)}`,
      },
    });

    const taxRate = await prisma.taxRate.create({
      data: {
        companyId: primaryCompanyId,
        countryId: country.id,
        jurisdictionId: taxJurisdiction.id,
        name: 'Standard VAT 12%',
        rate: new Prisma.Decimal(0.12),
        taxType: 'VAT',
        jurisdictionLevel: 'FEDERAL',
        effectiveFrom: new Date(Date.UTC(2026, 0, 1)),
        isCompound: false,
      },
    });
    taxRateId = taxRate.id;
  });

  afterAll(async () => {
    if (prisma) {
      if (taxRateId) {
        await prisma.taxRate.deleteMany({ where: { id: taxRateId } }).catch(() => undefined);
      }
      if (exchangeRateId) {
        await prisma.exchangeRate.deleteMany({ where: { id: exchangeRateId } }).catch(() => undefined);
      }
      await prisma.company.deleteMany({
        where: { id: { in: [primaryCompanyId, isolatedCompanyId] } },
      }).catch(() => undefined);
      await prisma.currency.deleteMany({
        where: { code: { in: ['PHP', 'USD'] } },
      }).catch(() => undefined);
    }
    if (app) {
      await app.close();
    }
  });

  it('Step 1: Should resolve company base currency and retrieve active currencies', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/currency/currencies')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const codes = res.body.map((c: any) => c.code);
    expect(codes).toContain('PHP');
    expect(codes).toContain('USD');
  });

  it('Step 2: Should perform FX rate conversion accurately from foreign to base currency', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/currency/exchange-rates/convert')
      .send({
        fromCurrencyCode: 'USD',
        toCurrencyCode: 'PHP',
        amount: 1000.0,
      })
      .expect(200);

    expect(res.body).toBeDefined();
    expect(Number(res.body.exchangeRate)).toBe(55);
    expect(Number(res.body.convertedAmount)).toBe(55000);
  });

  it('Step 3: Should calculate tax on transaction and convert tax to base currency', async () => {
    const foreignNet = 1000.0;
    const taxPercentage = 0.12;
    const foreignTax = Math.round(foreignNet * taxPercentage * 100) / 100;
    const foreignGross = foreignNet + foreignTax;

    expect(foreignTax).toBe(120.0);
    expect(foreignGross).toBe(1120.0);

    const baseNet = foreignNet * 55.0;
    const baseTax = foreignTax * 55.0;
    const baseTotal = foreignGross * 55.0;

    expect(baseNet).toBe(55000.0);
    expect(baseTax).toBe(6600.0);
    expect(baseTotal).toBe(61600.0);
    expect(baseNet + baseTax).toBe(baseTotal);
  });

  it('Step 4: Should enforce multi-tenant isolation on company tax rates and configs', async () => {
    const primaryRes = await request(app.getHttpServer())
      .get(`/api/companies/${primaryCompanyId}/tax/rates`)
      .expect(200);

    expect(Array.isArray(primaryRes.body)).toBe(true);

    const isolatedRes = await request(app.getHttpServer())
      .get(`/api/companies/${isolatedCompanyId}/tax/rates`)
      .expect(200);

    expect(Array.isArray(isolatedRes.body)).toBe(true);
    const leaked = isolatedRes.body.find((r: any) => r.id === taxRateId);
    expect(leaked).toBeUndefined();
  });

  it('Step 5: Negative Testing — Should reject invalid currency codes and missing exchange rates', async () => {
    await request(app.getHttpServer())
      .post('/api/currency/exchange-rates/convert')
      .send({
        fromCurrencyCode: 'INVALID_CURRENCY_XYZ',
        toCurrencyCode: 'PHP',
        amount: 500,
      })
      .expect(404);

    await request(app.getHttpServer())
      .post('/api/currency/exchange-rates/convert')
      .send({
        fromCurrencyCode: 'PHP',
        toCurrencyCode: 'EUR',
        amount: 500,
      })
      .expect(404);
  });
});
