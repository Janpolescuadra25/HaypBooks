const { PrismaClient } = require('@prisma/client')

;(async () => {
  const p = new PrismaClient()
  try {
    const tables = [
      'AccountSubType','AccountType','Account','Invoice','Budget','FixedAsset','BudgetLine','FixedAssetDepreciation',
      'ApiTokenRevocation','Currency','ExchangeRate','JobAttempt','DeadLetter','OnboardingStep','Otp','SchemaMigration','Session','TaxJurisdiction','User','UserSecurityEvent'
    ]
    const res = await p.$queryRawUnsafe(`select relname, relrowsecurity::text as rls_enabled from pg_class where relname = any(array[${tables.map(t => `'${t}'`).join(',')}])`)
    console.table(res)
  } catch (e) {
    console.error('Error checking RLS', e)
  } finally {
    await p.$disconnect()
  }
})()
