export class BalanceSheetAccountDto {
  accountId!: string
  accountCode!: string
  accountName!: string
  balance!: number
}

export class BalanceSheetSectionDto {
  accounts!: BalanceSheetAccountDto[]
  total!: number
}

export class BalanceSheetReportDto {
  companyId!: string
  asOf!: Date
  generatedAt!: Date
  sections!: {
    assets: BalanceSheetSectionDto
    liabilities: BalanceSheetSectionDto
    equity: BalanceSheetSectionDto
  }
  totalAssets!: number
  totalLiabilities!: number
  totalEquity!: number
  isBalanced!: boolean
}
