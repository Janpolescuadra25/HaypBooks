import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// debug: log queries to inspect any incorrect SQL
;(prisma as any).$on('query', (e:any) => {
  console.log('PRISMA_QUERY:', e.query)
})

async function main() {
  // Create demo tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Inventory Demo',
      subdomain: `inventory-demo-${Math.random().toString(36).slice(2, 7)}`,
      baseCurrency: 'USD'
    }
  })

  // Ensure there's a company ID available if companyId is required
  let seedCompanyId: string | null = null
  try {
    const colRes = await prisma.$queryRaw`SELECT is_nullable FROM information_schema.columns WHERE table_name = 'StockLocation' AND column_name = 'companyId'`
    if (Array.isArray(colRes) && colRes.length > 0) {
      if (colRes[0].is_nullable === 'NO') {
        // Create or reuse a company for this demo tenant
        // prefer existing company for tenant if present to avoid unique name/ID conflicts
        let company = await prisma.company.findFirst({ where: { tenantId: tenant.id } })
        if (!company) {
          company = await prisma.company.create({ data: { id: `${tenant.id}-company`, tenantId: tenant.id, name: `Default Company ${tenant.id}` } })
        }
        seedCompanyId = company.id
      }
    }
  } catch (err) {
    // if the query fails for older DB variants, default to null
    seedCompanyId = null
  }

  // Create a default stock location
  const warehouse = await prisma.stockLocation.create({
    data: {
      tenantId: tenant.id,
      ...(seedCompanyId ? { companyId: seedCompanyId } : { companyId: null }),
      name: 'Main Warehouse',
      description: 'Primary inventory location',
      isDefault: true
    }
  })

  // Create an item
  const item1 = await prisma.item.create({
    data: {
      tenantId: tenant.id,
      sku: 'ITEM-001',
      name: 'Widget A',
      type: 'INVENTORY'
    }
  })

  // Create GL accounts for inventory
  const assetType = await prisma.accountType.upsert({ where: { id: 1 }, update: {}, create: { id: 1, name: 'ASSET' } })
  const expenseType = await prisma.accountType.upsert({ where: { id: 2 }, update: {}, create: { id: 2, name: 'EXPENSE' } })
  const otherType = await prisma.accountType.upsert({ where: { id: 5 }, update: {}, create: { id: 5, name: 'OTHER' } })
  const assetAcct = await prisma.account.create({ data: { tenantId: tenant.id, code: '1400', name: 'Inventory Asset', typeId: assetType.id } })
  const cogsAcct = await prisma.account.create({ data: { tenantId: tenant.id, code: '5100', name: 'Cost of Goods Sold', typeId: expenseType.id } })
  const invSuspense = await prisma.account.create({ data: { tenantId: tenant.id, code: 'INV-SUSPENSE', name: 'Inventory Suspense', typeId: otherType.id } })

  // Update item to map GL accounts
  await prisma.item.update({ where: { id: item1.id }, data: { inventoryAssetAccountId: assetAcct.id, cogsAccountId: cogsAcct.id } })

  // Create initial stock level
  await prisma.stockLevel.create({
    data: {
      tenantId: tenant.id,
      ...(seedCompanyId ? { companyId: seedCompanyId } : { companyId: null }),
      itemId: item1.id,
      stockLocationId: warehouse.id,
      quantity: 100,
      reserved: 0
    }
  })

  // Create inventory receipt transaction
  try {
    await prisma.inventoryTransaction.create({
      data: {
        tenantId: tenant.id,
        ...(seedCompanyId ? { companyId: seedCompanyId } : { companyId: null }),
        transactionNumber: 'RCPT-1001',
        type: 'RECEIPT',
        reference: 'Initial stock',
        lines: {
          create: [
            {
              tenantId: tenant.id,
              ...(seedCompanyId ? { companyId: seedCompanyId } : { companyId: null }),
              itemId: item1.id,
              stockLocationId: warehouse.id,
              qty: 100,
              unitCost: 10.0,
              lineType: 'RECEIPT_LINE'
            }
          ]
        }
      },
      // select only id to avoid requesting migrations-added columns that may be absent
      select: { id: true }
    })
  } catch (err:any) {
    // fallback to raw SQL if the schema is missing newly added columns
    if (err && err.code === 'P2022') {
      // INSERT transaction and return id, casting tenantId to uuid if needed
      // generate ids for transaction and line (prisma usually generates IDs automatically)
      const rawTxId = `${tenant.id}-invtx-${Math.random().toString(36).slice(2,9)}`
      const txInsertRes = await prisma.$queryRawUnsafe(`INSERT INTO public."InventoryTransaction" ("id","tenantId","companyId","transactionNumber","type","reference") VALUES ($1,$2::uuid,$3,$4,$5,$6) RETURNING id`,
        rawTxId, tenant.id, seedCompanyId, 'RCPT-1001', 'RECEIPT', 'Initial stock')
      let txId: string | null = null
      if (Array.isArray(txInsertRes) && txInsertRes.length > 0) txId = (txInsertRes as any)[0].id
      if (txId) {
        const rawLineId = `${tenant.id}-invtxline-${Math.random().toString(36).slice(2,9)}`
        const txLineInsert = await prisma.$queryRawUnsafe(`INSERT INTO public."InventoryTransactionLine" ("id","tenantId","companyId","transactionId","itemId","stockLocationId","qty","unitCost","lineType") VALUES ($1,$2::uuid,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
          rawLineId, tenant.id, seedCompanyId, txId, item1.id, warehouse.id, 100, 10.0, 'RECEIPT_LINE')
      }
    } else {
      throw err
    }
  }
  // create a cost layer for this initial stock
  const txLine = await prisma.inventoryTransactionLine.findFirst({ where: { tenantId: tenant.id, itemId: item1.id } })
  if (txLine) {
    await prisma.inventoryCostLayer.create({ data: { tenantId: tenant.id, itemId: item1.id, inventoryTxLineId: txLine.id, quantity: 100, remainingQty: 100, unitCost: 10.0 } })
  }

  console.log('Seeded inventory demo tenant:', tenant.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })